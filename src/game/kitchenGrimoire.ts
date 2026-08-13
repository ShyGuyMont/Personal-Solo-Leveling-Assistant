import { db } from '@/db/database';
import type { CustomKitchenRecipe } from '@/types/game';

const GRIMOIRE_METADATA_ID = 'saffron-private-grimoire';

interface StoredGrimoire {
  recipes: CustomKitchenRecipe[];
}

function cleanText(value: unknown, max: number) {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ').slice(0, max) : '';
}

function cleanList(value: unknown, maxItems: number, maxLength: number) {
  return Array.isArray(value)
    ? value
        .map((item) => cleanText(item, maxLength))
        .filter(Boolean)
        .slice(0, maxItems)
    : [];
}

function parseRecipe(value: unknown): CustomKitchenRecipe | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  const record = value as Record<string, unknown>;
  const name = cleanText(record.name, 100);
  const ingredients = cleanList(record.ingredients, 24, 180);
  const steps = cleanList(record.steps, 16, 320);
  if (!name || ingredients.length < 2 || steps.length < 2) return undefined;
  const costTier = record.costTier === '$$$' || record.costTier === '$$' ? record.costTier : '$';
  return {
    id: cleanText(record.id, 120) || crypto.randomUUID(),
    name,
    codename: cleanText(record.codename, 100) || 'PRIVATE GRIMOIRE ORDER',
    servings: Math.max(1, Math.min(20, Math.round(Number(record.servings) || 4))),
    prepMinutes: Math.max(0, Math.min(240, Math.round(Number(record.prepMinutes) || 10))),
    cookMinutes: Math.max(0, Math.min(480, Math.round(Number(record.cookMinutes) || 20))),
    costTier,
    equipment: cleanText(record.equipment, 240),
    plate: cleanText(record.plate, 400),
    ingredients,
    steps,
    swaps: cleanList(record.swaps, 8, 240),
    storage: cleanText(record.storage, 400),
    safety: cleanText(record.safety, 400),
    dailyRotationEnabled: record.dailyRotationEnabled !== false,
    sourceCompanionId: 'saffron',
    createdAt: cleanText(record.createdAt, 40) || new Date().toISOString(),
    updatedAt: cleanText(record.updatedAt, 40) || new Date().toISOString(),
  };
}

export async function getCustomKitchenRecipes() {
  const metadata = await db.appMetadata.get(GRIMOIRE_METADATA_ID);
  const value = metadata?.value;
  if (!value || typeof value !== 'object' || Array.isArray(value)) return [];
  const recipes = (value as unknown as StoredGrimoire).recipes;
  return Array.isArray(recipes)
    ? recipes.map(parseRecipe).filter((recipe): recipe is CustomKitchenRecipe => Boolean(recipe))
    : [];
}

export async function saveCustomKitchenRecipe(
  input: Omit<
    CustomKitchenRecipe,
    'id' | 'dailyRotationEnabled' | 'sourceCompanionId' | 'createdAt' | 'updatedAt'
  > & { dailyRotationEnabled?: boolean },
) {
  const now = new Date().toISOString();
  const recipe = parseRecipe({
    ...input,
    id: crypto.randomUUID(),
    sourceCompanionId: 'saffron',
    createdAt: now,
    updatedAt: now,
  });
  if (!recipe) throw new Error('That recipe draft is incomplete.');
  const current = await getCustomKitchenRecipes();
  const duplicate = current.some(
    (item) => item.name.trim().toLowerCase() === recipe.name.trim().toLowerCase(),
  );
  if (duplicate) throw new Error(`${recipe.name} is already in Saffron’s Private Grimoire.`);
  const recipes = [recipe, ...current].slice(0, 40);
  await db.appMetadata.put({
    id: GRIMOIRE_METADATA_ID,
    value: { recipes } as unknown as Record<string, unknown>,
    updatedAt: now,
  });
  window.dispatchEvent(new CustomEvent('system:kitchen-grimoire-changed'));
  return recipe;
}

export async function deleteCustomKitchenRecipe(id: string) {
  const recipes = (await getCustomKitchenRecipes()).filter((recipe) => recipe.id !== id);
  await db.appMetadata.put({
    id: GRIMOIRE_METADATA_ID,
    value: { recipes } as unknown as Record<string, unknown>,
    updatedAt: new Date().toISOString(),
  });
  window.dispatchEvent(new CustomEvent('system:kitchen-grimoire-changed'));
}

export async function setCustomKitchenRecipeRotation(id: string, enabled: boolean) {
  const current = await getCustomKitchenRecipes();
  const recipe = current.find((item) => item.id === id);
  if (!recipe) throw new Error("That recipe is no longer in Saffron's Private Grimoire.");
  const now = new Date().toISOString();
  const recipes = current.map((item) =>
    item.id === id ? { ...item, dailyRotationEnabled: enabled, updatedAt: now } : item,
  );
  await db.appMetadata.put({
    id: GRIMOIRE_METADATA_ID,
    value: { recipes } as unknown as Record<string, unknown>,
    updatedAt: now,
  });
  window.dispatchEvent(new CustomEvent('system:kitchen-grimoire-changed'));
  return recipes.find((item) => item.id === id)!;
}
