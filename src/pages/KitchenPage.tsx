import {
  BookMarked,
  CalendarDays,
  Check,
  ChefHat,
  Clock3,
  Coins,
  CookingPot,
  Flame,
  History,
  Play,
  RotateCcw,
  ShieldCheck,
  ShoppingBasket,
  Star,
  Trash2,
  UtensilsCrossed,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { BALANCE } from '@/config/balance';
import {
  KITCHEN_RECIPES,
  SAFFRON_ASSIGNMENT_LINES,
  SAFFRON_COMPLETION_LINES,
} from '@/config/kitchen';
import { getCompanion, getCompanionImage } from '@/config/companions';
import {
  assignKitchenOrder,
  assignSpecificKitchenOrder,
  completeKitchenOrder,
  declineKitchenOrder,
  getKitchenData,
  resolveKitchenSessionRecipe,
  saveKitchenProgress,
} from '@/game/kitchen';
import {
  deleteCustomKitchenRecipe,
  getCustomKitchenRecipes,
  setCustomKitchenRecipeRotation,
} from '@/game/kitchenGrimoire';
import { useGameStore } from '@/store/useGameStore';
import type { CustomKitchenRecipe, KitchenSession } from '@/types/game';

type KitchenData = Awaited<ReturnType<typeof getKitchenData>>;

function OrderMeter({ completed, limit }: { completed: number; limit: number }) {
  return (
    <div className="kitchen-order-meter" aria-label={`${completed} of ${limit} rewarded orders`}>
      {Array.from({ length: limit }, (_, index) => (
        <span key={index} className={index < completed ? 'is-complete' : ''}>
          {index < completed ? <Check size={15} /> : <CookingPot size={15} />}
        </span>
      ))}
    </div>
  );
}

export function KitchenPage() {
  const { systemDate, refresh } = useGameStore();
  const [data, setData] = useState<KitchenData>();
  const [session, setSession] = useState<KitchenSession>();
  const [customRecipes, setCustomRecipes] = useState<CustomKitchenRecipe[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [servings, setServings] = useState(4);
  const [difficulty, setDifficulty] = useState(3);
  const [rating, setRating] = useState(4);
  const [note, setNote] = useState('');
  const saffron = getCompanion('saffron');

  const reload = useCallback(async () => {
    const [next, savedRecipes] = await Promise.all([
      getKitchenData(systemDate),
      getCustomKitchenRecipes(),
    ]);
    setData(next);
    setCustomRecipes(savedRecipes);
    setSession(next.today);
    if (next.today) {
      const recipe = resolveKitchenSessionRecipe(next.today);
      setServings(next.today.servingsPrepared ?? recipe?.servings ?? 4);
      setDifficulty(next.today.difficulty ?? 3);
      setRating(next.today.rating ?? 4);
      setNote(next.today.note ?? '');
    }
  }, [systemDate]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    const update = () => void reload();
    window.addEventListener('system:kitchen-grimoire-changed', update);
    return () => window.removeEventListener('system:kitchen-grimoire-changed', update);
  }, [reload]);

  const act = async (action: () => Promise<unknown>) => {
    setBusy(true);
    setError('');
    try {
      await action();
      await Promise.all([reload(), refresh()]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'The Kitchen could not save that order.');
    } finally {
      setBusy(false);
    }
  };

  const recipe = resolveKitchenSessionRecipe(session);
  const rotationRecipeCount =
    KITCHEN_RECIPES.length + customRecipes.filter((item) => item.dailyRotationEnabled).length;
  const completedSteps = useMemo(
    () => recipe?.steps.filter((step) => session?.stepChecks?.[step]).length ?? 0,
    [recipe, session?.stepChecks],
  );

  const toggleChecklist = async (kind: 'ingredient' | 'step', item: string) => {
    if (!session) return;
    const current =
      kind === 'ingredient' ? (session.ingredientChecks ?? {}) : (session.stepChecks ?? {});
    const next = { ...current, [item]: !current[item] };
    setSession({
      ...session,
      ...(kind === 'ingredient' ? { ingredientChecks: next } : { stepChecks: next }),
    });
    try {
      await saveKitchenProgress(systemDate, {
        ...(kind === 'ingredient' ? { ingredientChecks: next } : { stepChecks: next }),
      });
    } catch {
      setError('That checklist change did not save. Tap it again.');
    }
  };

  async function removeCustomRecipe(recipe: CustomKitchenRecipe) {
    const confirmed = window.confirm(
      `Remove ${recipe.name} from Saffron's Private Grimoire? This cannot be undone.`,
    );
    if (!confirmed) return;
    await deleteCustomKitchenRecipe(recipe.id);
    await reload();
  }

  function cookWithSaffron(recipeId: string, recipeName: string) {
    if (
      session?.status === 'assigned' &&
      session.recipeId !== recipeId &&
      !window.confirm(
        `Replace today's current Kitchen Order with ${recipeName}? The current checklist progress will be cleared.`,
      )
    ) {
      return;
    }
    void act(async () => {
      await assignSpecificKitchenOrder(systemDate, recipeId);
      window.setTimeout(
        () =>
          document.querySelector('.kitchen-order-briefing')?.scrollIntoView({ behavior: 'smooth' }),
        80,
      );
    });
  }

  if (!data) {
    return (
      <div className="page kitchen-page">
        <section className="panel kitchen-loading">Saffron is igniting the Kitchen…</section>
      </div>
    );
  }

  return (
    <div className="page kitchen-page">
      <section
        className="panel kitchen-hero"
        style={{ '--companion-accent': saffron.accent } as React.CSSProperties}
      >
        <div className="kitchen-hero__portrait">
          <img src={getCompanionImage(saffron.image)} alt="Saffron, The Flame Chef" />
          <span>
            <Flame size={14} /> KITCHEN ONLINE
          </span>
        </div>
        <div className="kitchen-hero__copy">
          <p className="eyebrow">SAFFRON · THE FLAME CHEF · PROVISION COMMAND</p>
          <h1>Cook once. Protect several tomorrows.</h1>
          <p>
            Saffron assigns a complete, no-bean, no-pea meal built around foods you actually enjoy.
            Each order supports the Training Hall, fights delivery spending, and usually leaves
            tomorrow-you a ready meal.
          </p>
          <div className="kitchen-hero__chips">
            <span>
              <ShieldCheck size={15} /> Protein anchored
            </span>
            <span>
              <Coins size={15} /> Home-budget friendly
            </span>
            <span>
              <ShoppingBasket size={15} /> Four servings
            </span>
          </div>
        </div>
      </section>

      {error && <div className="inline-error">{error}</div>}

      <section className="panel kitchen-reward-card">
        <div>
          <p className="eyebrow">WEEKLY PROVISION ORDERS</p>
          <h2>
            {data.rewardedThisWeek}/{data.rewardedOrderLimit} rewarded meals
          </h2>
          <p>
            The first {data.rewardedOrderLimit} completed orders each week award{' '}
            <strong>{BALANCE.kitchen.completedOrderAccountXp} XP</strong>, plus Stewardship,
            Vitality, and Discipline XP. Extra cooking still records the win without becoming an XP
            farm.
          </p>
        </div>
        <OrderMeter completed={data.rewardedThisWeek} limit={data.rewardedOrderLimit} />
      </section>

      {!session && (
        <section className="panel kitchen-summons">
          <img src={getCompanionImage(saffron.image)} alt="" />
          <div>
            <p className="eyebrow">TODAY'S STOVE IS QUIET</p>
            <h2>Ask Saffron for a Kitchen Order</h2>
            <p>
              She rotates among {rotationRecipeCount} practical recipes, avoids your recent meals,
              and gives you one ingredient swap if the first assignment is not workable.
            </p>
            <button
              className="button button--primary"
              disabled={busy}
              onClick={() => void act(() => assignKitchenOrder(systemDate))}
            >
              <ChefHat size={18} /> {busy ? 'Saffron is deciding…' : 'Receive today’s order'}
            </button>
          </div>
        </section>
      )}

      {session?.status === 'assigned' && recipe && (
        <>
          <section className="panel kitchen-order-briefing">
            <img src={getCompanionImage(saffron.image)} alt="" />
            <div>
              <span>SAFFRON · DIRECT ORDER</span>
              <p>
                “
                {
                  SAFFRON_ASSIGNMENT_LINES[
                    session.assignmentVariant % SAFFRON_ASSIGNMENT_LINES.length
                  ]
                }
                ”
              </p>
            </div>
          </section>

          <section className="panel kitchen-recipe-console">
            <header className="kitchen-recipe-header">
              <div>
                <p className="eyebrow">{recipe.codename}</p>
                <h2>{recipe.name}</h2>
                <p>
                  {'saffronFavorite' in recipe
                    ? recipe.saffronFavorite
                    : "You forged this one with me. I saved every ingredient and every step—now let's cook it properly!"}
                </p>
              </div>
              <div className="kitchen-recipe-meta">
                <span>
                  <Clock3 size={16} /> {recipe.prepMinutes + recipe.cookMinutes} min
                </span>
                <span>
                  <UtensilsCrossed size={16} /> {recipe.servings} servings
                </span>
                <span>
                  <Coins size={16} /> {recipe.costTier}
                </span>
              </div>
            </header>

            <div className="kitchen-plate-note">
              <strong>WHY THIS PLATE WORKS</strong>
              <p>{recipe.plate}</p>
            </div>

            <div className="kitchen-recipe-grid">
              <section>
                <h3>Gather the ingredients</h3>
                <div className="kitchen-checklist">
                  {recipe.ingredients.map((ingredient) => (
                    <button
                      key={ingredient}
                      className={session.ingredientChecks?.[ingredient] ? 'is-checked' : ''}
                      onClick={() => void toggleChecklist('ingredient', ingredient)}
                    >
                      <span>
                        {session.ingredientChecks?.[ingredient] ? <Check size={15} /> : null}
                      </span>
                      {ingredient}
                    </button>
                  ))}
                </div>
              </section>
              <section>
                <h3>Execute the recipe</h3>
                <div className="kitchen-checklist is-steps">
                  {recipe.steps.map((step, index) => (
                    <button
                      key={step}
                      className={session.stepChecks?.[step] ? 'is-checked' : ''}
                      onClick={() => void toggleChecklist('step', step)}
                    >
                      <span>{session.stepChecks?.[step] ? <Check size={15} /> : index + 1}</span>
                      {step}
                    </button>
                  ))}
                </div>
              </section>
            </div>

            <div className="kitchen-intel-grid">
              <article>
                <strong>Easy swaps</strong>
                <ul>
                  {recipe.swaps.map((swap) => (
                    <li key={swap}>{swap}</li>
                  ))}
                </ul>
              </article>
              <article>
                <strong>Leftover command</strong>
                <p>{recipe.storage}</p>
              </article>
              <article>
                <strong>Food-safety checkpoint</strong>
                <p>{recipe.safety}</p>
              </article>
            </div>

            <div className="kitchen-order-actions">
              <button
                className="button button--secondary"
                disabled={busy || session.rerollUsed}
                onClick={() => void act(() => assignKitchenOrder(systemDate, true))}
              >
                <RotateCcw size={17} />
                {session.rerollUsed ? 'Ingredient swap used' : 'Use ingredient swap'}
              </button>
              <button
                className="text-button"
                disabled={busy}
                onClick={() => void act(() => declineKitchenOrder(systemDate))}
              >
                Decline today—no penalty
              </button>
            </div>
          </section>

          <section className="panel kitchen-completion-card">
            <div>
              <p className="eyebrow">CLEAR THE ORDER</p>
              <h2>
                {completedSteps}/{recipe.steps.length} steps checked
              </h2>
              <p>Checklists help you cook; completion remains an honor-system declaration.</p>
            </div>
            <div className="kitchen-completion-grid">
              <label>
                <span>Servings prepared</span>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={servings}
                  onChange={(event) => setServings(Number(event.target.value))}
                />
              </label>
              <label>
                <span>Cooking effort · {difficulty}/5</span>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={difficulty}
                  onChange={(event) => setDifficulty(Number(event.target.value))}
                />
              </label>
              <label>
                <span>Would make again · {rating}/5</span>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={rating}
                  onChange={(event) => setRating(Number(event.target.value))}
                />
              </label>
            </div>
            <label>
              <span>Adjustment for next time (optional)</span>
              <textarea
                maxLength={1000}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="More seasoning, less cook time, use frozen vegetables…"
              />
            </label>
            <button
              className="button button--primary kitchen-clear-button"
              disabled={busy}
              onClick={() =>
                void act(() =>
                  completeKitchenOrder({
                    date: systemDate,
                    servingsPrepared: servings,
                    difficulty,
                    rating,
                    note,
                  }),
                )
              }
            >
              <CookingPot size={18} /> {busy ? 'Recording meal…' : 'I cooked this meal'}
            </button>
          </section>
        </>
      )}

      {session?.status === 'completed' && recipe && (
        <section className="panel kitchen-complete-state">
          <div className="kitchen-complete-state__portrait">
            <img src={getCompanionImage(saffron.image)} alt="" />
            <span>
              <Check size={17} />
            </span>
          </div>
          <div>
            <p className="eyebrow">KITCHEN ORDER CLEARED</p>
            <h2>{recipe.name}</h2>
            <p>
              “
              {
                SAFFRON_COMPLETION_LINES[
                  session.assignmentVariant % SAFFRON_COMPLETION_LINES.length
                ]
              }
              ”
            </p>
            <div className="kitchen-result-chips">
              <span>{session.servingsPrepared} servings</span>
              <span>
                <Star size={14} /> {session.rating}/5
              </span>
              <span>
                {session.rewardApplied
                  ? `+${BALANCE.kitchen.completedOrderAccountXp} XP`
                  : 'Weekly XP cap reached'}
              </span>
            </div>
          </div>
        </section>
      )}

      {session?.status === 'declined' && (
        <section className="panel kitchen-declined-state">
          <ShieldCheck size={24} />
          <div>
            <p className="eyebrow">ORDER DECLINED · NO PENALTY</p>
            <h2>The Kitchen will issue a new order tomorrow.</h2>
            <p>Saffron is loudly disappointed in the circumstances—not in you.</p>
          </div>
        </section>
      )}

      <section className="panel kitchen-private-grimoire">
        <header className="section-header">
          <div>
            <p className="eyebrow">SAFFRON'S PRIVATE GRIMOIRE</p>
            <h2>
              {customRecipes.length
                ? `${customRecipes.length} personal recipes`
                : 'Ready for your first creation'}
            </h2>
            <p>
              Ask Saffron in Quick Link to create a recipe. She previews the complete order, and it
              only appears here after you confirm the save.
            </p>
          </div>
          <BookMarked size={23} />
        </header>
        {customRecipes.length ? (
          <div className="kitchen-library__grid kitchen-private-grimoire__grid">
            {customRecipes.map((item) => (
              <details key={item.id}>
                <summary>
                  <span>
                    <strong>{item.name}</strong>
                    <small>
                      {item.prepMinutes + item.cookMinutes} min · {item.servings} servings ·{' '}
                      {item.costTier}
                    </small>
                    <small className={item.dailyRotationEnabled ? 'is-in-rotation' : ''}>
                      {item.dailyRotationEnabled ? 'Daily Rotation active' : 'Saved only'}
                    </small>
                  </span>
                  <CookingPot size={18} />
                </summary>
                <p className="eyebrow">{item.codename}</p>
                <strong>Ingredients</strong>
                <ul>
                  {item.ingredients.map((ingredient) => (
                    <li key={ingredient}>{ingredient}</li>
                  ))}
                </ul>
                <strong>Method</strong>
                <ol>
                  {item.steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
                <p className="kitchen-library__safety">
                  <ShieldCheck size={15} /> {item.safety}
                </p>
                <p>{item.storage}</p>
                <div className="kitchen-private-grimoire__actions">
                  <button
                    type="button"
                    className="button button--primary"
                    disabled={busy}
                    onClick={() => cookWithSaffron(item.id, item.name)}
                  >
                    <Play size={15} />
                    {session?.status === 'assigned' && session.recipeId === item.id
                      ? 'Resume with Saffron'
                      : 'Cook with Saffron'}
                  </button>
                  <button
                    type="button"
                    className="button button--secondary"
                    disabled={busy}
                    aria-pressed={item.dailyRotationEnabled}
                    onClick={() =>
                      void act(() =>
                        setCustomKitchenRecipeRotation(item.id, !item.dailyRotationEnabled),
                      )
                    }
                  >
                    <CalendarDays size={15} />
                    {item.dailyRotationEnabled ? 'In Daily Rotation' : 'Add to Daily Rotation'}
                  </button>
                  <button
                    type="button"
                    className="text-button kitchen-private-grimoire__delete"
                    onClick={() => void removeCustomRecipe(item)}
                  >
                    <Trash2 size={14} /> Remove recipe
                  </button>
                </div>
              </details>
            ))}
          </div>
        ) : (
          <div className="kitchen-private-grimoire__empty">
            <BookMarked size={22} />
            <span>
              Try: “Saffron, create a high-protein chicken dinner under 30 minutes and save it.”
            </span>
          </div>
        )}
      </section>

      <section className="panel kitchen-library">
        <header className="section-header">
          <div>
            <p className="eyebrow">SAFFRON'S RECIPE GRIMOIRE</p>
            <h2>Browse all {KITCHEN_RECIPES.length} meals</h2>
            <p>Browse anytime. Only Saffron’s daily assigned order grants Kitchen XP.</p>
          </div>
          <ChefHat size={23} />
        </header>
        <div className="kitchen-library__grid">
          {KITCHEN_RECIPES.map((item) => (
            <details key={item.id}>
              <summary>
                <span>
                  <strong>{item.name}</strong>
                  <small>
                    {item.protein} · {item.prepMinutes + item.cookMinutes} min · {item.costTier}
                  </small>
                </span>
                <CookingPot size={18} />
              </summary>
              <p>{item.plate}</p>
              <strong>Ingredients</strong>
              <ul>
                {item.ingredients.map((ingredient) => (
                  <li key={ingredient}>{ingredient}</li>
                ))}
              </ul>
              <strong>Method</strong>
              <ol>
                {item.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
              <p className="kitchen-library__safety">
                <ShieldCheck size={15} /> {item.safety}
              </p>
              <button
                type="button"
                className="button button--secondary kitchen-library__cook"
                disabled={busy}
                onClick={() => cookWithSaffron(item.id, item.name)}
              >
                <Play size={15} />
                {session?.status === 'assigned' && session.recipeId === item.id
                  ? 'Resume with Saffron'
                  : 'Cook with Saffron'}
              </button>
            </details>
          ))}
        </div>
      </section>

      <section className="panel kitchen-history">
        <header className="section-header">
          <div>
            <p className="eyebrow">PROVISION ARCHIVE</p>
            <h2>Recent orders</h2>
          </div>
          <History size={21} />
        </header>
        <div className="kitchen-history__list">
          {data.history
            .filter((entry) => entry.status !== 'assigned')
            .slice(0, 8)
            .map((entry) => (
              <article key={entry.id}>
                <span className={entry.status === 'completed' ? 'is-complete' : ''}>
                  {entry.status === 'completed' ? (
                    <Check size={16} />
                  ) : (
                    <UtensilsCrossed size={16} />
                  )}
                </span>
                <div>
                  <strong>{resolveKitchenSessionRecipe(entry)?.name ?? 'Archived recipe'}</strong>
                  <small>
                    {entry.date} ·{' '}
                    {entry.status === 'completed'
                      ? `${entry.servingsPrepared} servings`
                      : 'Declined without penalty'}
                  </small>
                </div>
                <em>
                  {entry.rewardApplied
                    ? `+${BALANCE.kitchen.completedOrderAccountXp} XP`
                    : 'LOGGED'}
                </em>
              </article>
            ))}
          {!data.history.some((entry) => entry.status !== 'assigned') && (
            <p>Your first cleared order will appear here.</p>
          )}
        </div>
      </section>

      <p className="kitchen-disclaimer">
        Saffron provides general meal-planning support, not medical nutrition therapy. Adjust for
        allergies, health conditions, and guidance from your own clinician.
      </p>
    </div>
  );
}
