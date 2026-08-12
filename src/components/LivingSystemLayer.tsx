import {
  Activity,
  ArrowUpRight,
  ChevronRight,
  CircleDot,
  Radio,
  Sparkles,
  Target,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { getCompanion, getCompanionImage } from '@/config/companions';
import { REALM_PRESENCE } from '@/config/realmPresence';
import {
  formatSystemState,
  REALM_COMPANIONS,
  REALM_LABELS,
  type SystemRealm,
} from '@/game/systemExperience';
import { getPartyPulseSignals } from '@/game/partyPulse';
import { Link } from '@/router';
import { useRoutePath } from '@/routeState';
import { useGameStore } from '@/store/useGameStore';
import type { SystemState } from '@/types/game';

export function RealmTransition({ realm }: { realm: SystemRealm }) {
  return (
    <div className="realm-transition" data-transition-realm={realm} aria-hidden="true">
      <div className="realm-transition__curtain" />
      <div className="realm-transition__portal">
        <i />
        <i />
        <i />
        <span />
      </div>
      <div className="realm-transition__label">
        <span>DIMENSIONAL LINK</span>
        <strong>{REALM_LABELS[realm]}</strong>
      </div>
    </div>
  );
}

export function SystemHud({ realm, state }: { realm: SystemRealm; state: SystemState }) {
  const { missions, todayRecords, progression } = useGameStore();
  const missionMap = useMemo(
    () => new Map(missions.map((mission) => [mission.id, mission])),
    [missions],
  );
  const completed = todayRecords.filter((record) => record.status === 'completed').length;
  const completion = todayRecords.length ? Math.round((completed / todayRecords.length) * 100) : 0;
  const nextRecord = todayRecords.find((record) => record.status === 'pending');
  const nextMission = nextRecord ? missionMap.get(nextRecord.missionId) : undefined;

  return (
    <aside className="system-hud" aria-label="Live System status">
      <div className="system-hud__state" data-state={state}>
        <Activity size={14} aria-hidden="true" />
        <span>
          <small>LIVE STATE</small>
          <strong>{formatSystemState(state)}</strong>
        </span>
      </div>
      <div className="system-hud__sync">
        <span>
          <small>DAILY SYNC</small>
          <strong>{completion}%</strong>
        </span>
        <i>
          <b style={{ width: `${completion}%` }} />
        </i>
      </div>
      <Link to="/missions" className="system-hud__directive">
        <Target size={14} aria-hidden="true" />
        <span>
          <small>NEXT DIRECTIVE</small>
          <strong>{nextMission?.shortName ?? 'All available objectives answered'}</strong>
        </span>
        <ChevronRight size={14} aria-hidden="true" />
      </Link>
      <Link to="/status" className="system-hud__level">
        <span>LV.</span>
        <strong>{progression?.level ?? '—'}</strong>
      </Link>
      <div className="system-hud__realm">
        <Radio size={13} aria-hidden="true" />
        <span>{REALM_LABELS[realm]}</span>
      </div>
    </aside>
  );
}

export function CompanionPresence({ realm }: { realm: SystemRealm }) {
  const path = useRoutePath();
  const { settings, stats } = useGameStore();
  const [open, setOpen] = useState(false);
  const desiredCompanionId = REALM_COMPANIONS[realm];
  const enabledIds = settings?.enabledCompanionIds ?? [];
  const companionId = enabledIds.includes(desiredCompanionId) ? desiredCompanionId : undefined;

  useEffect(() => {
    setOpen(
      path === '/' && settings?.companionMode !== 'quiet' && settings?.companionMode !== 'off',
    );
  }, [path, settings?.companionMode]);

  if (!settings || !companionId || settings.companionMode === 'off') return null;
  const companion = getCompanion(companionId);
  const presence = REALM_PRESENCE[realm];
  const pulse = settings.recoveryMode.active
    ? undefined
    : getPartyPulseSignals(stats, enabledIds).find((signal) => signal.companionId === companionId);

  return (
    <aside
      className={`companion-presence ${open ? 'is-open' : ''} ${pulse ? 'has-pulse' : ''}`}
      data-companion={companion.id}
      style={{ '--presence-accent': companion.accent } as CSSProperties}
      aria-label={`${companion.name} companion link`}
    >
      <button
        type="button"
        className="companion-presence__anchor"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-label={`${open ? 'Close' : 'Open'} ${companion.name}'s companion link`}
      >
        <span className="companion-presence__signal">
          <CircleDot size={12} />
        </span>
        <img src={getCompanionImage(companion.image)} alt="" />
        <span className="companion-presence__identity">
          <small>{pulse ? 'PARTY PULSE' : 'COMPANION LINK'}</small>
          <strong>{companion.name}</strong>
        </span>
        {open ? <X size={16} /> : <Sparkles size={16} />}
      </button>
      <div className="companion-presence__transmission" aria-hidden={!open}>
        <div>
          <span className="companion-presence__live">
            <i /> {pulse ? 'ATTENTION PULSE' : 'LIVE TRANSMISSION'}
          </span>
          <strong>{pulse?.title ?? presence.signal}</strong>
          <p>“{pulse?.message ?? presence.message}”</p>
          <Link to={pulse?.actionPath ?? presence.actionPath}>
            {pulse?.actionLabel ?? presence.actionLabel} <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </aside>
  );
}
