import { beforeEach, describe, expect, it } from 'vitest';
import { COMPANIONS } from '@/config/companions';
import { PARTY_DIALOGUE, PARTY_MOODS } from '@/config/partyChat';
import { SUPPORT_DIALOGUE, SUPPORT_TOPICS } from '@/config/support';
import { db } from '@/db/database';
import { initializeProfile, seedReferenceData } from '@/db/seed';
import {
  addTreasuryBill,
  addTreasuryDebt,
  addTreasuryExpense,
  addTreasuryIncome,
  addTreasurySavingsGoal,
  completeTreasuryRecovery,
  ensureTreasuryChallenge,
  ensureTreasuryWeek,
  finalizeTreasuryWeek,
  getTreasuryWeekSummary,
  recordBillPayment,
  recordDebtPayment,
  recordSavingsContribution,
  revealTreasuryChallenge,
  resolveTreasuryChallenge,
  saveTreasuryWeekPlan,
} from '@/game/treasury';

describe('Version 3.0 Steward systems', () => {
  beforeEach(async () => {
    await db.transaction('rw', db.tables, async () => {
      for (const table of db.tables) await table.clear();
    });
    await seedReferenceData();
    await initializeProfile({
      displayName: 'Treasury Candidate',
      resetTime: '04:00',
      focus: 'balanced',
      soundEnabled: false,
      reducedMotion: true,
    });
  });

  it('seeds nine enabled companions, Stewardship, and the 75% protocol', async () => {
    const settings = await db.settings.get('primary');
    const treasury = await db.treasurySettings.get('primary');
    expect(COMPANIONS).toHaveLength(9);
    expect(settings?.enabledCompanionIds).toContain('amara');
    expect(settings?.enabledCompanionIds).toContain('cassian');
    expect(settings?.enabledCompanionIds).toContain('saffron');
    expect(await db.stats.get('stewardship')).toBeDefined();
    expect(treasury?.challengeEnabled).toBe(true);
    expect(treasury?.challengeChance).toBe(0.75);
  });

  it('gives Cassian and Amara complete party dialogue coverage', () => {
    const baseTriggers = [
      'daily-briefing',
      'mission',
      'stat-level',
      'rank-up',
      'rare-event',
      'mission-pass',
      'comeback',
      'achievement',
    ] as const;
    for (const id of ['amara', 'cassian'] as const) {
      const companion = COMPANIONS.find((item) => item.id === id)!;
      for (const trigger of baseTriggers) {
        expect(companion.messages[trigger]?.length, `${id}:${trigger}`).toBeGreaterThanOrEqual(2);
      }
      for (const mood of PARTY_MOODS) {
        expect(PARTY_DIALOGUE[mood.id][id]).toHaveLength(4);
      }
      for (const topic of SUPPORT_TOPICS) {
        expect(SUPPORT_DIALOGUE[topic.id][id].length).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it('uses an exact 75% boundary and persists one challenge per day', async () => {
    const activated = await ensureTreasuryChallenge('2026-08-01', () => 0.749999);
    const same = await ensureTreasuryChallenge('2026-08-01', () => 0.99);
    const notActivated = await ensureTreasuryChallenge('2026-08-02', () => 0.75);
    expect(activated?.status).toBe('active');
    expect(same?.id).toBe(activated?.id);
    expect(notActivated).toBeUndefined();
  });

  it('awards a passed directive once and never double-pays repeat taps', async () => {
    await ensureTreasuryChallenge('2026-08-01', () => 0);
    const before = (await db.progression.get('primary'))!.totalXp;
    await resolveTreasuryChallenge('2026-08-01', 'passed');
    await resolveTreasuryChallenge('2026-08-01', 'passed');
    const after = (await db.progression.get('primary'))!.totalXp;
    expect(after - before).toBe(60);
    expect(await db.xpTransactions.where('kind').equals('treasury').count()).toBe(1);
    expect((await db.treasuryChallenges.get('2026-08-01'))?.status).toBe('passed');
  });

  it('records failure without removing core XP and supports a stability recovery', async () => {
    await ensureTreasuryChallenge('2026-08-01', () => 0);
    const week = await ensureTreasuryWeek('2026-08-01', 1);
    const before = (await db.progression.get('primary'))!.totalXp;
    await resolveTreasuryChallenge('2026-08-01', 'failed');
    const failed = await getTreasuryWeekSummary(week);
    await completeTreasuryRecovery(
      '2026-08-01',
      'Prepare a frozen meal before the next tired evening.',
    );
    const recovered = await getTreasuryWeekSummary(week);
    expect((await db.progression.get('primary'))!.totalXp).toBe(before);
    expect(failed.stabilityScore).toBe(90);
    expect(recovered.stabilityScore).toBe(95);
  });

  it('allows a directive to be declined before or after acceptance without reward or penalty', async () => {
    const week = await ensureTreasuryWeek('2026-08-01', 1);
    const beforeXp = (await db.progression.get('primary'))!.totalXp;

    await ensureTreasuryChallenge('2026-08-01', () => 0);
    await resolveTreasuryChallenge('2026-08-01', 'declined');
    expect((await db.treasuryChallenges.get('2026-08-01'))?.status).toBe('declined');

    await ensureTreasuryChallenge('2026-08-02', () => 0);
    await revealTreasuryChallenge('2026-08-02');
    await resolveTreasuryChallenge('2026-08-02', 'declined');
    expect((await db.treasuryChallenges.get('2026-08-02'))?.status).toBe('declined');

    expect((await db.progression.get('primary'))!.totalXp).toBe(beforeXp);
    expect(await db.xpTransactions.where('kind').equals('treasury').count()).toBe(0);
    expect((await getTreasuryWeekSummary(week)).stabilityScore).toBe(100);
  });

  it('tracks a complete weekly money workflow and rewards review once', async () => {
    await saveTreasuryWeekPlan('2026-08-01', 1, {
      spendingLimitCents: 50000,
      diningLimitCents: 5000,
      savingsTargetCents: 10000,
      debtTargetCents: 10000,
      intention: 'Prepare meals before busy evenings.',
    });
    await addTreasuryIncome({ date: '2026-08-01', amountCents: 100000, source: 'Paycheck' });
    await addTreasuryExpense({
      date: '2026-08-01',
      amountCents: 15000,
      label: 'Groceries',
      category: 'groceries',
    });
    const bill = await addTreasuryBill({
      name: 'Phone',
      amountCents: 5000,
      dueDay: 1,
      cadence: 'monthly',
    });
    await recordBillPayment({ billId: bill.id, date: '2026-08-01' });
    const debt = await addTreasuryDebt({
      name: 'Card',
      kind: 'credit-card',
      balanceCents: 50000,
      aprBasisPoints: 2499,
    });
    await recordDebtPayment({ debtId: debt.id, date: '2026-08-01', amountCents: 10000 });
    const goal = await addTreasurySavingsGoal({ name: 'Emergency fund', targetCents: 100000 });
    await recordSavingsContribution({ goalId: goal.id, date: '2026-08-01', amountCents: 12000 });
    const week = (await db.treasuryWeeks.toArray())[0];
    const summary = await getTreasuryWeekSummary(week);
    expect(summary).toMatchObject({
      incomeCents: 100000,
      expenseCents: 20000,
      billPaidCents: 5000,
      debtPaidCents: 10000,
      savingsCents: 12000,
      billsPaid: 1,
    });
    const before = (await db.progression.get('primary'))!.totalXp;
    await finalizeTreasuryWeek(week.id, 'The plan worked when food was ready.');
    await finalizeTreasuryWeek(week.id, 'Repeated tap.');
    expect((await db.progression.get('primary'))!.totalXp - before).toBe(90);
    expect((await db.treasuryDebts.get(debt.id))?.balanceCents).toBe(40000);
    expect((await db.treasurySavingsGoals.get(goal.id))?.currentCents).toBe(12000);
  });
});
