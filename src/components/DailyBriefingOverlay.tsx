import {
  BatteryLow,
  BatteryMedium,
  BatteryFull,
  Check,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { getCompanion, getCompanionImage } from '@/config/companions';
import { saveDailyBriefing, skipDailyBriefing, suggestDailyBriefing } from '@/game/briefing';
import { useGameStore } from '@/store/useGameStore';
import type { DailyCapacity } from '@/types/game';

const CAPACITIES: Array<{
  id: DailyCapacity;
  label: string;
  description: string;
  icon: typeof BatteryMedium;
}> = [
  {
    id: 'low',
    label: 'Low',
    description: 'Protect continuity with a smaller plan.',
    icon: BatteryLow,
  },
  {
    id: 'steady',
    label: 'Steady',
    description: 'One priority, one support, one optional bonus.',
    icon: BatteryMedium,
  },
  {
    id: 'high',
    label: 'High',
    description: 'Use extra room without borrowing from tomorrow.',
    icon: BatteryFull,
  },
];

export function DailyBriefingOverlay() {
  const {
    settings,
    systemDate,
    missions,
    todayRecords,
    dailyBriefing,
    dailyEvent,
    campfireRecap,
    monthlyCouncil,
    refresh,
  } = useGameStore();
  const [capacity, setCapacity] = useState<DailyCapacity>();
  const [selection, setSelection] = useState<{
    mainMissionId?: string;
    supportMissionId?: string;
    bonusMissionId?: string;
  }>({});
  const [busy, setBusy] = useState(false);
  const snow = getCompanion('snow');
  const pendingIds = new Set(
    todayRecords.filter((record) => record.status === 'pending').map((record) => record.missionId),
  );
  const options = missions.filter((mission) => pendingIds.has(mission.id));

  if (
    !settings?.dailyBriefingEnabled ||
    !settings.firstDayGuideCompleted ||
    dailyBriefing ||
    dailyEvent?.status === 'unrevealed' ||
    campfireRecap ||
    monthlyCouncil
  )
    return null;

  async function choose(next: DailyCapacity) {
    setCapacity(next);
    setSelection(await suggestDailyBriefing(systemDate, next));
  }

  return (
    <div
      className="modal-backdrop briefing-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Snow's Daily Command Briefing"
    >
      <section
        className="modal-panel briefing-panel"
        style={{ '--companion-accent': snow.accent } as React.CSSProperties}
      >
        <header className="briefing-panel__header">
          <img src={getCompanionImage(snow.image)} alt="Snow, The Constant" />
          <div>
            <p className="eyebrow">SNOW · DAILY COMMAND BRIEFING</p>
            <h2>{capacity ? 'Today’s command map' : 'What capacity are we working with?'}</h2>
            <p>
              {capacity
                ? 'You can change any recommendation. These are priorities only—mission XP and rules stay exactly the same.'
                : 'No judgment and no hidden score. Your answer only changes how many priorities Snow recommends.'}
            </p>
          </div>
          <button
            className="icon-button"
            aria-label="Skip briefing"
            onClick={() => void skipDailyBriefing(systemDate).then(refresh)}
          >
            <X size={18} />
          </button>
        </header>

        {!capacity ? (
          <div className="briefing-capacity">
            {CAPACITIES.map(({ id, label, description, icon: Icon }) => (
              <button key={id} onClick={() => void choose(id)}>
                <Icon size={24} />
                <strong>{label}</strong>
                <span>{description}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="briefing-plan">
            <div className="briefing-plan__capacity">
              <span>Capacity</span>
              {CAPACITIES.map(({ id, label }) => (
                <button
                  key={id}
                  className={capacity === id ? 'is-active' : ''}
                  onClick={() => void choose(id)}
                >
                  {label}
                </button>
              ))}
            </div>
            <label className="briefing-slot briefing-slot--main">
              <span>
                <Sparkles size={15} /> MAIN QUEST
              </span>
              <select
                value={selection.mainMissionId ?? ''}
                onChange={(event) =>
                  setSelection({ ...selection, mainMissionId: event.target.value || undefined })
                }
              >
                <option value="">Leave open</option>
                {options.map((mission) => (
                  <option key={mission.id} value={mission.id}>
                    {mission.name}
                  </option>
                ))}
              </select>
              <small>
                Your clearest priority. Completing it grants only its normal mission rewards.
              </small>
            </label>
            <label className="briefing-slot">
              <span>
                <ShieldCheck size={15} /> SUPPORT QUEST
              </span>
              <select
                value={selection.supportMissionId ?? ''}
                onChange={(event) =>
                  setSelection({ ...selection, supportMissionId: event.target.value || undefined })
                }
              >
                <option value="">Leave open</option>
                {options.map((mission) => (
                  <option key={mission.id} value={mission.id}>
                    {mission.name}
                  </option>
                ))}
              </select>
              <small>A second path that keeps the day balanced.</small>
            </label>
            {capacity !== 'low' && (
              <label className="briefing-slot briefing-slot--bonus">
                <span>
                  <Sparkles size={15} /> BONUS QUEST · OPTIONAL
                </span>
                <select
                  value={selection.bonusMissionId ?? ''}
                  onChange={(event) =>
                    setSelection({ ...selection, bonusMissionId: event.target.value || undefined })
                  }
                >
                  <option value="">No bonus</option>
                  {options.map((mission) => (
                    <option key={mission.id} value={mission.id}>
                      {mission.name}
                    </option>
                  ))}
                </select>
                <small>Always optional. Leaving it incomplete has no consequence.</small>
              </label>
            )}
            <div className="briefing-plan__actions">
              <button className="button button--ghost" onClick={() => setCapacity(undefined)}>
                Back
              </button>
              <button
                className="button button--primary"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  try {
                    await saveDailyBriefing({ date: systemDate, capacity, ...selection });
                    await refresh();
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                <Check size={16} /> {busy ? 'Saving…' : 'Confirm briefing'}
              </button>
            </div>
          </div>
        )}
        <footer>
          <ShieldCheck size={14} /> Stored only on this device · Edit or skip anytime · No penalties
        </footer>
      </section>
    </div>
  );
}
