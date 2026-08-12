import type { CreatorSnapshotSource, CreatorVideoInsight } from '@/types/game';

export interface YouTubeStudioStatus {
  configured: boolean;
  connected: boolean;
  redirectUri: string;
  channelId?: string;
  channelTitle?: string;
  connectedAt?: string;
  lastSyncAt?: string;
  scopes: string[];
}

export interface YouTubeStudioSyncResult {
  syncedAt: string;
  channelId: string;
  channelTitle: string;
  channelUrl: string;
  snapshot: {
    source: CreatorSnapshotSource;
    periodDays: number;
    subscribers?: number;
    views?: number;
    watchHours?: number;
    averageViewDurationSeconds?: number;
    uploads?: number;
    note?: string;
  };
  snapshots: Array<YouTubeStudioSyncResult['snapshot']>;
  topVideos: Array<Omit<CreatorVideoInsight, 'id' | 'capturedAt'>>;
}

export class YouTubeStudioError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = 'YouTubeStudioError';
  }
}

async function readJson(response: Response) {
  try {
    return (await response.json()) as Record<string, unknown>;
  } catch {
    return undefined;
  }
}

async function requestJson(path: string, init?: RequestInit) {
  let response: Response;
  try {
    response = await fetch(path, {
      ...init,
      headers: {
        accept: 'application/json',
        ...init?.headers,
      },
    });
  } catch {
    throw new YouTubeStudioError(
      'The secure YouTube Studio bridge could not be reached.',
      'youtube-network',
    );
  }
  const payload = await readJson(response);
  if (!response.ok) {
    throw new YouTubeStudioError(
      typeof payload?.message === 'string'
        ? payload.message
        : 'YouTube Studio could not complete that request.',
      typeof payload?.code === 'string' ? payload.code : 'youtube-request-failed',
    );
  }
  return payload ?? {};
}

export async function getYouTubeStudioStatus(): Promise<YouTubeStudioStatus> {
  const payload = await requestJson('/api/youtube/status');
  return {
    configured: payload.configured === true,
    connected: payload.connected === true,
    redirectUri: typeof payload.redirectUri === 'string' ? payload.redirectUri : '',
    channelId: typeof payload.channelId === 'string' ? payload.channelId : undefined,
    channelTitle: typeof payload.channelTitle === 'string' ? payload.channelTitle : undefined,
    connectedAt: typeof payload.connectedAt === 'string' ? payload.connectedAt : undefined,
    lastSyncAt: typeof payload.lastSyncAt === 'string' ? payload.lastSyncAt : undefined,
    scopes: Array.isArray(payload.scopes)
      ? payload.scopes.filter((scope): scope is string => typeof scope === 'string')
      : [],
  };
}

export function beginYouTubeStudioConnection() {
  window.location.assign('/api/youtube/connect');
}

export async function syncYouTubeStudio(): Promise<YouTubeStudioSyncResult> {
  return (await requestJson('/api/youtube/sync', {
    method: 'POST',
  })) as unknown as YouTubeStudioSyncResult;
}

export async function disconnectYouTubeStudio() {
  return requestJson('/api/youtube/disconnect', { method: 'POST' });
}
