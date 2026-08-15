const MEDIA_AUDIT_KEY = 'system-media-audit-v1';
const MAX_MEDIA_AUDIT_ENTRIES = 20;

export type MediaAuditEntry = {
  at: string;
  action: 'audio-requested' | 'audio-opened' | 'video-blocked' | 'media-released';
};

type MediaDevicesLike = {
  getUserMedia: (constraints?: MediaStreamConstraints) => Promise<MediaStream>;
};

type MediaSecurityEnvironment = {
  mediaDevices?: MediaDevicesLike;
  storage?: Pick<Storage, 'getItem' | 'setItem'>;
  now?: () => Date;
};

const ownedStreams = new Set<MediaStream>();
let guardInstalled = false;

function writeAudit(
  action: MediaAuditEntry['action'],
  storage: MediaSecurityEnvironment['storage'],
  now: () => Date,
) {
  if (!storage) return;
  try {
    const current = JSON.parse(storage.getItem(MEDIA_AUDIT_KEY) ?? '[]') as MediaAuditEntry[];
    const next = [...current, { at: now().toISOString(), action }].slice(-MAX_MEDIA_AUDIT_ENTRIES);
    storage.setItem(MEDIA_AUDIT_KEY, JSON.stringify(next));
  } catch {
    // Media protection must never prevent the app from starting when storage is unavailable.
  }
}

function requestsVideo(constraints?: MediaStreamConstraints) {
  return Boolean(constraints?.video);
}

export function releaseSystemMedia(
  storage: MediaSecurityEnvironment['storage'] =
    typeof sessionStorage === 'undefined' ? undefined : sessionStorage,
  now: () => Date = () => new Date(),
) {
  let released = false;
  for (const stream of ownedStreams) {
    stream.getTracks().forEach((track) => track.stop());
    ownedStreams.delete(stream);
    released = true;
  }
  if (released) writeAudit('media-released', storage, now);
}

export function installSystemMediaGuard(environment: MediaSecurityEnvironment = {}) {
  if (guardInstalled) return false;

  const mediaDevices =
    environment.mediaDevices ??
    (typeof navigator === 'undefined' ? undefined : navigator.mediaDevices);
  if (!mediaDevices?.getUserMedia) return false;

  const storage =
    environment.storage ?? (typeof sessionStorage === 'undefined' ? undefined : sessionStorage);
  const now = environment.now ?? (() => new Date());
  const nativeGetUserMedia = mediaDevices.getUserMedia.bind(mediaDevices);
  const guardedGetUserMedia = async (constraints?: MediaStreamConstraints) => {
    if (requestsVideo(constraints)) {
      writeAudit('video-blocked', storage, now);
      throw new DOMException('The System never requests camera access.', 'NotAllowedError');
    }

    writeAudit('audio-requested', storage, now);
    const stream = await nativeGetUserMedia({
      ...constraints,
      audio: constraints?.audio ?? true,
      video: false,
    });
    ownedStreams.add(stream);
    stream.getTracks().forEach((track) => {
      track.addEventListener?.('ended', () => ownedStreams.delete(stream), { once: true });
    });
    writeAudit('audio-opened', storage, now);
    return stream;
  };

  try {
    Object.defineProperty(mediaDevices, 'getUserMedia', {
      configurable: true,
      value: guardedGetUserMedia,
    });
  } catch {
    return false;
  }

  guardInstalled = true;
  return true;
}

export function readMediaAudit(
  storage: Pick<Storage, 'getItem'> = sessionStorage,
): MediaAuditEntry[] {
  try {
    return JSON.parse(storage.getItem(MEDIA_AUDIT_KEY) ?? '[]') as MediaAuditEntry[];
  } catch {
    return [];
  }
}
