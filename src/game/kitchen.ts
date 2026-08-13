import { BALANCE } from '@/config/balance';
import { KITCHEN_RECIPES, getKitchenRecipe } from '@/config/kitchen';
import { db } from '@/db/database';
import { queueCompanionReaction } from '@/game/companions';
import { putLevelHistory } from '@/game/engine';
import { getCustomKitchenRecipes } from '@/game/kitchenGrimoire';
import { applyStatChange } from '@/game/stats';
import { applyAccountXp } from '@/game/xp';
import { addDays, startOfWeek } from '@/utils/date';
import { stableId } from '@/utils/id';
import type { CustomKitchenRecipe, KitchenSession, LocalDateKey, StatName } from '@/types/game';

function randomIndex(length: number) {
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const value = new Uint32Array(1);
    crypto.getRandomValues(value);
    return Math.min(length - 1, Math.floor((value[0] / 0x1_0000_0000) * length));
  }
  return Math.min(length - 1, Math.floor(Math.random() * length));
}

interface KitchenRecipeDraw {
  id: string;
  customRecipeSnapshot?: CustomKitchenRecipe;
}

export function resolveKitchenSessionRecipe(session: KitchenSession | undefined) {
  if (!session) return undefined;
  return getKitchenRecipe(session.recipeId) ?? session.customRecipeSnapshot;
}

async function drawRecipe(date: LocalDateKey, blockedId?: string): Promise<KitchenRecipeDraw> {
  const [history, customRecipes] = await Promise.all([
    db.kitchenSessions.where('date').below(date).reverse().limit(60).toArray(),
    getCustomKitchenRecipes(),
  ]);
  const recentIds = new Set(history.slice(0, 3).map((session) => session.recipeId));
  if (blockedId) recentIds.add(blockedId);
  const counts = new Map<string, number>();
  for (const session of history)
    counts.set(session.recipeId, (counts.get(session.recipeId) ?? 0) + 1);
  const recipes: KitchenRecipeDraw[] = [
    ...KITCHEN_RECIPES.map((recipe) => ({ id: recipe.id })),
    ...customRecipes
      .filter((recipe) => recipe.dailyRotationEnabled)
      .map((recipe) => ({ id: recipe.id, customRecipeSnapshot: recipe })),
  ];
  const eligible = recipes.filter((recipe) => !recentIds.has(recipe.id));
  const pool = eligible.length ? eligible : recipes.filter((recipe) => recipe.id !== blockedId);
  const minimumUse = Math.min(...pool.map((recipe) => counts.get(recipe.id) ?? 0));
  const leastUsed = pool.filter((recipe) => (counts.get(recipe.id) ?? 0) === minimumUse);
  return leastUsed[randomIndex(leastUsed.length)];
}

export async function getKitchenData(date: LocalDateKey) {
  const settings = await db.settings.get('primary');
  const weekStart = startOfWeek(date, settings?.weekStartsOn ?? 1);
  const weekEnd = addDays(weekStart, 6);
  const [today, history, rewardedThisWeek] = await Promise.all([
    db.kitchenSessions.get(date),
    db.kitchenSessions.orderBy('date').reverse().limit(16).toArray(),
    db.kitchenSessions
      .where('date')
      .between(weekStart, weekEnd, true, true)
      .filter((session) => session.status === 'completed' && session.rewardApplied)
      .count(),
  ]);
  return {
    today,
    history,
    weekStart,
    weekEnd,
    rewardedThisWeek,
    rewardedOrderLimit: BALANCE.kitchen.rewardedOrdersPerWeek,
    rewardAvailable: rewardedThisWeek < BALANCE.kitchen.rewardedOrdersPerWeek,
  };
}

export async function assignKitchenOrder(date: LocalDateKey, reroll = false) {
  const existing = await db.kitchenSessions.get(date);
  if (existing?.status === 'completed' || existing?.status === 'declined') return existing;
  if (existing && !reroll) return existing;
  if (reroll && existing?.rerollUsed)
    throw new Error('Today’s ingredient swap has already been used.');
  const now = new Date().toISOString();
  const drawnRecipe = await drawRecipe(date, reroll ? existing?.recipeId : undefined);
  const next: KitchenSession = {
    id: date,
    date,
    recipeId: drawnRecipe.id,
    customRecipeSnapshot: drawnRecipe.customRecipeSnapshot,
    status: 'assigned',
    assignmentVariant: existing?.assignmentVariant ?? randomIndex(6),
    rerollUsed: Boolean(existing),
    assignedAt: existing?.assignedAt ?? now,
    ingredientChecks: {},
    stepChecks: {},
    rewardApplied: false,
    updatedAt: now,
  };
  await db.kitchenSessions.put(next);
  return next;
}

export async function assignSpecificKitchenOrder(date: LocalDateKey, recipeId: string) {
  const existing = await db.kitchenSessions.get(date);
  if (existing?.status === 'completed' || existing?.status === 'declined') {
    throw new Error(
      "Today's Kitchen Order is already closed. Saffron can guide this recipe as tomorrow's order.",
    );
  }
  if (existing?.recipeId === recipeId) return existing;
  const builtInRecipe = getKitchenRecipe(recipeId);
  const customRecipe = builtInRecipe
    ? undefined
    : (await getCustomKitchenRecipes()).find((recipe) => recipe.id === recipeId);
  if (!builtInRecipe && !customRecipe) {
    throw new Error("That recipe is no longer available in Saffron's Grimoire.");
  }
  const now = new Date().toISOString();
  const next: KitchenSession = {
    id: date,
    date,
    recipeId,
    customRecipeSnapshot: customRecipe,
    status: 'assigned',
    assignmentVariant: existing?.assignmentVariant ?? randomIndex(6),
    rerollUsed: existing?.rerollUsed ?? false,
    assignedAt: existing?.assignedAt ?? now,
    ingredientChecks: {},
    stepChecks: {},
    rewardApplied: false,
    updatedAt: now,
  };
  await db.kitchenSessions.put(next);
  return next;
}

export async function saveKitchenProgress(
  date: LocalDateKey,
  input: { ingredientChecks?: Record<string, boolean>; stepChecks?: Record<string, boolean> },
) {
  const session = await db.kitchenSessions.get(date);
  if (!session || session.status !== 'assigned') return session;
  const sanitize = (value: Record<string, boolean> | undefined) =>
    value
      ? Object.fromEntries(
          Object.entries(value)
            .slice(0, 100)
            .filter(([key]) => key.length <= 120)
            .map(([key, checked]) => [key, Boolean(checked)]),
        )
      : undefined;
  await db.kitchenSessions.update(date, {
    ingredientChecks: sanitize(input.ingredientChecks) ?? session.ingredientChecks,
    stepChecks: sanitize(input.stepChecks) ?? session.stepChecks,
    updatedAt: new Date().toISOString(),
  });
  return db.kitchenSessions.get(date);
}

export async function declineKitchenOrder(date: LocalDateKey) {
  const session = await db.kitchenSessions.get(date);
  if (!session || session.status !== 'assigned') return session;
  const next: KitchenSession = {
    ...session,
    status: 'declined',
    updatedAt: new Date().toISOString(),
  };
  await db.kitchenSessions.put(next);
  return next;
}

export async function completeKitchenOrder(input: {
  date: LocalDateKey;
  servingsPrepared: number;
  difficulty: number;
  rating: number;
  note?: string;
}) {
  const session = await db.kitchenSessions.get(input.date);
  if (!session || session.status !== 'assigned') {
    throw new Error('No active Kitchen Order is available to complete.');
  }
  const data = await getKitchenData(input.date);
  const rewardApplied = data.rewardAvailable;
  const rewardId = stableId('kitchen', input.date, session.recipeId, 'reward');
  const recipeName = resolveKitchenSessionRecipe(session)?.name ?? 'Personal Recipe';
  const now = new Date().toISOString();
  let levelsGained = 0;
  await db.transaction(
    'rw',
    [
      db.kitchenSessions,
      db.progression,
      db.stats,
      db.xpTransactions,
      db.statTransactions,
      db.levelHistory,
      db.progressionEvents,
    ],
    async () => {
      const latest = await db.kitchenSessions.get(input.date);
      if (!latest || latest.status !== 'assigned') return;
      if (rewardApplied && !(await db.xpTransactions.get(rewardId))) {
        const progression = await db.progression.get('primary');
        if (!progression) throw new Error('Account progression is unavailable.');
        const applied = applyAccountXp(
          progression.totalXp,
          BALANCE.kitchen.completedOrderAccountXp,
        );
        levelsGained = applied.levelsGained;
        const nextProgression = {
          ...progression,
          ...applied,
          lastLevelUpAt: applied.levelsGained ? now : progression.lastLevelUpAt,
          recentLevelUp: progression.recentLevelUp || applied.levelsGained > 0,
        };
        await db.progression.put(nextProgression);
        await db.xpTransactions.put({
          id: rewardId,
          kind: 'kitchen',
          amount: BALANCE.kitchen.completedOrderAccountXp,
          date: input.date,
          timestamp: now,
          sourceId: session.recipeId,
          note: `${recipeName} Kitchen Order completed`,
        });
        await putLevelHistory(nextProgression, progression.level, input.date, rewardId, now);
        for (const [statName, amount] of Object.entries(BALANCE.kitchen.completedOrderStatXp) as [
          StatName,
          number,
        ][]) {
          const stat = await db.stats.get(statName);
          if (!stat) continue;
          const statId = stableId(rewardId, statName);
          await db.stats.put(applyStatChange(stat, amount, 0, now));
          await db.statTransactions.put({
            id: statId,
            stat: statName,
            kind: 'kitchen',
            amount,
            momentumDelta: 0,
            date: input.date,
            timestamp: now,
            sourceId: session.recipeId,
            note: 'Saffron’s completed Kitchen Order',
          });
        }
      }
      await db.kitchenSessions.put({
        ...latest,
        status: 'completed',
        completedAt: now,
        servingsPrepared: Math.max(1, Math.min(20, Math.floor(input.servingsPrepared))),
        difficulty: Math.max(1, Math.min(5, Math.floor(input.difficulty))),
        rating: Math.max(1, Math.min(5, Math.floor(input.rating))),
        note: input.note?.trim().slice(0, 1000) || undefined,
        rewardApplied,
        updatedAt: now,
      });
    },
  );
  await queueCompanionReaction({
    trigger: 'kitchen',
    sourceId: `kitchen:${input.date}:${session.recipeId}`,
    companionId: 'saffron',
  });
  return {
    session: (await db.kitchenSessions.get(input.date))!,
    awardedXp: rewardApplied ? BALANCE.kitchen.completedOrderAccountXp : 0,
    levelsGained,
  };
}
