import { db } from '@/db/database';
import type {
  ArcCanonSource,
  ArcCanonSourceKind,
  ArcCharacterRecord,
} from '@/types/game';

const MAX_ARC_FILE_BYTES = 2_500_000;
const MAX_ARC_WORD_FILE_BYTES = 12 * 1024 * 1024;
const MAX_ARC_KNOWLEDGE_PACK_BYTES = 18 * 1024 * 1024;
const MAX_ARC_KNOWLEDGE_PACK_TEXT = 12_000_000;
const MAX_ARC_KNOWLEDGE_PACK_SOURCES = 300;
const FORBIDDEN_KEYS = new Set(['__proto__', 'prototype', 'constructor']);

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function safeParse(text: string) {
  return JSON.parse(text, (key, value: unknown) => {
    if (FORBIDDEN_KEYS.has(key)) throw new Error('The archive file contains an unsafe property.');
    return value;
  }) as unknown;
}

function cleanText(value: unknown, maximum = 240) {
  return typeof value === 'string' ? value.trim().slice(0, maximum) : '';
}

function slug(value: string) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

function meaningful(value: unknown): boolean {
  if (Array.isArray(value)) return value.length > 0;
  if (isObject(value)) return Object.values(value).some(meaningful);
  if (typeof value === 'number') return value > 0;
  return Boolean(cleanText(value, 20_000));
}

function approximateCompletion(data: Record<string, unknown>) {
  const values = Object.entries(data)
    .filter(([key]) => key !== 'stats')
    .map(([, value]) => value);
  const stats = isObject(data.stats) ? Object.values(data.stats) : [];
  const fields = [...values, ...stats];
  return fields.length
    ? Math.round((fields.filter(meaningful).length / fields.length) * 100)
    : 0;
}

function extractDossierPayload(value: unknown) {
  if (!isObject(value)) throw new Error('That file is not an A.R.C. dossier.');
  const data = isObject(value.data) ? value.data : value;
  const schema = cleanText(value.schema, 100);
  if (schema && schema !== 'ARC_Profile_Template') {
    throw new Error('That JSON belongs to a different archive format.');
  }
  const name = cleanText(data.name, 200);
  if (!name) throw new Error('Every A.R.C. dossier needs a character name.');
  const meta = isObject(value.meta) ? value.meta : {};
  const version = Number(value.version ?? 4);
  const completion = Number(meta.completion);
  return {
    data,
    version: Number.isInteger(version) && version > 0 ? Math.min(version, 20) : 4,
    name,
    completion:
      Number.isFinite(completion) && completion >= 0 && completion <= 100
        ? Math.round(completion)
        : approximateCompletion(data),
    overallClass:
      cleanText(meta.overallClass, 80) || cleanText(data.overall_class, 80) || 'Uncalculated',
  };
}

export function createArcCharacterRecord(
  payload: unknown,
  sourceFileName?: string,
): ArcCharacterRecord {
  const parsed = extractDossierPayload(payload);
  const now = new Date().toISOString();
  return {
    id: `arc-character-${slug(parsed.name) || crypto.randomUUID()}`,
    name: parsed.name,
    alias: cleanText(parsed.data.alias, 240),
    style: cleanText(parsed.data.style, 100),
    faction: cleanText(parsed.data.faction, 240),
    overallClass: parsed.overallClass,
    startingClass: cleanText(parsed.data.starting_class, 80),
    endingClass: cleanText(parsed.data.ending_class, 80),
    completion: parsed.completion,
    schemaVersion: parsed.version,
    sourceFileName: sourceFileName?.slice(0, 260),
    data: parsed.data,
    createdAt: now,
    updatedAt: now,
  };
}

export async function saveArcCharacter(payload: unknown, sourceFileName?: string) {
  const candidate = createArcCharacterRecord(payload, sourceFileName);
  const existing = await db.arcCharacters.get(candidate.id);
  const record = { ...candidate, createdAt: existing?.createdAt ?? candidate.createdAt };
  await db.arcCharacters.put(record);
  window.dispatchEvent(new CustomEvent('system:arc-archives-changed'));
  return record;
}

export async function importArcDossierFile(file: File) {
  if (file.size > MAX_ARC_FILE_BYTES) throw new Error(`${file.name} is larger than 2.5 MB.`);
  return saveArcCharacter(safeParse(await file.text()), file.name);
}

export async function saveArcCanonSource(input: {
  title: string;
  kind: ArcCanonSourceKind;
  text: string;
  tags?: string[];
  characterNames?: string[];
  sourceFileName?: string;
}) {
  const title = input.title.trim().slice(0, 240);
  const text = input.text.trim().slice(0, MAX_ARC_FILE_BYTES);
  if (!title || !text) throw new Error('A canon source needs both a title and text.');
  const now = new Date().toISOString();
  const id = `arc-source-${slug(title) || crypto.randomUUID()}`;
  const existing = await db.arcCanonSources.get(id);
  const record: ArcCanonSource = {
    id,
    title,
    kind: input.kind,
    sourceFileName: input.sourceFileName?.slice(0, 260),
    tags: [...new Set((input.tags ?? []).map((tag) => tag.trim()).filter(Boolean))].slice(0, 80),
    characterNames: [
      ...new Set((input.characterNames ?? []).map((name) => name.trim()).filter(Boolean)),
    ].slice(0, 120),
    text,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  await db.arcCanonSources.put(record);
  window.dispatchEvent(new CustomEvent('system:arc-archives-changed'));
  return record;
}

export async function importArcCanonFile(file: File, kind: ArcCanonSourceKind = 'reference') {
  if (file.size > MAX_ARC_FILE_BYTES) throw new Error(`${file.name} is larger than 2.5 MB.`);
  const text = await file.text();
  if (!text.trim()) throw new Error(`${file.name} is empty or cannot be read as text.`);
  return saveArcCanonSource({
    title: file.name.replace(/\.[^.]+$/, ''),
    kind,
    text,
    sourceFileName: file.name,
  });
}

function readFileAsArrayBuffer(file: File) {
  if (typeof file.arrayBuffer === 'function') return file.arrayBuffer();
  return new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error(`${file.name} could not be read.`));
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) resolve(reader.result);
      else reject(new Error(`${file.name} could not be read as a Word document.`));
    };
    reader.readAsArrayBuffer(file);
  });
}

export async function importArcWordFile(file: File, kind: ArcCanonSourceKind = 'reference') {
  if (!file.name.toLowerCase().endsWith('.docx')) {
    throw new Error('Only modern .docx Word files are supported. Legacy .doc files must be saved as .docx first.');
  }
  if (file.size > MAX_ARC_WORD_FILE_BYTES) {
    throw new Error(`${file.name} is larger than the 12 MB Word-document limit.`);
  }
  const mammoth = await import('mammoth');
  const result = await mammoth.extractRawText({ arrayBuffer: await readFileAsArrayBuffer(file) });
  const text = result.value
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  if (!text) throw new Error(`${file.name} does not contain readable Word text.`);
  return saveArcCanonSource({
    title: file.name.replace(/\.docx$/i, ''),
    kind,
    text,
    tags: ['Word import'],
    sourceFileName: file.name,
  });
}

function isArcCanonSourceKind(value: unknown): value is ArcCanonSourceKind {
  return ['world-lore', 'faction', 'location', 'timeline', 'plot', 'reference'].includes(
    String(value),
  );
}

export async function importArcKnowledgePackFile(file: File) {
  if (file.size > MAX_ARC_KNOWLEDGE_PACK_BYTES) {
    throw new Error(`${file.name} is larger than the 18 MB Quill Knowledge Pack limit.`);
  }
  const payload = safeParse(await file.text());
  if (!isObject(payload) || payload.schema !== 'ARC_Knowledge_Pack' || payload.version !== 1) {
    throw new Error('That JSON is not a Quill Knowledge Pack.');
  }
  if (!Array.isArray(payload.sources) || !payload.sources.length) {
    throw new Error('That Quill Knowledge Pack contains no canon sources.');
  }
  if (payload.sources.length > MAX_ARC_KNOWLEDGE_PACK_SOURCES) {
    throw new Error(`A Quill Knowledge Pack can contain at most ${MAX_ARC_KNOWLEDGE_PACK_SOURCES} sources.`);
  }

  const inputs = payload.sources.map((value, index) => {
    if (!isObject(value)) throw new Error(`Knowledge Pack source ${index + 1} is not valid.`);
    const title = cleanText(value.title, 240);
    const text = cleanText(value.text, MAX_ARC_FILE_BYTES);
    if (!title || !text) {
      throw new Error(`Knowledge Pack source ${index + 1} needs both a title and readable text.`);
    }
    const kind = isArcCanonSourceKind(value.kind) ? value.kind : 'reference';
    return {
      title,
      kind,
      text,
      tags: Array.isArray(value.tags)
        ? value.tags.map((tag) => cleanText(tag, 120)).filter(Boolean)
        : [],
      characterNames: Array.isArray(value.characterNames)
        ? value.characterNames.map((name) => cleanText(name, 160)).filter(Boolean)
        : [],
      sourceFileName: cleanText(value.sourceFileName, 260) || file.name,
    };
  });
  const totalText = inputs.reduce((total, input) => total + input.text.length, 0);
  if (totalText > MAX_ARC_KNOWLEDGE_PACK_TEXT) {
    throw new Error('That Quill Knowledge Pack contains more than 12 million characters of lore.');
  }

  const now = new Date().toISOString();
  const ids = inputs.map((input) => `arc-source-${slug(input.title) || crypto.randomUUID()}`);
  const existing = await db.arcCanonSources.bulkGet(ids);
  const records: ArcCanonSource[] = inputs.map((input, index) => ({
    id: ids[index],
    title: input.title,
    kind: input.kind,
    sourceFileName: input.sourceFileName,
    tags: [...new Set(input.tags)].slice(0, 80),
    characterNames: [...new Set(input.characterNames)].slice(0, 120),
    text: input.text,
    createdAt: existing[index]?.createdAt ?? now,
    updatedAt: now,
  }));
  await db.arcCanonSources.bulkPut(records);
  window.dispatchEvent(new CustomEvent('system:arc-archives-changed'));
  return records;
}

export function downloadArcKnowledgePack(sources: ArcCanonSource[]) {
  const payload = {
    schema: 'ARC_Knowledge_Pack',
    version: 1,
    createdAt: new Date().toISOString(),
    sources: sources.map((source) => ({
      title: source.title,
      kind: source.kind,
      tags: source.tags,
      characterNames: source.characterNames,
      text: source.text,
      sourceFileName: source.sourceFileName,
    })),
  };
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }),
  );
  const link = document.createElement('a');
  link.href = url;
  link.download = 'quill-knowledge-pack.json';
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function downloadArcDossier(record: ArcCharacterRecord) {
  const payload = {
    schema: 'ARC_Profile_Template',
    version: record.schemaVersion,
    savedAt: record.updatedAt,
    meta: { completion: record.completion, overallClass: record.overallClass },
    data: record.data,
  };
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }),
  );
  const link = document.createElement('a');
  link.href = url;
  link.download = `${slug(record.name) || 'arc-character'}.json`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function searchableDossier(record: ArcCharacterRecord) {
  return [
    record.name,
    record.alias,
    record.style,
    record.faction,
    record.overallClass,
    JSON.stringify(record.data),
  ]
    .join(' ')
    .toLowerCase();
}

function queryTerms(query: string) {
  const stopWords = new Set([
    'about',
    'after',
    'also',
    'and',
    'are',
    'can',
    'could',
    'for',
    'from',
    'have',
    'how',
    'in',
    'is',
    'it',
    'into',
    'just',
    'like',
    'me',
    'my',
    'need',
    'of',
    'or',
    'please',
    'should',
    'that',
    'the',
    'their',
    'them',
    'this',
    'to',
    'was',
    'we',
    'what',
    'when',
    'where',
    'which',
    'who',
    'why',
    'with',
    'would',
    'you',
  ]);
  return [
    ...new Set(
      (query.toLowerCase().match(/[a-z0-9'-]{2,}/g) ?? []).filter(
        (term) => !stopWords.has(term),
      ),
    ),
  ].slice(0, 20);
}

function relevance(haystack: string, terms: string[]) {
  return terms.reduce((score, term) => score + (haystack.includes(term) ? 1 : 0), 0);
}

function excerpt(text: string, terms: string[], maximum = 2_400) {
  const lower = text.toLowerCase();
  const index = Math.max(0, ...terms.map((term) => lower.indexOf(term)).filter((value) => value >= 0));
  const start = Math.max(0, index - 320);
  return text.slice(start, start + maximum).trim();
}

function compactArcValue(value: unknown, depth = 0): unknown {
  if (depth > 3) return '[nested record omitted]';
  if (typeof value === 'string') return value.slice(0, 1_800);
  if (typeof value === 'number' || typeof value === 'boolean' || value === null) return value;
  if (Array.isArray(value)) return value.slice(0, 24).map((item) => compactArcValue(item, depth + 1));
  if (isObject(value)) {
    return Object.fromEntries(
      Object.entries(value)
        .slice(0, 40)
        .map(([key, item]) => [key, compactArcValue(item, depth + 1)]),
    );
  }
  return undefined;
}

export async function buildArcKnowledgeContext(query = '') {
  const [characters, sources] = await Promise.all([
    db.arcCharacters.orderBy('updatedAt').reverse().toArray(),
    db.arcCanonSources.orderBy('updatedAt').reverse().toArray(),
  ]);
  const terms = queryTerms(query);
  const hasQuery = Boolean(query.trim());
  const minimumScore = terms.length > 1 ? 2 : 1;
  const rankedCharacters = characters
    .map((record) => ({ record, score: relevance(searchableDossier(record), terms) }))
    .filter((item) => !hasQuery || item.score >= minimumScore)
    .sort((left, right) => right.score - left.score || right.record.updatedAt.localeCompare(left.record.updatedAt))
    .slice(0, 4)
    .map(({ record }) => ({
      source: `Character dossier: ${record.name}`,
      name: record.name,
      alias: record.alias,
      style: record.style,
      faction: record.faction,
      overallClass: record.overallClass,
      startingClass: record.startingClass,
      endingClass: record.endingClass,
      dossier: Object.fromEntries(
        Object.entries(record.data)
          .filter(([, value]) => meaningful(value))
          .slice(0, 80)
          .map(([key, value]) => [key, compactArcValue(value)]),
      ),
    }));
  const rankedSources = sources
    .map((source) => ({
      source,
      score: relevance(
        [source.title, source.kind, source.tags.join(' '), source.characterNames.join(' '), source.text]
          .join(' ')
          .toLowerCase(),
        terms,
      ),
    }))
    .filter((item) => !hasQuery || item.score >= minimumScore)
    .sort((left, right) => right.score - left.score || right.source.updatedAt.localeCompare(left.source.updatedAt))
    .slice(0, 5)
    .map(({ source }) => ({
      source: `Canon source: ${source.title}`,
      kind: source.kind,
      tags: source.tags,
      characterNames: source.characterNames,
      excerpt: excerpt(source.text, terms),
    }));
  return {
    library: { characterCount: characters.length, canonSourceCount: sources.length },
    retrievalQuery: query.slice(0, 1_000),
    relevantCharacters: rankedCharacters,
    relevantCanonSources: rankedSources,
    grounding:
      'Treat only these retrieved records as established canon. Cite the source label when stating a fact. Label inference, speculation, and new ideas explicitly. If the needed record is absent, say what source is missing.',
  };
}

export function scanArcContinuity(
  characters: ArcCharacterRecord[],
  sources: ArcCanonSource[],
) {
  const findings: Array<{ level: 'clear' | 'watch' | 'gap'; title: string; detail: string }> = [];
  const names = new Map<string, number>();
  for (const character of characters) {
    const key = character.name.toLowerCase();
    names.set(key, (names.get(key) ?? 0) + 1);
    const missing = [
      !character.style && 'Style',
      !character.faction && 'Faction',
      !character.startingClass && 'Starting Class',
      !character.endingClass && 'Ending Class',
    ].filter(Boolean);
    if (missing.length) {
      findings.push({
        level: 'gap',
        title: `${character.name} has open dossier fields`,
        detail: `Missing: ${missing.join(', ')}. This is an archive gap, not a contradiction.`,
      });
    }
  }
  for (const [name, count] of names) {
    if (count > 1) {
      findings.push({
        level: 'watch',
        title: `Duplicate character identity: ${name}`,
        detail: `${count} records use this name. Confirm whether these are variants or accidental duplicates.`,
      });
    }
  }
  const known = new Set(characters.map((character) => character.name.toLowerCase()));
  for (const source of sources) {
    const unmatched = source.characterNames.filter((name) => !known.has(name.toLowerCase()));
    if (unmatched.length) {
      findings.push({
        level: 'watch',
        title: `${source.title} names unfiled characters`,
        detail: `${unmatched.slice(0, 6).join(', ')} do not yet have dossiers in the local library.`,
      });
    }
  }
  if (!findings.length) {
    findings.push({
      level: 'clear',
      title: 'No structural contradictions detected',
      detail:
        'The local index is internally clean. Quill can perform a deeper semantic review once more canon sources are loaded.',
    });
  }
  return findings;
}
