import { AiLinkError } from '@/services/aiHeadquarters';
import type {
  BodyDiagnosticAssessment,
  BodyDiagnosticGoal,
  BodyDiagnosticRecord,
  BodyDiagnosticSourceKind,
} from '@/types/game';

const SUPPORTED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_SOURCE_BYTES = 16 * 1024 * 1024;
const MAX_REQUEST_BYTES = 24 * 1024 * 1024;

export interface PreparedDiagnosticImage {
  file: File;
  kind: BodyDiagnosticSourceKind;
}

export interface BodyDiagnosticResponse {
  model: string;
  assessment: BodyDiagnosticAssessment;
  usage: BodyDiagnosticRecord['usage'];
}

async function readJson(response: Response) {
  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) return undefined;
  return (await response.json()) as Record<string, unknown>;
}

function canvasBlob(canvas: HTMLCanvasElement, type: string, quality?: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('The image could not be prepared.'))),
      type,
      quality,
    );
  });
}

export async function prepareBodyDiagnosticImage(
  file: File,
  kind: BodyDiagnosticSourceKind,
): Promise<PreparedDiagnosticImage> {
  if (!SUPPORTED_IMAGE_TYPES.has(file.type)) {
    throw new Error('Use a JPG, PNG, or WEBP image for the Body Diagnostic.');
  }
  if (file.size <= 0 || file.size > MAX_SOURCE_BYTES) {
    throw new Error('Each Body Diagnostic image must be smaller than 16 MB.');
  }
  if (typeof createImageBitmap !== 'function' || typeof document === 'undefined') {
    return { file, kind };
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    if (file.size <= 8 * 1024 * 1024) return { file, kind };
    throw new Error('That image could not be prepared. Try a screenshot or a smaller photo.');
  }

  try {
    const maxDimension = kind === 'scale' ? 2_048 : 1_600;
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size <= 4 * 1024 * 1024) return { file, kind };
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('The image processor is unavailable.');
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await canvasBlob(canvas, 'image/jpeg', kind === 'scale' ? 0.92 : 0.86);
    const stem = file.name.replace(/\.[^.]+$/, '').slice(0, 80) || kind;
    return {
      kind,
      file: new File([blob], `${stem}.jpg`, { type: 'image/jpeg', lastModified: Date.now() }),
    };
  } finally {
    bitmap.close();
  }
}

export async function requestBodyDiagnostic(input: {
  images: PreparedDiagnosticImage[];
  goal: BodyDiagnosticGoal;
  hunterContext?: string;
  previous?: BodyDiagnosticRecord;
}): Promise<BodyDiagnosticResponse> {
  if (!input.images.length) throw new Error('Add at least one physique photo or scale screenshot.');
  const totalBytes = input.images.reduce((sum, image) => sum + image.file.size, 0);
  if (totalBytes > MAX_REQUEST_BYTES) {
    throw new Error('Those images are still too large together. Remove one and try again.');
  }

  const form = new FormData();
  form.append('goal', input.goal);
  form.append('hunterContext', input.hunterContext?.trim().slice(0, 800) ?? '');
  form.append('imageKinds', JSON.stringify(input.images.map((image) => image.kind)));
  if (input.previous) {
    form.append(
      'previous',
      JSON.stringify({
        date: input.previous.date,
        goal: input.previous.goal,
        summary: input.previous.assessment.summary,
        metrics: input.previous.assessment.metrics,
        priorities: input.previous.assessment.priorities,
      }),
    );
  }
  for (const image of input.images) form.append('images', image.file, image.file.name);

  let response: Response;
  try {
    response = await fetch('/api/ai/body-diagnostic', {
      method: 'POST',
      headers: { accept: 'application/json' },
      body: form,
    });
  } catch {
    throw new AiLinkError(
      'The diagnostic link could not be reached. No report was saved and your images remain on this device.',
      'network',
    );
  }

  const payload = await readJson(response);
  if (!response.ok) {
    throw new AiLinkError(
      typeof payload?.message === 'string'
        ? payload.message
        : 'The Training Hall could not complete that diagnostic.',
      typeof payload?.code === 'string' ? payload.code : 'diagnostic-failed',
    );
  }
  if (!payload || !payload.assessment || typeof payload.model !== 'string') {
    throw new AiLinkError('The diagnostic returned an unreadable report.', 'invalid-response');
  }
  const usage =
    payload.usage && typeof payload.usage === 'object'
      ? (payload.usage as Record<string, unknown>)
      : {};
  return {
    model: payload.model,
    assessment: payload.assessment as unknown as BodyDiagnosticAssessment,
    usage: {
      inputTokens: Number(usage.inputTokens ?? 0) || 0,
      cachedInputTokens: Number(usage.cachedInputTokens ?? 0) || 0,
      outputTokens: Number(usage.outputTokens ?? 0) || 0,
      reasoningTokens: Number(usage.reasoningTokens ?? 0) || 0,
      totalTokens: Number(usage.totalTokens ?? 0) || 0,
    },
  };
}
