import { beforeEach, describe, expect, it } from 'vitest';
import { BALANCE } from '@/config/balance';
import { KITCHEN_RECIPES } from '@/config/kitchen';
import { db } from '@/db/database';
import { initializeProfile, seedReferenceData } from '@/db/seed';
import {
  assignKitchenOrder,
  assignSpecificKitchenOrder,
  completeKitchenOrder,
  declineKitchenOrder,
  getKitchenData,
  resolveKitchenSessionRecipe,
  saveKitchenProgress,
} from '@/game/kitchen';
import { saveCustomKitchenRecipe } from '@/game/kitchenGrimoire';
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
    expect(KITCHEN_RECIPES).toHaveLength(18);
    expect(new Set(KITCHEN_RECIPES.map((recipe) => recipe.id)).size).toBe(18);
    expect(KITCHEN_RECIPES.every((recipe) => recipe.ingredients.length >= 8)).toBe(true);
    expect(KITCHEN_RECIPES.every((recipe) => recipe.steps.length >= 5)).toBe(true);
    expect(KITCHEN_RECIPES.every((recipe) => /°F/.test(recipe.safety))).toBe(true);
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
    expect((await db.progression.get('primary'))?.totalXp).toBe(
      BALANCE.kitchen.completedOrderAccountXp * BALANCE.kitchen.rewardedOrdersPerWeek,
    );
  });

  it('can turn a personal Grimoire recipe into the guided order with saved checklist progress', async () => {
    const custom = await saveCustomKitchenRecipe({
      name: 'Saffron Test Skillet',
      codename: 'GUIDED FLAME',
      servings: 3,
      prepMinutes: 8,
      cookMinutes: 17,
      costTier: '$',
      equipment: 'Skillet',
      plate: 'Chicken, rice, and vegetables.',
      ingredients: ['1 lb chicken', '2 cups rice', '2 cups vegetables'],
      steps: ['Cook chicken to 165°F.', 'Add vegetables.', 'Serve over rice.'],
      swaps: ['Use turkey.'],
      storage: 'Refrigerate promptly.',
      safety: 'Chicken must reach 165°F.',
    });

    const assigned = await assignSpecificKitchenOrder(DATE, custom.id);
    expect(assigned.customRecipeSnapshot).toEqual(
      expect.objectContaining({ id: custom.id, name: custom.name }),
    );
    expect(resolveKitchenSessionRecipe(assigned)?.name).toBe(custom.name);
    await saveKitchenProgress(DATE, {
      ingredientChecks: { '1 lb chicken': true },
      stepChecks: { 'Cook chicken to 165°F.': true },
    });
    expect((await db.kitchenSessions.get(DATE))?.stepChecks?.['Cook chicken to 165°F.']).toBe(true);

    await completeKitchenOrder({
      date: DATE,
      servingsPrepared: 3,
      difficulty: 2,
      rating: 5,
    });
    expect((await db.xpTransactions.where('kind').equals('kitchen').first())?.note).toContain(
      custom.name,
    );
  });

  it("includes eligible personal recipes in Saffron's balanced Daily Rotation", async () => {
    const custom = await saveCustomKitchenRecipe({
      name: 'Rotation Candidate Bowl',
      codename: 'PERSONAL ROTATION',
      servings: 4,
      prepMinutes: 10,
      cookMinutes: 20,
      costTier: '$',
      equipment: 'Skillet',
      plate: 'Chicken, rice, and vegetables.',
      ingredients: ['1 lb chicken', '2 cups rice', '2 cups vegetables'],
      steps: ['Cook chicken to 165°F.', 'Cook vegetables.', 'Build bowls.'],
      swaps: [],
      storage: 'Refrigerate promptly.',
      safety: 'Chicken must reach 165°F.',
    });
    const historyDates = Array.from(
      { length: KITCHEN_RECIPES.length },
      (_, index) => `2026-07-${String(index + 1).padStart(2, '0')}`,
    ) as LocalDateKey[];
    await db.kitchenSessions.bulkPut(
      KITCHEN_RECIPES.map((recipe, index) => ({
        id: historyDates[index],
        date: historyDates[index],
        recipeId: recipe.id,
        status: 'completed' as const,
        assignmentVariant: 0,
        rerollUsed: false,
        assignedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        rewardApplied: false,
        updatedAt: new Date().toISOString(),
      })),
    );

    expect((await assignKitchenOrder(DATE)).recipeId).toBe(custom.id);
  });
});
