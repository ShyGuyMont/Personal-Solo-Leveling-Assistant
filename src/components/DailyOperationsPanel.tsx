import { BookHeart, ChefHat, Dumbbell, ShieldAlert, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getCompanion, getCompanionImage } from '@/config/companions';
import { getDailyOperations } from '@/game/dailyOperations';
import { Link } from '@/router';
import type { DailyOperationsRecord, LocalDateKey, PreparedOperationState } from '@/types/game';

function actionLabel(state: PreparedOperationState | undefined, readyLabel: string) {
  if (state === 'completed') return 'Review';
  if (state === 'active') return 'Resume';
  if (state === 'changed') return 'Open';
  return readyLabel;
}

export function DailyOperationsPanel({ date }: { date: LocalDateKey }) {
  const [operations, setOperations] = useState<DailyOperationsRecord>();

  useEffect(() => {
    const update = () =>
      void getDailyOperations(date)
        .then(setOperations)
        .catch(() => setOperations(undefined));
    update();
    window.addEventListener('system:daily-operations-changed', update);
    return () => window.removeEventListener('system:daily-operations-changed', update);
  }, [date]);

  if (!operations || operations.status === 'awaiting-confirmation') return null;
  const snow = getCompanion('snow');
  const preparedCount = [operations.training, operations.kitchen, operations.sanctuary].filter(
    Boolean,
  ).length;
  const completedCount = [
    operations.training?.state,
    operations.kitchen?.state,
    operations.sanctuary?.state,
  ].filter((state) => state === 'completed').length;
  const preparing = operations.status === 'preparing';
  const allCleared = preparedCount > 0 && completedCount === preparedCount;

  return (
    <section className={`panel daily-operations is-${operations.status}`}>
      <header className="daily-operations__header">
        <div className="daily-operations__snow">
          <img src={getCompanionImage(snow.image)} alt="" />
          <div>
            <p className="eyebrow">SNOW'S PARTY OPERATIONS</p>
            <h2>
              {preparing
                ? "Snow is assembling today's assignments."
                : allCleared
                  ? "Today's prepared assignments are cleared."
                  : operations.status === 'partial'
                    ? 'Some assignments need your attention.'
                    : "Today's assignments are assembled."}
            </h2>
            <p>
              {preparedCount} realm{preparedCount === 1 ? '' : 's'} prepared · {completedCount}{' '}
              cleared · {operations.pendingMissionCount} missions remain · preparation never claims
              completion
            </p>
          </div>
        </div>
        <span className="daily-operations__signal">
          <Sparkles size={15} />{' '}
          {preparing
            ? 'ASSEMBLING'
            : operations.status === 'partial'
              ? 'READY WITH FLAGS'
              : allCleared
                ? 'ASSIGNMENTS CLEARED'
                : 'PARTY READY'}
        </span>
      </header>

      <div className="daily-operations__grid">
        {operations.training && (
          <Link
            to="/training-hall"
            className={`daily-operations__card is-training is-${operations.training.state ?? 'ready'}`}
          >
            <Dumbbell size={20} />
            <span>
              <small>{operations.training.companionIds.join(' + ').toUpperCase()}</small>
              <strong>{operations.training.label}</strong>
              <em>{operations.training.detail}</em>
            </span>
            <b>{actionLabel(operations.training.state, 'Begin')}</b>
          </Link>
        )}
        {operations.kitchen && (
          <Link
            to="/kitchen"
            className={`daily-operations__card is-kitchen is-${operations.kitchen.state ?? 'ready'}`}
          >
            <ChefHat size={20} />
            <span>
              <small>SAFFRON · KITCHEN ORDER</small>
              <strong>{operations.kitchen.label}</strong>
              <em>{operations.kitchen.detail}</em>
            </span>
            <b>{actionLabel(operations.kitchen.state, 'Cook')}</b>
          </Link>
        )}
        {operations.sanctuary && (
          <Link
            to="/sanctuary"
            className={`daily-operations__card is-sanctuary is-${operations.sanctuary.state ?? 'ready'}`}
          >
            <BookHeart size={20} />
            <span>
              <small>SELAH · {operations.sanctuary.mode.toUpperCase()}</small>
              <strong>{operations.sanctuary.label}</strong>
              <em>{operations.sanctuary.detail}</em>
            </span>
            <b>{actionLabel(operations.sanctuary.state, 'Enter')}</b>
          </Link>
        )}
      </div>

      {operations.preparationNotes.length > 0 && (
        <div className="daily-operations__flags">
          <ShieldAlert size={17} />
          <div>
            <strong>Snow preserved the unresolved pieces.</strong>
            {operations.preparationNotes.map((note) => (
              <p key={note}>{note}</p>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
