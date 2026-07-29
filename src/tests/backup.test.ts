import { beforeEach, describe, expect, it } from 'vitest';
import {
  commitPreparedImport,
  createLocalSnapshot,
  createSaveFile,
  listLocalSnapshots,
  prepareSaveImport,
} from '@/db/backup';
import { db } from '@/db/database';
import { initializeProfile, seedReferenceData } from '@/db/seed';
import type { SaveFile } from '@/types/game';

async function digest(data: Record<string, unknown[]>) {
  const bytes = new TextEncoder().encode(JSON.stringify(data));
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function asFile(save: SaveFile) {
  return new File([JSON.stringify(save)], 'save.json', { type: 'application/json' });
}

describe('save validation and recovery', () => {
  beforeEach(async () => {
    await db.transaction('rw', db.tables, async () => {
      for (const table of db.tables) await table.clear();
    });
    await seedReferenceData();
    await initializeProfile({
      displayName: 'Backup Candidate',
      resetTime: '04:00',
      focus: 'balanced',
      soundEnabled: false,
      reducedMotion: true,
    });
  });

  it('previews a valid save and atomically restores it after preserving current data', async () => {
    const save = await createSaveFile();
    const prepared = await prepareSaveImport(asFile(save));
    expect(prepared.preview.displayName).toBe('Backup Candidate');
    await db.progression.update('primary', { totalXp: 999 });
    await commitPreparedImport(prepared);
    expect((await db.progression.get('primary'))?.totalXp).toBe(0);
    expect(await db.backupSnapshots.count()).toBe(1);
  });

  it('rejects impossible negative progression values even with a matching checksum', async () => {
    const save = await createSaveFile();
    const progression = save.data.progression[0] as Record<string, unknown>;
    progression.totalXp = -50;
    save.checksum = await digest(save.data);
    await expect(prepareSaveImport(asFile(save))).rejects.toThrow(/impossible totalXp/);
  });

  it('retains only the five newest automatic snapshots', async () => {
    for (let index = 0; index < 7; index += 1) {
      await createLocalSnapshot('manual');
    }
    expect(await listLocalSnapshots()).toHaveLength(5);
  });
});
