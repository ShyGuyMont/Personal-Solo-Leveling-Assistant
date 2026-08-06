import { ArrowRight, HeartPulse, ShieldCheck } from 'lucide-react';
import { getCompanion, getCompanionImage } from '@/config/companions';
import { getPartyPulseSignals } from '@/game/partyPulse';
import { Link } from '@/router';
import { useGameStore } from '@/store/useGameStore';
import { STAT_LABELS } from '@/utils/format';

const MODE_LIMIT = {
  quiet: 1,
  balanced: 2,
  talkative: 3,
  off: 0,
} as const;

export function PartyPulsePanel() {
  const { stats, settings } = useGameStore();
  if (!settings || settings.companionMode === 'off') return null;

  const recoveryActive = settings.recoveryMode.active;
  const signals = recoveryActive
    ? []
    : getPartyPulseSignals(stats, settings.enabledCompanionIds).slice(
        0,
        MODE_LIMIT[settings.companionMode],
      );
  const snow = getCompanion('snow');

  return (
    <section className={`panel party-pulse ${signals.length ? 'has-signals' : 'is-steady'}`}>
      <header className="section-header party-pulse__header">
        <div>
          <p className="eyebrow">PARTY PULSE · ACCOUNTABILITY WITHOUT SHAME</p>
          <h2>
            {recoveryActive
              ? 'Recovery Mode is guarding the board.'
              : signals.length
                ? 'Your specialists noticed the drift.'
                : 'Every monitored path is steady.'}
          </h2>
          <p>
            {recoveryActive
              ? 'Attention signals are held while recovery is active. Rest and protected capacity remain the current directive.'
              : signals.length
                ? 'These are invitations back into motion—not penalties, failed quests, or judgments about you.'
                : 'No stat has crossed the attention threshold. The party is present without manufacturing pressure.'}
          </p>
        </div>
        <span className="party-pulse__scanner">
          <HeartPulse size={22} />
          <i />
        </span>
      </header>

      {signals.length ? (
        <div className="party-pulse__grid">
          {signals.map((signal) => {
            const companion = getCompanion(signal.companionId);
            return (
              <article
                key={signal.id}
                data-severity={signal.severity}
                style={{ '--party-pulse-accent': companion.accent } as React.CSSProperties}
              >
                <div className="party-pulse__portrait">
                  <img src={getCompanionImage(companion.image)} alt="" />
                  <span />
                </div>
                <div className="party-pulse__message">
                  <span>
                    {companion.name} · {companion.title}
                  </span>
                  <h3>{signal.title}</h3>
                  <p>“{signal.message}”</p>
                  <small>
                    {STAT_LABELS[signal.stat]} · {signal.neglectedDays}{' '}
                    {signal.neglectedDays === 1 ? 'day' : 'days'} · {signal.momentum}% momentum
                  </small>
                  <Link to={signal.actionPath}>
                    {signal.actionLabel} <ArrowRight size={14} />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="party-pulse__steady">
          <img src={getCompanionImage(snow.image)} alt="" />
          <div>
            <strong>Snow · The Constant</strong>
            <p>
              “
              {recoveryActive
                ? 'The signals can wait. Recovery is not slacking; it is part of how we make this journey last.'
                : 'No alarm to invent. Keep choosing honest wins, and I’ll keep watching the whole journey with you.'}
              ”
            </p>
          </div>
          <ShieldCheck size={23} />
        </div>
      )}
    </section>
  );
}
