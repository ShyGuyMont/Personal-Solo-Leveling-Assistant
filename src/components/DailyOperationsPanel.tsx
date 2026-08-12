import { BookHeart, ChefHat, Dumbbell, ShieldAlert, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getCompanion, getCompanionImage } from '@/config/companions';
import { getDailyOperations } from '@/game/dailyOperations';
import { Link } from '@/router';
import type { DailyOperationsRecord, LocalDateKey } from '@/types/game';

export function DailyOperationsPanel({ date }: { date: LocalDateKey }) {
  const [operations, setOperations] = useState<DailyOperationsRecord>();

  useEffect(() => {
    const update = () => void getDailyOperations(date).then(setOperations);
    update();
    window.addEventListener('system:daily-operations-changed', update);
    return () => window.removeEventListener('system:daily-operations-changed', update);
  }, [date]);

  if (!operations || operations.status === 'awaiting-confirmation') return null;
  const snow = getCompanion('snow');
  const preparedCount = [operations.training, operations.kitchen, operations.sanctuary].filter(
    Boolean,
  ).length;

  return (
    <section className={`panel daily-operations is-${operations.status}`}>
      <header className="daily-operations__header">
        <div className="daily-operations__snow">
          <img src={getCompanionImage(snow.image)} alt="" />
          <div>
            <p className="eyebrow">SNOW'S PARTY OPERATIONS</p>
            <h2>Todayâ€™s assignments are assembled.</h2>
            <p>
              {preparedCount} realm{preparedCount === 1 ? '' : 's'} prepared ·{' '}
              {operations.pendingMissionCount} missions remain · no completion was claimed
            </p>
          </div>
        </div>
        <span className="daily-operations__signal">
          <Sparkles size={15} />{' '}
          {operations.status === 'partial' ? 'READY WITH FLAGS' : 'PARTY READY'}
        </span>
      </header>

      <div className="daily-operations__grid">
        {operations.training && (
          <Link to="/training-hall" className="daily-operations__card is-training">
            <Dumbbell size={20} />
            <span>
              <small>{operations.training.companionIds.join(' + ').toUpperCase()}</small>
              <strong>{operations.training.label}</strong>
              <em>{operations.training.detail}</em>
            </span>
            <b>Begin</b>
          </Link>
        )}
        {operations.kitchen && (
          <Link to="/kitchen" className="daily-operations__card is-kitchen">
            <ChefHat size={20} />
            <span>
              <small>SAFFRON · KITCHEN ORDER</small>
              <strong>{operations.kitchen.label}</strong>
              <em>{operations.kitchen.detail}</em>
            </span>
            <b>Cook</b>
          </Link>
        )}
        {operations.sanctuary && (
          <Link to="/sanctuary" className="daily-operations__card is-sanctuary">
            <BookHeart size={20} />
            <span>
              <small>SELAH · {operations.sanctuary.mode.toUpperCase()}</small>
              <strong>{operations.sanctuary.label}</strong>
              <em>{operations.sanctuary.detail}</em>
            </span>
            <b>Enter</b>
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
