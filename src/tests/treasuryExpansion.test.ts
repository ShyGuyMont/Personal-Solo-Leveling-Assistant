import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '@/db/database';
import { initializeProfile, seedReferenceData } from '@/db/seed';
import {
  addTreasuryAccount,
  addTreasuryBill,
  addTreasuryDebt,
  getTreasuryDashboard,
  updateTreasuryAccount,
} from '@/game/treasury';
import type { LocalDateKey } from '@/types/game';

describe('Treasury account map and forecast', () => {
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

  it('derives net worth and the known monthly obligation floor from local records', async () => {
    await addTreasuryAccount({ name: 'Checking', kind: 'checking', balanceCents: 500_000 });
    await addTreasuryAccount({
      name: 'Excluded cash',
      kind: 'cash',
      balanceCents: 25_000,
      includeInNetWorth: false,
    });
    await addTreasuryDebt({
      name: 'Card',
      kind: 'credit-card',
      balanceCents: 100_000,
      minimumPaymentCents: 12_500,
    });
    await addTreasuryBill({ name: 'Rent', amountCents: 120_000, dueDay: 1, cadence: 'monthly' });
    await addTreasuryBill({
      name: 'Weekly service',
      amountCents: 2_500,
      dueDay: 2,
      cadence: 'weekly',
    });

    const dashboard = await getTreasuryDashboard('2026-08-13' as LocalDateKey, 1);
    expect(dashboard.netWorthCents).toBe(400_000);
    expect(dashboard.monthlyObligationsCents).toBe(130_833);
    expect(dashboard.minimumDebtPaymentsCents).toBe(12_500);
  });

  it('updates balances without creating a false ledger transaction', async () => {
    const account = await addTreasuryAccount({
      name: 'Emergency reserve',
      kind: 'savings',
      balanceCents: 75_000,
    });
    await updateTreasuryAccount(account.id, { balanceCents: 90_000 });

    expect((await db.treasuryAccounts.get(account.id))?.balanceCents).toBe(90_000);
    expect(await db.treasuryTransactions.count()).toBe(0);
  });
});
