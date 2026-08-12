import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '@/db/database';
import {
  deleteCustomKitchenRecipe,
  getCustomKitchenRecipes,
  saveCustomKitchenRecipe,
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

    expect(await getCustomKitchenRecipes()).toEqual([expect.objectContaining({ id: saved.id })]);
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
});
