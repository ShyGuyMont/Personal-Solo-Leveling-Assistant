import {
  BatteryLow,
  BatteryMedium,
  BatteryFull,
  Check,
  CircleHelp,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { getCompanion, getCompanionImage } from '@/config/companions';
import {
  DAILY_COMMAND_RULES,
  saveDailyBriefing,
  skipDailyBriefing,
  suggestDailyBriefing,
} from '@/game/briefing';
import { useGameStore } from '@/store/useGameStore';
import { getMissionDisplayName } from '@/utils/privacy';
import type { DailyCapacity } from '@/types/game';

const CAPACITIES: Array<{
  id: DailyCapacity;
  label: string;
  description: string;
  reward: string;
  icon: typeof BatteryMedium;
}> = [
  {
    id: 'low',
    label: 'Low',
    description: 'Choose one Main priority. Protect continuity without a quota.',
    reward: 'Normal 1× XP · regular Perfect Day bonus still applies',
    icon: BatteryLow,
  },
  {
    id: 'steady',
    label: 'Steady',
    description: 'Clear Main + Support and at least 65% of the full daily list.',
    reward: '1.5× mission XP · 1.75× for a Full Clear',
    icon: BatteryMedium,
  },
  {
    id: 'high',
    label: 'High',
    description: 'Clear Main + Support + Bonus and at least 80% of the full daily list.',
    reward: '2× mission XP · 2.5× for a Full Clear',
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
  const [showHelp, setShowHelp] = useState(false);
  const [error, setError] = useState<string>();
  const snow = getCompanion('snow');
  const pendingIds = new Set(
    todayRecords.filter((record) => record.status === 'pending').map((record) => record.missionId),
  );
  const options = missions.filter((mission) => !mission.optional && pendingIds.has(mission.id));
  const missionMap = new Map(missions.map((mission) => [mission.id, mission]));
  const scheduledCount = todayRecords.filter(
    (record) => !missionMap.get(record.missionId)?.optional,
  ).length;

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
    setError(undefined);
    setCapacity(next);
    setSelection(await suggestDailyBriefing(systemDate, next));
  }

  const rule = capacity ? DAILY_COMMAND_RULES[capacity] : undefined;
  const targetCount = rule ? Math.ceil(scheduledCount * rule.targetCompletionRate) : 0;
  const selectedIds = capacity
    ? [
        selection.mainMissionId,
        capacity === 'low' ? undefined : selection.supportMissionId,
        capacity === 'high' ? selection.bonusMissionId : undefined,
      ].filter((id): id is string => Boolean(id))
    : [];
  const requiredPriorityCount = rule ? Math.min(rule.priorityCount, scheduledCount) : 0;
  const canConfirm =
    Boolean(capacity) &&
    scheduledCount > 0 &&
    selectedIds.length >= requiredPriorityCount &&
    new Set(selectedIds).size === selectedIds.length;

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
                ? 'Your priorities lead the day, but Steady and High rewards depend on the full scheduled mission list.'
                : 'Choose honestly. Low protects consistency; Steady and High offer stronger rewards for broader completion.'}
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

        <button className="briefing-help-toggle" onClick={() => setShowHelp(!showHelp)}>
          <CircleHelp size={16} /> What do Main, Support, Bonus, and Full Clear mean?
        </button>
        {showHelp && (
          <div className="briefing-explainer">
            <p>
              <strong>Main</strong> is your highest priority. <strong>Support</strong> is the second
              objective that keeps the day balanced. <strong>Bonus</strong> is High Capacity’s third
              priority—not the end of the command.
            </p>
            <p>
              Steady still requires at least 65% of every scheduled daily mission; High requires at
              least 80%. A <strong>Full Clear</strong> means clearing the entire scheduled list.
              Multipliers apply to account and stat XP earned by those completed missions during the
              next Daily Review. Special events and companion rewards are not multiplied.
            </p>
            <p>
              Missing a target never removes XP. You keep every normal reward—you simply do not
              receive that command’s multiplier. A protected exception counts as resolved, but it
              creates no mission XP to multiply.
            </p>
          </div>
        )}

        {!capacity ? (
          <div className="briefing-capacity">
            {CAPACITIES.map(({ id, label, description, reward, icon: Icon }) => (
              <button key={id} onClick={() => void choose(id)}>
                <Icon size={24} />
                <strong>{label}</strong>
                <span>{description}</span>
                <small>{reward}</small>
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

            <div className={`briefing-target briefing-target--${capacity}`}>
              <strong>
                {capacity === 'low'
                  ? 'Continuity plan · no completion quota'
                  : `${targetCount} of ${scheduledCount} missions required`}
              </strong>
              <span>
                {capacity === 'low'
                  ? 'Normal mission XP · regular Perfect Day rewards remain available'
                  : `${rule!.standardMultiplier}× at target · ${rule!.fullClearMultiplier}× when all ${scheduledCount} are cleared`}
              </span>
            </div>

            <label className="briefing-slot briefing-slot--main">
              <span>
                <Sparkles size={15} /> MAIN MISSION
              </span>
              <select
                value={selection.mainMissionId ?? ''}
                onChange={(event) =>
                  setSelection({ ...selection, mainMissionId: event.target.value || undefined })
                }
              >
                <option value="">Choose Main</option>
                {options.map((mission) => (
                  <option key={mission.id} value={mission.id}>
                    {getMissionDisplayName(mission, settings.sensitiveMissionAlias)}
                  </option>
                ))}
              </select>
              <small>Your highest priority and the first objective Snow wants protected.</small>
            </label>

            {capacity !== 'low' && (
              <label className="briefing-slot">
                <span>
                  <ShieldCheck size={15} /> SUPPORT MISSION
                </span>
                <select
                  value={selection.supportMissionId ?? ''}
                  onChange={(event) =>
                    setSelection({
                      ...selection,
                      supportMissionId: event.target.value || undefined,
                    })
                  }
                >
                  <option value="">Choose Support</option>
                  {options.map((mission) => (
                    <option
                      key={mission.id}
                      value={mission.id}
                      disabled={mission.id === selection.mainMissionId}
                    >
                      {getMissionDisplayName(mission, settings.sensitiveMissionAlias)}
                    </option>
                  ))}
                </select>
                <small>Your second priority. Both Main and Support are required.</small>
              </label>
            )}

            {capacity === 'high' && (
              <label className="briefing-slot briefing-slot--bonus">
                <span>
                  <Sparkles size={15} /> BONUS MISSION
                </span>
                <select
                  value={selection.bonusMissionId ?? ''}
                  onChange={(event) =>
                    setSelection({ ...selection, bonusMissionId: event.target.value || undefined })
                  }
                >
                  <option value="">Choose Bonus</option>
                  {options.map((mission) => (
                    <option
                      key={mission.id}
                      value={mission.id}
                      disabled={
                        mission.id === selection.mainMissionId ||
                        mission.id === selection.supportMissionId
                      }
                    >
                      {getMissionDisplayName(mission, settings.sensitiveMissionAlias)}
                    </option>
                  ))}
                </select>
                <small>The third High Capacity priority. High still requires 80% overall.</small>
              </label>
            )}

            {error && <p className="form-error">{error}</p>}
            {!canConfirm && selectedIds.length > 0 && (
              <p className="briefing-validation">Choose each required priority only once.</p>
            )}
            <div className="briefing-plan__actions">
              <button className="button button--ghost" onClick={() => setCapacity(undefined)}>
                Back
              </button>
              <button
                className="button button--primary"
                disabled={busy || !canConfirm}
                onClick={async () => {
                  setBusy(true);
                  setError(undefined);
                  try {
                    await saveDailyBriefing({ date: systemDate, capacity, ...selection });
                    await refresh();
                  } catch (caught) {
                    setError(
                      caught instanceof Error ? caught.message : 'The command could not be saved.',
                    );
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                <Check size={16} /> {busy ? 'Locking…' : 'Lock today’s command'}
              </button>
            </div>
          </div>
        )}
        <footer>
          <ShieldCheck size={14} /> Command locks when confirmed · no XP is ever removed for a miss
        </footer>
      </section>
    </div>
  );
}
