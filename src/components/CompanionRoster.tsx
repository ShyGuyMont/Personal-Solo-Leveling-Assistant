import { Castle } from 'lucide-react';
import type { CSSProperties } from 'react';
import { COMPANIONS, getCompanionImage } from '@/config/companions';
import { Link } from '@/router';
import { useGameStore } from '@/store/useGameStore';

export function CompanionRoster({ detailed = false }: { detailed?: boolean }) {
  const settings = useGameStore((state) => state.settings);
  const enabled = new Set(settings?.enabledCompanionIds ?? []);
  const companions = COMPANIONS.filter((companion) => enabled.has(companion.id));
  if (!companions.length || settings?.companionMode === 'off') return null;

  return (
    <section className={`panel companion-roster ${detailed ? 'companion-roster--detailed' : ''}`}>
      <header className="section-header">
        <div>
          <p className="eyebrow">PARTY HEADQUARTERS</p>
          <h2>Snow & your eight System companions</h2>
        </div>
        <Link
          to="/headquarters"
          className="button button--ghost button--small companion-roster__check-in"
        >
          <Castle size={16} /> Headquarters
        </Link>
      </header>
      <div className="companion-roster__grid">
        {companions.map((companion) => {
          const isPrimary = Boolean(companion.primary);
          return (
            <article
              key={companion.id}
              className={`companion-card ${isPrimary ? 'companion-card--primary' : ''}`}
              style={{ '--companion-accent': companion.accent } as CSSProperties}
            >
              <div className="companion-card__portrait" style={{ borderColor: companion.accent }}>
                <img
                  src={getCompanionImage(companion.image)}
                  alt={`${companion.name}, ${companion.title}`}
                />
                <span style={{ background: companion.accent }} />
              </div>
              <div>
                {isPrimary && <em>PRIMARY SUPPORT</em>}
                <strong>{companion.name}</strong>
                <span>{companion.title}</span>
                <small>{companion.shortRole}</small>
                {isPrimary && !detailed && <p>{companion.description}</p>}
                {detailed && (
                  <>
                    <p>{companion.description}</p>
                    <p>
                      <b>Personality:</b> {companion.personality}
                    </p>
                    <p>
                      <b>Appearance:</b> {companion.appearance}
                    </p>
                  </>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
