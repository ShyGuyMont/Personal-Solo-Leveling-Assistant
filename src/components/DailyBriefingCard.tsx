import { BatteryLow, BatteryMedium, BatteryFull, Edit3, Sparkles } from 'lucide-react';
import { reopenDailyBriefing } from '@/game/briefing';
import { useGameStore } from '@/store/useGameStore';

const ICONS = { low: BatteryLow, steady: BatteryMedium, high: BatteryFull } as const;

export function DailyBriefingCard() {
  const { dailyBriefing, missions, refresh } = useGameStore();
  if (!dailyBriefing) return null;
  const mission = (id?: string) => missions.find((item) => item.id === id)?.name;
  const Icon = ICONS[dailyBriefing.capacity];
  return (
    <section
      className={`panel daily-briefing-card ${dailyBriefing.status === 'skipped' ? 'is-skipped' : ''}`}
    >
      <header>
        <span>
          <Icon size={21} />
        </span>
        <div>
          <p className="eyebrow">SNOW · DAILY COMMAND</p>
          <h2>
            {dailyBriefing.status === 'skipped'
              ? 'Briefing skipped for today'
              : `${dailyBriefing.capacity} capacity plan`}
          </h2>
        </div>
        <button
          className="text-button"
          onClick={() => void reopenDailyBriefing(dailyBriefing.date).then(refresh)}
        >
          <Edit3 size={15} /> {dailyBriefing.status === 'skipped' ? 'Plan now' : 'Edit'}
        </button>
      </header>
      {dailyBriefing.status === 'planned' && (
        <div className="daily-briefing-card__slots">
          <div>
            <span>MAIN</span>
            <strong>{mission(dailyBriefing.mainMissionId) ?? 'Open choice'}</strong>
          </div>
          <div>
            <span>SUPPORT</span>
            <strong>{mission(dailyBriefing.supportMissionId) ?? 'Open choice'}</strong>
          </div>
          {dailyBriefing.bonusMissionId && (
            <div>
              <span>BONUS</span>
              <strong>{mission(dailyBriefing.bonusMissionId)}</strong>
            </div>
          )}
        </div>
      )}
      <blockquote>“{dailyBriefing.snowMessage}”</blockquote>
      <small>
        <Sparkles size={13} /> Priority map only · normal mission rules and rewards
      </small>
    </section>
  );
}
