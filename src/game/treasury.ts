import { db } from '@/db/database';
import { createDefaultTreasurySettings } from '@/db/seed';
import { putLevelHistory } from '@/game/engine';
import { applyStatChange } from '@/game/stats';
import { applyAccountXp } from '@/game/xp';
import { addDays, startOfWeek } from '@/utils/date';
import { stableId } from '@/utils/id';
import type {
  LocalDateKey,
  TreasuryAccount,
  TreasuryBill,
  TreasuryChallengeOutcome,
  TreasuryDailyChallenge,
  TreasuryDebt,
  TreasuryExpenseCategory,
  TreasurySavingsGoal,
  TreasuryTransaction,
  TreasuryWeek,
  TreasuryWeekSummary,
} from '@/types/game';

const WEEKLY_REVIEW_ACCOUNT_XP = 90;
const WEEKLY_REVIEW_STAT_XP = 45;
const NO_EATING_OUT_STAT_XP = 30;

function requireCents(amountCents: number, label = 'Amount') {
  if (!Number.isInteger(amountCents) || amountCents <= 0 || amountCents > 1_000_000_000) {
    throw new Error(`${label} must be a positive amount below $10,000,000.`);
  }
}

function requireName(value: string, label: string) {
  const result = value.trim();
  if (!result) throw new Error(`${label} is required.`);
  if (result.length > 100) throw new Error(`${label} must be 100 characters or fewer.`);
  return result;
}

function inRange(date: LocalDateKey, start: LocalDateKey, end: LocalDateKey) {
  return date >= start && date <= end;
}

function periodKey(date: LocalDateKey) {
  return date.slice(0, 7);
}

async function applyTreasuryReward(input: {
  id: string;
  sourceId: string;
  note: string;
  date: LocalDateKey;
  accountXp: number;
  stewardshipXp: number;
}) {
  const existing = await db.xpTransactions.get(input.id);
  if (existing) return { awardedXp: 0, levelsGained: 0 };
  const now = new Date().toISOString();
  let levelsGained = 0;
  await db.transaction(
    'rw',
    [db.progression, db.stats, db.xpTransactions, db.statTransactions, db.levelHistory],
    async () => {
      if (await db.xpTransactions.get(input.id)) return;
      const progression = await db.progression.get('primary');
      const stewardship = await db.stats.get('stewardship');
      if (!progression || !stewardship) throw new Error('Treasury progression is unavailable.');
      const nextAccount = applyAccountXp(progression.totalXp, input.accountXp);
      levelsGained = nextAccount.levelsGained;
      const nextProgression = {
        ...progression,
        ...nextAccount,
        lastLevelUpAt: levelsGained ? now : progression.lastLevelUpAt,
        recentLevelUp: levelsGained > 0,
      };
      await db.progression.put(nextProgression);
      await db.stats.put(
        applyStatChange(stewardship, input.stewardshipXp, input.stewardshipXp > 0 ? 8 : 0, now),
      );
      await db.xpTransactions.put({
        id: input.id,
        kind: 'treasury',
        amount: input.accountXp,
        date: input.date,
        timestamp: now,
        sourceId: input.sourceId,
        note: input.note,
      });
      await db.statTransactions.put({
        id: `${input.id}:stewardship`,
        stat: 'stewardship',
        kind: 'treasury',
        amount: input.stewardshipXp,
        momentumDelta: 8,
        date: input.date,
        timestamp: now,
        sourceId: input.sourceId,
        note: input.note,
      });
      await putLevelHistory(nextProgression, progression.level, input.date, input.id, now);
    },
  );
  return { awardedXp: input.accountXp, levelsGained };
}

export async function ensureTreasurySettings() {
  const current = await db.treasurySettings.get('primary');
  if (current) return current;
  const settings = createDefaultTreasurySettings();
  await db.treasurySettings.put(settings);
  return settings;
}

export async function ensureTreasuryWeek(date: LocalDateKey, weekStartsOn: number) {
  const weekStart = startOfWeek(date, weekStartsOn);
  const existing = await db.treasuryWeeks.get(weekStart);
  if (existing) return existing;
  const now = new Date().toISOString();
  const week: TreasuryWeek = {
    id: weekStart,
    weekStart,
    weekEnd: addDays(weekStart, 6),
    status: 'planned',
    spendingLimitCents: 0,
    diningLimitCents: 0,
    savingsTargetCents: 0,
    debtTargetCents: 0,
    createdAt: now,
    updatedAt: now,
  };
  await db.treasuryWeeks.put(week);
  return week;
}

export async function saveTreasuryWeekPlan(
  date: LocalDateKey,
  weekStartsOn: number,
  input: Pick<
    TreasuryWeek,
    | 'spendingLimitCents'
    | 'diningLimitCents'
    | 'savingsTargetCents'
    | 'debtTargetCents'
    | 'intention'
  >,
) {
  for (const [label, amount] of [
    ['Spending limit', input.spendingLimitCents],
    ['Dining limit', input.diningLimitCents],
    ['Savings target', input.savingsTargetCents],
    ['Debt target', input.debtTargetCents],
  ] as const) {
    if (!Number.isInteger(amount) || amount < 0 || amount > 1_000_000_000) {
      throw new Error(`${label} must be a valid amount.`);
    }
  }
  const week = await ensureTreasuryWeek(date, weekStartsOn);
  const next: TreasuryWeek = {
    ...week,
    ...input,
    intention: input.intention?.trim().slice(0, 500),
    status: week.status === 'reviewed' ? 'reviewed' : 'planned',
    updatedAt: new Date().toISOString(),
  };
  await db.treasuryWeeks.put(next);
  return next;
}

export async function addTreasuryIncome(input: {
  date: LocalDateKey;
  amountCents: number;
  source: string;
  note?: string;
}) {
  requireCents(input.amountCents);
  const createdAt = new Date().toISOString();
  const record: TreasuryTransaction = {
    id: crypto.randomUUID(),
    date: input.date,
    kind: 'income',
    amountCents: input.amountCents,
    label: requireName(input.source, 'Income source'),
    note: input.note?.trim().slice(0, 500),
    createdAt,
  };
  await db.treasuryTransactions.put(record);
  return record;
}

export async function addTreasuryExpense(input: {
  date: LocalDateKey;
  amountCents: number;
  label: string;
  category: TreasuryExpenseCategory;
  isEatingOut?: boolean;
  note?: string;
}) {
  requireCents(input.amountCents);
  const createdAt = new Date().toISOString();
  const record: TreasuryTransaction = {
    id: crypto.randomUUID(),
    date: input.date,
    kind: 'expense',
    amountCents: input.amountCents,
    label: requireName(input.label, 'Expense name'),
    category: input.category,
    isEatingOut: Boolean(input.isEatingOut),
    note: input.note?.trim().slice(0, 500),
    createdAt,
  };
  await db.transaction('rw', [db.treasuryTransactions, db.treasuryChallenges], async () => {
    await db.treasuryTransactions.put(record);
    if (record.isEatingOut) {
      const challenge = await db.treasuryChallenges.get(input.date);
      if (challenge?.status === 'active') {
        await db.treasuryChallenges.update(input.date, {
          status: 'failed',
          resolvedAt: createdAt,
          stabilityPenalty: 10,
          recoveryPlan:
            'Dining expense logged honestly. Choose one practical no-spend replacement before the next challenge.',
        });
      }
    }
  });
  return record;
}

export async function addTreasuryAccount(input: {
  name: string;
  kind: TreasuryAccount['kind'];
  balanceCents: number;
  includeInNetWorth?: boolean;
  note?: string;
}) {
  if (!Number.isInteger(input.balanceCents) || Math.abs(input.balanceCents) > 1_000_000_000_00) {
    throw new Error('Account balance must be a valid amount below $1 billion.');
  }
  const now = new Date().toISOString();
  const account: TreasuryAccount = {
    id: crypto.randomUUID(),
    name: requireName(input.name, 'Account name'),
    kind: input.kind,
    balanceCents: input.balanceCents,
    includeInNetWorth: input.includeInNetWorth ?? true,
    active: true,
    note: input.note?.trim().slice(0, 500),
    createdAt: now,
    updatedAt: now,
  };
  await db.treasuryAccounts.put(account);
  return account;
}

export async function updateTreasuryAccount(
  id: string,
  input: Partial<
    Pick<
      TreasuryAccount,
      'name' | 'kind' | 'balanceCents' | 'includeInNetWorth' | 'active' | 'note'
    >
  >,
) {
  const current = await db.treasuryAccounts.get(id);
  if (!current) throw new Error('That Treasury account could not be found.');
  if (
    input.balanceCents !== undefined &&
    (!Number.isInteger(input.balanceCents) || Math.abs(input.balanceCents) > 1_000_000_000_00)
  ) {
    throw new Error('Account balance must be a valid amount below $1 billion.');
  }
  const next: TreasuryAccount = {
    ...current,
    ...input,
    name: input.name ? requireName(input.name, 'Account name') : current.name,
    note: input.note?.trim().slice(0, 500) ?? current.note,
    updatedAt: new Date().toISOString(),
  };
  await db.treasuryAccounts.put(next);
  return next;
}

export async function addTreasuryBill(input: {
  name: string;
  amountCents: number;
  dueDay: number;
  cadence: TreasuryBill['cadence'];
  nextDueDate?: LocalDateKey;
  autopay?: boolean;
}) {
  requireCents(input.amountCents);
  if (!Number.isInteger(input.dueDay) || input.dueDay < 1 || input.dueDay > 31) {
    throw new Error('Bill due day must be between 1 and 31.');
  }
  const now = new Date().toISOString();
  const bill: TreasuryBill = {
    id: crypto.randomUUID(),
    name: requireName(input.name, 'Bill name'),
    amountCents: input.amountCents,
    dueDay: input.dueDay,
    cadence: input.cadence,
    nextDueDate: input.nextDueDate,
    autopay: Boolean(input.autopay),
    active: true,
    createdAt: now,
    updatedAt: now,
  };
  await db.treasuryBills.put(bill);
  return bill;
}

export async function recordBillPayment(input: {
  billId: string;
  date: LocalDateKey;
  amountCents?: number;
  note?: string;
}) {
  const bill = await db.treasuryBills.get(input.billId);
  if (!bill) throw new Error('That bill could not be found.');
  const amountCents = input.amountCents ?? bill.amountCents;
  requireCents(amountCents);
  const transaction: TreasuryTransaction = {
    id: crypto.randomUUID(),
    date: input.date,
    kind: 'bill-payment',
    amountCents,
    label: bill.name,
    relatedId: bill.id,
    periodKey: periodKey(input.date),
    note: input.note?.trim().slice(0, 500),
    createdAt: new Date().toISOString(),
  };
  await db.treasuryTransactions.put(transaction);
  return transaction;
}

export async function addTreasuryDebt(input: {
  name: string;
  kind: TreasuryDebt['kind'];
  balanceCents: number;
  aprBasisPoints?: number;
  minimumPaymentCents?: number;
  dueDay?: number;
  creditLimitCents?: number;
}) {
  requireCents(input.balanceCents, 'Debt balance');
  if (
    input.aprBasisPoints !== undefined &&
    (input.aprBasisPoints < 0 || input.aprBasisPoints > 10000)
  ) {
    throw new Error('APR must be between 0% and 100%.');
  }
  const now = new Date().toISOString();
  const debt: TreasuryDebt = {
    id: crypto.randomUUID(),
    name: requireName(input.name, 'Debt name'),
    kind: input.kind,
    balanceCents: input.balanceCents,
    aprBasisPoints: input.aprBasisPoints,
    minimumPaymentCents: input.minimumPaymentCents,
    dueDay: input.dueDay,
    creditLimitCents: input.creditLimitCents,
    active: true,
    createdAt: now,
    updatedAt: now,
  };
  await db.treasuryDebts.put(debt);
  return debt;
}

export async function recordDebtPayment(input: {
  debtId: string;
  date: LocalDateKey;
  amountCents: number;
  note?: string;
}) {
  requireCents(input.amountCents);
  const debt = await db.treasuryDebts.get(input.debtId);
  if (!debt) throw new Error('That debt account could not be found.');
  const now = new Date().toISOString();
  const transaction: TreasuryTransaction = {
    id: crypto.randomUUID(),
    date: input.date,
    kind: 'debt-payment',
    amountCents: input.amountCents,
    label: debt.name,
    relatedId: debt.id,
    periodKey: periodKey(input.date),
    note: input.note?.trim().slice(0, 500),
    createdAt: now,
  };
  await db.transaction('rw', [db.treasuryTransactions, db.treasuryDebts], async () => {
    await db.treasuryTransactions.put(transaction);
    await db.treasuryDebts.update(debt.id, {
      balanceCents: Math.max(0, debt.balanceCents - input.amountCents),
      active: debt.balanceCents - input.amountCents > 0,
      updatedAt: now,
    });
  });
  return transaction;
}

export async function addTreasurySavingsGoal(input: {
  name: string;
  targetCents: number;
  currentCents?: number;
  targetDate?: LocalDateKey;
}) {
  requireCents(input.targetCents, 'Savings target');
  const currentCents = Math.max(0, Math.round(input.currentCents ?? 0));
  const now = new Date().toISOString();
  const goal: TreasurySavingsGoal = {
    id: crypto.randomUUID(),
    name: requireName(input.name, 'Savings goal name'),
    targetCents: input.targetCents,
    currentCents,
    targetDate: input.targetDate,
    active: currentCents < input.targetCents,
    createdAt: now,
    updatedAt: now,
  };
  await db.treasurySavingsGoals.put(goal);
  return goal;
}

export async function recordSavingsContribution(input: {
  goalId: string;
  date: LocalDateKey;
  amountCents: number;
  note?: string;
}) {
  requireCents(input.amountCents);
  const goal = await db.treasurySavingsGoals.get(input.goalId);
  if (!goal) throw new Error('That savings goal could not be found.');
  const now = new Date().toISOString();
  const nextCurrent = goal.currentCents + input.amountCents;
  const transaction: TreasuryTransaction = {
    id: crypto.randomUUID(),
    date: input.date,
    kind: 'savings',
    amountCents: input.amountCents,
    label: goal.name,
    relatedId: goal.id,
    periodKey: periodKey(input.date),
    note: input.note?.trim().slice(0, 500),
    createdAt: now,
  };
  await db.transaction('rw', [db.treasuryTransactions, db.treasurySavingsGoals], async () => {
    await db.treasuryTransactions.put(transaction);
    await db.treasurySavingsGoals.update(goal.id, {
      currentCents: nextCurrent,
      active: nextCurrent < goal.targetCents,
      updatedAt: now,
    });
  });
  return transaction;
}

export async function deleteTreasuryTransaction(id: string) {
  const transaction = await db.treasuryTransactions.get(id);
  if (!transaction) return;
  await db.transaction(
    'rw',
    [db.treasuryTransactions, db.treasuryDebts, db.treasurySavingsGoals],
    async () => {
      if (transaction.kind === 'debt-payment' && transaction.relatedId) {
        const debt = await db.treasuryDebts.get(transaction.relatedId);
        if (debt) {
          await db.treasuryDebts.update(debt.id, {
            balanceCents: debt.balanceCents + transaction.amountCents,
            active: true,
            updatedAt: new Date().toISOString(),
          });
        }
      }
      if (transaction.kind === 'savings' && transaction.relatedId) {
        const goal = await db.treasurySavingsGoals.get(transaction.relatedId);
        if (goal) {
          const nextCurrent = Math.max(0, goal.currentCents - transaction.amountCents);
          await db.treasurySavingsGoals.update(goal.id, {
            currentCents: nextCurrent,
            active: nextCurrent < goal.targetCents,
            updatedAt: new Date().toISOString(),
          });
        }
      }
      await db.treasuryTransactions.delete(id);
    },
  );
}

function isBillDueDuringWeek(bill: TreasuryBill, start: LocalDateKey, end: LocalDateKey) {
  if (!bill.active) return false;
  if (bill.cadence === 'weekly') return true;
  if (bill.cadence === 'one-time') {
    return Boolean(bill.nextDueDate && inRange(bill.nextDueDate, start, end));
  }
  for (let date = start; date <= end; date = addDays(date, 1)) {
    if (Number(date.slice(8, 10)) === bill.dueDay) return true;
  }
  return false;
}

export async function getTreasuryWeekSummary(week: TreasuryWeek): Promise<TreasuryWeekSummary> {
  const [transactions, bills, challenges] = await Promise.all([
    db.treasuryTransactions
      .filter((transaction) => inRange(transaction.date, week.weekStart, week.weekEnd))
      .toArray(),
    db.treasuryBills.toArray(),
    db.treasuryChallenges
      .filter((challenge) => inRange(challenge.date, week.weekStart, week.weekEnd))
      .toArray(),
  ]);
  const total = (kind: TreasuryTransaction['kind']) =>
    transactions
      .filter((transaction) => transaction.kind === kind)
      .reduce((sum, transaction) => sum + transaction.amountCents, 0);
  const diningCents = transactions
    .filter(
      (transaction) =>
        transaction.kind === 'expense' &&
        (transaction.category === 'dining' || transaction.isEatingOut),
    )
    .reduce((sum, transaction) => sum + transaction.amountCents, 0);
  const dueBills = bills.filter((bill) => isBillDueDuringWeek(bill, week.weekStart, week.weekEnd));
  const paidBillIds = new Set(
    transactions
      .filter((transaction) => transaction.kind === 'bill-payment' && transaction.relatedId)
      .map((transaction) => transaction.relatedId),
  );
  const billPaidCents = total('bill-payment');
  const expenseCents = total('expense') + billPaidCents;
  const failures = challenges.filter((challenge) => challenge.status === 'failed');
  const expired = challenges.filter((challenge) => challenge.status === 'expired');
  const recovered = failures.filter((challenge) => challenge.recoveryCompletedAt).length;
  let stabilityScore = 100;
  if (week.spendingLimitCents > 0 && expenseCents > week.spendingLimitCents) {
    stabilityScore -= Math.min(
      30,
      Math.ceil(((expenseCents - week.spendingLimitCents) / week.spendingLimitCents) * 30),
    );
  }
  if (week.diningLimitCents > 0 && diningCents > week.diningLimitCents) stabilityScore -= 15;
  stabilityScore -= Math.min(30, Math.max(0, dueBills.length - paidBillIds.size) * 10);
  stabilityScore -= failures.length * 10 - recovered * 5;
  stabilityScore -= expired.length * 5;
  return {
    week,
    incomeCents: total('income'),
    expenseCents,
    diningCents,
    billPaidCents,
    debtPaidCents: total('debt-payment'),
    savingsCents: total('savings'),
    billsDue: dueBills.length,
    billsPaid: dueBills.filter((bill) => paidBillIds.has(bill.id)).length,
    noEatingOutWins: challenges.filter((challenge) => challenge.status === 'passed').length,
    challengeFailures: failures.length,
    stabilityScore: Math.max(0, Math.min(100, stabilityScore)),
  };
}

function cassianReviewMessage(summary: TreasuryWeekSummary) {
  if (summary.stabilityScore >= 85) {
    return `The ledger held. ${summary.noEatingOutWins} dining challenge win${summary.noEatingOutWins === 1 ? '' : 's'}, ${summary.billsPaid}/${summary.billsDue} bills covered, and the plan stayed visible. Protect what worked; do not spend the margin just because it exists.`;
  }
  if (summary.stabilityScore >= 60) {
    return `The week was workable, not perfect. Keep the honest entries, identify the largest leak, and give next week one limit you can actually defend.`;
  }
  return `The numbers need attention, not shame. We are not hiding from the week: cover the next essential bill, reduce one avoidable category, and rebuild from facts.`;
}

export async function finalizeTreasuryWeek(weekStart: LocalDateKey, reflection: string) {
  const week = await db.treasuryWeeks.get(weekStart);
  if (!week) throw new Error('That Treasury week could not be found.');
  if (week.status === 'reviewed') return week;
  const summary = await getTreasuryWeekSummary(week);
  const now = new Date().toISOString();
  const message = cassianReviewMessage(summary);
  await db.treasuryWeeks.update(week.id, {
    status: 'reviewed',
    reflection: reflection.trim().slice(0, 1000),
    cassianMessage: message,
    reviewedAt: now,
    updatedAt: now,
  });
  await applyTreasuryReward({
    id: stableId('treasury', 'weekly-review', week.id),
    sourceId: `treasury-week:${week.id}`,
    note: `Cassian's weekly Treasury review: ${week.id}`,
    date: week.weekEnd,
    accountXp: WEEKLY_REVIEW_ACCOUNT_XP,
    stewardshipXp: WEEKLY_REVIEW_STAT_XP,
  });
  return db.treasuryWeeks.get(week.id);
}

export async function ensureTreasuryChallenge(
  date: LocalDateKey,
  random: () => number = Math.random,
) {
  const settings = await ensureTreasurySettings();
  const olderActive = await db.treasuryChallenges.where('status').equals('active').toArray();
  const now = new Date().toISOString();
  await Promise.all(
    olderActive
      .filter((challenge) => challenge.date < date)
      .map((challenge) =>
        db.treasuryChallenges.update(challenge.id, {
          status: 'expired',
          resolvedAt: now,
          stabilityPenalty: challenge.revealedAt ? 5 : 0,
        }),
      ),
  );
  const existing = await db.treasuryChallenges.get(date);
  if (existing || !settings.challengeEnabled) return existing;
  const roll = random();
  if (roll >= settings.challengeChance) return undefined;
  const challenge: TreasuryDailyChallenge = {
    id: date,
    date,
    status: 'active',
    roll,
    rewardXp: settings.challengeRewardXp,
    stabilityPenalty: 0,
    createdAt: now,
  };
  await db.treasuryChallenges.put(challenge);
  return challenge;
}

export async function revealTreasuryChallenge(date: LocalDateKey) {
  const challenge = await db.treasuryChallenges.get(date);
  if (!challenge || challenge.revealedAt) return challenge;
  await db.treasuryChallenges.update(date, { revealedAt: new Date().toISOString() });
  return db.treasuryChallenges.get(date);
}

export async function resolveTreasuryChallenge(
  date: LocalDateKey,
  status: TreasuryChallengeOutcome,
) {
  const challenge = await db.treasuryChallenges.get(date);
  if (!challenge) throw new Error('Today’s Cassian challenge is not available.');
  if (challenge.status !== 'active') return challenge;
  const now = new Date().toISOString();
  if (status === 'declined') {
    await db.treasuryChallenges.update(date, {
      status,
      resolvedAt: now,
      stabilityPenalty: 0,
    });
    return {
      challenge: await db.treasuryChallenges.get(date),
      outcome: status,
    } as const;
  }
  if (status === 'failed') {
    await db.treasuryChallenges.update(date, {
      status,
      resolvedAt: now,
      stabilityPenalty: 10,
      recoveryPlan:
        'Name what made ordering out easier than the plan, then choose one prepared alternative for the next challenge.',
    });
    return {
      challenge: await db.treasuryChallenges.get(date),
      outcome: status,
    } as const;
  }
  const rewardId = stableId('treasury', 'no-eating-out', date);
  const reward = await applyTreasuryReward({
    id: rewardId,
    sourceId: `no-eating-out:${date}`,
    note: 'Cassian challenge cleared: No Eating Out',
    date,
    accountXp: challenge.rewardXp,
    stewardshipXp: NO_EATING_OUT_STAT_XP,
  });
  await db.treasuryChallenges.update(date, {
    status,
    resolvedAt: now,
    stabilityPenalty: 0,
    rewardTransactionId: rewardId,
  });
  return { challenge: await db.treasuryChallenges.get(date), outcome: status, reward } as const;
}

export async function completeTreasuryRecovery(date: LocalDateKey, plan: string) {
  const challenge = await db.treasuryChallenges.get(date);
  if (!challenge || challenge.status !== 'failed') {
    throw new Error('A failed Cassian challenge is required for this debrief.');
  }
  const nextPlan = requireName(plan, 'Recovery plan').slice(0, 500);
  await db.treasuryChallenges.update(date, {
    recoveryPlan: nextPlan,
    recoveryCompletedAt: new Date().toISOString(),
  });
  return db.treasuryChallenges.get(date);
}

export async function getTreasuryDashboard(date: LocalDateKey, weekStartsOn: number) {
  const week = await ensureTreasuryWeek(date, weekStartsOn);
  const [summary, settings, accounts, transactions, bills, debts, savingsGoals, challenges] =
    await Promise.all([
      getTreasuryWeekSummary(week),
      ensureTreasurySettings(),
      db.treasuryAccounts.toArray(),
      db.treasuryTransactions
        .toArray()
        .then((items) =>
          items.sort((left, right) => right.createdAt.localeCompare(left.createdAt)),
        ),
      db.treasuryBills.toArray(),
      db.treasuryDebts.toArray(),
      db.treasurySavingsGoals.toArray(),
      db.treasuryChallenges.orderBy('date').reverse().toArray(),
    ]);
  const activeAccounts = accounts.filter((item) => item.active && item.includeInNetWorth);
  const activeDebts = debts.filter((item) => item.active);
  const netWorthCents =
    activeAccounts.reduce((sum, item) => sum + item.balanceCents, 0) -
    activeDebts.reduce((sum, item) => sum + item.balanceCents, 0);
  const monthlyObligationsCents = bills
    .filter((item) => item.active)
    .reduce(
      (sum, item) =>
        sum +
        (item.cadence === 'weekly'
          ? Math.round((item.amountCents * 52) / 12)
          : item.cadence === 'monthly'
            ? item.amountCents
            : 0),
      0,
    );
  const minimumDebtPaymentsCents = activeDebts.reduce(
    (sum, item) => sum + (item.minimumPaymentCents ?? 0),
    0,
  );
  return {
    week,
    summary,
    settings,
    accounts,
    transactions,
    bills,
    debts,
    savingsGoals,
    challenges,
    netWorthCents,
    monthlyObligationsCents,
    minimumDebtPaymentsCents,
  };
}

export async function updateTreasuryChallengeSettings(input: {
  enabled: boolean;
  chance?: number;
}) {
  const settings = await ensureTreasurySettings();
  const chance = input.chance ?? settings.challengeChance;
  if (!Number.isFinite(chance) || chance < 0 || chance > 1) {
    throw new Error('Challenge chance must be between 0% and 100%.');
  }
  await db.treasurySettings.put({
    ...settings,
    challengeEnabled: input.enabled,
    challengeChance: chance,
    updatedAt: new Date().toISOString(),
  });
}
