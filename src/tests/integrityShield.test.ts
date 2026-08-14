import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '@/db/database';
import { initializeProfile, seedReferenceData } from '@/db/seed';
import { ensureIntegrityShield, updateIntegrityShield } from '@/game/integrityShield';

describe('Explicit Content Shield record', () => {
  beforeEach(async () => {
    await db.transaction('rw', db.tables, async () => {
      for (const table of db.tables) await table.clear();
    });
    await seedReferenceData();
    await initializeProfile({
      displayName: 'Shield Candidate',
      resetTime: '04:00',
      focus: 'balanced',
      soundEnabled: false,
      reducedMotion: true,
    });
  });

  it('starts honest about enforcement and records a self-verified Screen Time setup', async () => {
    expect(await ensureIntegrityShield()).toMatchObject({
      enabled: false,
      enforcement: 'not-configured',
      adultWebLimitEnabled: false,
    });

    const configured = await updateIntegrityShield({
      enabled: true,
      enforcement: 'screen-time',
      adultWebLimitEnabled: true,
      settingsPasscodeProtected: true,
    });
    expect(configured).toMatchObject({
      enabled: true,
      enforcement: 'screen-time',
      adultWebLimitEnabled: true,
      settingsPasscodeProtected: true,
    });
    expect(configured.lastVerifiedAt).toBeTruthy();
  });

  it('never claims Screen Time enforcement after the user marks the device control off', async () => {
    await updateIntegrityShield({ enforcement: 'screen-time', adultWebLimitEnabled: true });
    const disabled = await updateIntegrityShield({ adultWebLimitEnabled: false });
    expect(disabled.enforcement).toBe('not-configured');
  });
});
