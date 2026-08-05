import { beforeEach, describe, expect, it } from 'vitest';
import { BALANCE } from '@/config/balance';
import { KITCHEN_RECIPES } from '@/config/kitchen';
import { db } from '@/db/database';
import { initializeProfile, seedReferenceData } from '@/db/seed';
import {
  assignKitchenOrder,
  completeKitchenOrder,
  declineKitchenOrder,
  getKitchenData,
} from '@/game/kitchen';
import type { LocalDateKey } from '@/types/game';

const DATE = '2026-08-03' as LocalDateKey;

describe("Saffron's Kitchen", () => {
  beforeEach(async () => {
    await db.transaction('rw', db.tables, async () => {
      for (const table of db.tables) await table.clear();
    });
    await seedReferenceData();
    await initializeProfile({
      displayName: 'Kitchen Candidate',
      resetTime: '04:00',
      focus: 'balanced',
      soundEnabled: false,
      reducedMotion: true,
    });
  });

  it('provides a full no-bean, no-pea recipe library built around preferred foods', () => {
    expect(KITCHEN_RECIPES).toHaveLength(12);
    expect(KITCHEN_RECIPES.every((recipe) => recipe.ingredients.length >= 8)).toBe(true);
    expect(KITCHEN_RECIPES.every((recipe) => recipe.steps.length >= 5)).toBe(true);
    expect(
      KITCHEN_RECIPES.flatMap((recipe) => recipe.ingredients)
        .join(' ')
        .toLowerCase(),
    ).not.toMatch(/\bbeans?\b|\bpeas?\b/);
  });

  it('persists one daily assignment, permits one swap, and lets the order be declined without XP', async () => {
    const first = await assignKitchenOrder(DATE);
    expect(await assignKitchenOrder(DATE)).toEqual(first);
    const swapped = await assignKitchenOrder(DATE, true);
    expect(swapped.recipeId).not.toBe(first.recipeId);
    expect(swapped.rerollUsed).toBe(true);
    await expect(assignKitchenOrder(DATE, true)).rejects.toThrow(/already been used/i);

    const declined = await declineKitchenOrder(DATE);
    expect(declined?.status).toBe('declined');
    expect((await db.progression.get('primary'))?.totalXp).toBe(0);
    expect(await db.xpTransactions.where('kind').equals('kitchen').count()).toBe(0);
  });

  it('rewards only the first three completed orders in a week and never double-pays', async () => {
    const dates = ['2026-08-03', '2026-08-04', '2026-08-05', '2026-08-06'] as LocalDateKey[];
    for (const date of dates) {
      const assigned = await assignKitchenOrder(date);
      await completeKitchenOrder({
        date,
        servingsPrepared: 4,
        difficulty: 3,
        rating: 5,
        note: assigned.recipeId,
      });
    }

    expect((await db.progression.get('primary'))?.totalXp).toBe(
      BALANCE.kitchen.completedOrderAccountXp * BALANCE.kitchen.rewardedOrdersPerWeek,
    );
    expect(await db.xpTransactions.where('kind').equals('kitchen').count()).toBe(3);
    expect((await db.kitchenSessions.get('2026-08-06'))?.rewardApplied).toBe(false);
    const week = await getKitchenData('2026-08-06');
    expect(week.rewardAvailable).toBe(false);
    expect(week.rewardedThisWeek).toBe(3);

    await expect(
      completeKitchenOrder({
        date: '2026-08-06',
        servingsPrepared: 4,
        difficulty: 3,
        rating: 5,
      }),
    ).rejects.toThrow(/No active Kitchen Order/i);
    expect((await db.progression.get('primary'))?.totalXp).toBe(120);
  });
});
