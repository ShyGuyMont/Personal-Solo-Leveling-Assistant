import { db } from '@/db/database';
import type { IntegrityShieldProfile } from '@/types/game';

export const DEFAULT_INTERRUPTION_PLAN =
  'Close the current screen, move to a shared space, take ten slow breaths, and contact a trusted person if the pull remains strong.';

export function createDefaultIntegrityShield(
  now = new Date().toISOString(),
): IntegrityShieldProfile {
  return {
    id: 'primary',
    enabled: false,
    enforcement: 'not-configured',
    adultWebLimitEnabled: false,
    restrictedSitesConfigured: false,
    settingsPasscodeProtected: false,
    accountabilityEnabled: true,
    interruptionPlan: DEFAULT_INTERRUPTION_PLAN,
    createdAt: now,
    updatedAt: now,
  };
}

export async function ensureIntegrityShield() {
  const current = await db.integrityShields.get('primary');
  if (current) return current;
  const profile = createDefaultIntegrityShield();
  await db.integrityShields.put(profile);
  return profile;
}

export async function updateIntegrityShield(
  input: Partial<
    Pick<
      IntegrityShieldProfile,
      | 'enabled'
      | 'enforcement'
      | 'adultWebLimitEnabled'
      | 'restrictedSitesConfigured'
      | 'settingsPasscodeProtected'
      | 'accountabilityEnabled'
      | 'interruptionPlan'
    >
  >,
) {
  const current = await ensureIntegrityShield();
  const now = new Date().toISOString();
  const interruptionPlan =
    input.interruptionPlan === undefined
      ? current.interruptionPlan
      : input.interruptionPlan.trim().slice(0, 1_000);
  if (!interruptionPlan) throw new Error('Keep at least one practical interruption step.');
  const next: IntegrityShieldProfile = {
    ...current,
    ...input,
    interruptionPlan,
    lastVerifiedAt:
      input.adultWebLimitEnabled ||
      input.restrictedSitesConfigured ||
      input.settingsPasscodeProtected
        ? now
        : current.lastVerifiedAt,
    updatedAt: now,
  };
  if (!next.adultWebLimitEnabled && next.enforcement === 'screen-time') {
    next.enforcement = 'not-configured';
  }
  await db.integrityShields.put(next);
  return next;
}
