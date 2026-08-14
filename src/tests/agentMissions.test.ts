import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '@/db/database';
import { initializeProfile, seedReferenceData } from '@/db/seed';
import {
  AGENT_MISSION_DAILY_XP_CAP,
  completeAgentMission,
  createAgentMission,
  reopenAgentMission,
  setAgentMissionChecklist,
} from '@/game/agentMissions';
import type { AgentMissionDifficulty, LocalDateKey } from '@/types/game';

const today = '2026-08-13' as LocalDateKey;

async function forgeMission(
  title: string,
  difficulty: AgentMissionDifficulty = 'standard',
  checklistItems: string[] = [],
) {
  return createAgentMission({
    title,
    description: 'A confirmation-gated companion order.',
    category: 'discipline',
    companionId: 'snow',
    createdBy: 'snow',
    source: 'party',
    difficulty,
    checklistItems,
  });
}

describe('Companion Order mission engine', () => {
  beforeEach(async () => {
    await db.transaction('rw', db.tables, async () => {
      for (const table of db.tables) await table.clear();
    });
    await seedReferenceData();
    await initializeProfile({
      displayName: 'Agent Candidate',
      resetTime: '04:00',
      focus: 'balanced',
      soundEnabled: false,
      reducedMotion: true,
    });
  });

  it('requires every checklist step and applies the fixed reward only once', async () => {
    const mission = await forgeMission('Secure the evening reset', 'standard', [
      'Clear the desk',
      'Set tomorrow’s first move',
    ]);

    await expect(completeAgentMission(mission.id, today)).rejects.toThrow(/every mission step/i);
    await setAgentMissionChecklist(mission.id, 'Clear the desk', true);
    await setAgentMissionChecklist(mission.id, 'Set tomorrow’s first move', true);

    const result = await completeAgentMission(mission.id, today);
    expect(result.awardedXp).toBe(40);
    expect((await db.progression.get('primary'))?.totalXp).toBe(40);
    expect((await db.progression.get('primary'))?.lifetimeMissionCompletions).toBe(1);
    await expect(completeAgentMission(mission.id, today)).rejects.toThrow(/already complete/i);
  });

  it('enforces the shared daily XP ceiling while preserving every real completion', async () => {
    const first = await forgeMission('First boss order', 'boss');
    const second = await forgeMission('Second boss order', 'boss');
    const third = await forgeMission('Third boss order', 'major');

    expect((await completeAgentMission(first.id, today)).awardedXp).toBe(120);
    expect((await completeAgentMission(second.id, today)).awardedXp).toBe(30);
    expect((await completeAgentMission(third.id, today)).awardedXp).toBe(0);
    expect((await db.progression.get('primary'))?.totalXp).toBe(AGENT_MISSION_DAILY_XP_CAP);
    expect((await db.progression.get('primary'))?.lifetimeMissionCompletions).toBe(3);
  });

  it('reverses an active-day clear and safely reuses only the XP capacity that remains', async () => {
    const first = await forgeMission('First boss order', 'boss');
    const reopened = await forgeMission('Order to reopen', 'boss');
    const replacement = await forgeMission('Replacement order', 'standard');

    await completeAgentMission(first.id, today);
    await completeAgentMission(reopened.id, today);
    await reopenAgentMission(reopened.id, today);
    expect((await db.progression.get('primary'))?.totalXp).toBe(120);

    expect((await completeAgentMission(replacement.id, today)).awardedXp).toBe(30);
    expect((await completeAgentMission(reopened.id, today)).awardedXp).toBe(0);

    const ledgerTotal = (await db.xpTransactions.where('date').equals(today).toArray())
      .filter((entry) => entry.sourceId.startsWith('agent-mission:'))
      .reduce((sum, entry) => sum + entry.amount, 0);
    expect(ledgerTotal).toBe(AGENT_MISSION_DAILY_XP_CAP);
    expect((await db.progression.get('primary'))?.totalXp).toBe(AGENT_MISSION_DAILY_XP_CAP);
    expect((await db.progression.get('primary'))?.lifetimeMissionCompletions).toBe(3);
  });

  it('keeps Companion Orders separate from the protected Daily Mission definitions', async () => {
    const dailyDefinitionsBefore = await db.missions.count();
    const recurring = await createAgentMission({
      title: 'Weekly review with Cassian',
      category: 'discipline',
      companionId: 'cassian',
      createdBy: 'hunter',
      source: 'hunter',
      difficulty: 'minor',
      dueDate: today,
      recurrence: 'weekly',
      recurrenceInterval: 1,
    });

    const result = await completeAgentMission(recurring.id, today);
    expect(result.mission).toMatchObject({ status: 'active', dueDate: '2026-08-20' });
    expect(await db.missions.count()).toBe(dailyDefinitionsBefore);
  });
});
