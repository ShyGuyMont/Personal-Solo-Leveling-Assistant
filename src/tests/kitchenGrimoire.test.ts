import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '@/db/database';
import {
  deleteCustomKitchenRecipe,
  getCustomKitchenRecipes,
  saveCustomKitchenRecipe,
  setCustomKitchenRecipeRotation,
} from '@/game/kitchenGrimoire';

describe("Saffron's Private Grimoire", () => {
  beforeEach(async () => {
    await db.appMetadata.delete('saffron-private-grimoire');
  });

  it('saves a confirmed recipe locally and lets the Hunter remove it', async () => {
    const saved = await saveCustomKitchenRecipe({
      name: 'Fast Fire Chicken',
      codename: 'TWENTY-MINUTE IGNITION',
      servings: 4,
      prepMinutes: 8,
      cookMinutes: 12,
      costTier: '$',
      equipment: 'Large skillet',
      plate: 'Chicken, rice, and vegetables.',
      ingredients: ['1 lb chicken breast, diced', '2 cups cooked rice', '2 cups vegetables'],
      steps: [
        'Cook the chicken to 165°F.',
        'Add vegetables and cook until tender.',
        'Serve over rice.',
      ],
      swaps: ['Use turkey instead of chicken.'],
      storage: 'Refrigerate within two hours and use within four days.',
      safety: 'Verify the thickest chicken pieces reach 165°F.',
    });

    expect(await getCustomKitchenRecipes()).toEqual([
      expect.objectContaining({ id: saved.id, dailyRotationEnabled: true }),
    ]);
    await deleteCustomKitchenRecipe(saved.id);
    expect(await getCustomKitchenRecipes()).toEqual([]);
  });

  it('rejects duplicate names instead of silently replacing a recipe', async () => {
    const recipe = {
      name: 'Fast Fire Chicken',
      codename: 'IGNITION',
      servings: 2,
      prepMinutes: 5,
      cookMinutes: 15,
      costTier: '$' as const,
      equipment: 'Skillet',
      plate: 'Chicken and rice.',
      ingredients: ['1 lb chicken', '2 cups rice'],
      steps: ['Cook chicken to 165°F.', 'Serve with rice.'],
      swaps: [],
      storage: 'Refrigerate promptly.',
      safety: 'Cook chicken to 165°F.',
    };
    await saveCustomKitchenRecipe(recipe);
    await expect(saveCustomKitchenRecipe(recipe)).rejects.toThrow(/already in/i);
  });

  it('lets the Hunter include or remove a personal recipe from Daily Rotation', async () => {
    const saved = await saveCustomKitchenRecipe({
      name: 'Quiet Flame Salmon',
      codename: 'CALM HEAT',
      servings: 2,
      prepMinutes: 5,
      cookMinutes: 15,
      costTier: '$$',
      equipment: 'Sheet pan',
      plate: 'Salmon, potatoes, and greens.',
      ingredients: ['2 salmon fillets', '2 cups potatoes', '2 cups spinach'],
      steps: ['Roast the potatoes.', 'Cook salmon to 145°F.', 'Serve with spinach.'],
      swaps: [],
      storage: 'Refrigerate promptly.',
      safety: 'Cook fish to 145°F.',
    });

    await setCustomKitchenRecipeRotation(saved.id, false);
    expect((await getCustomKitchenRecipes())[0]).toEqual(
      expect.objectContaining({ id: saved.id, dailyRotationEnabled: false }),
    );
    await setCustomKitchenRecipeRotation(saved.id, true);
    expect((await getCustomKitchenRecipes())[0].dailyRotationEnabled).toBe(true);
  });
});
