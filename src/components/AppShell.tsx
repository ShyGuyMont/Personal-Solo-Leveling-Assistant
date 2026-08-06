import {
  Archive,
  BookHeart,
  CircleGauge,
  CircleHelp,
  ChefHat,
  Crown,
  Dumbbell,
  ListChecks,
  Shield,
  WalletCards,
} from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { CompanionPresence, RealmTransition, SystemHud } from '@/components/LivingSystemLayer';
import { SystemMark } from '@/components/SystemMark';
import { SystemParticleField } from '@/components/SystemParticleField';
import { APP_VERSION } from '@/config/release';
import { calculateRankQualification } from '@/game/rank';
import { getLiveSystemState, getSystemCycle, getSystemRealm } from '@/game/systemExperience';
import { useSystemDepth } from '@/hooks/useSystemDepth';
import { NavLink } from '@/router';
import { useRoutePath } from '@/routeState';
import { useGameStore } from '@/store/useGameStore';
import { getCurrentHour } from '@/utils/date';
import { formatClassName } from '@/utils/format';
import { getDocumentTheme } from '@/utils/theme';

const NAV = [
  { to: '/', label: 'System', icon: CircleGauge },
  { to: '/missions', label: 'Missions', icon: ListChecks },
  { to: '/status', label: 'Status', icon: Shield },
  { to: '/training-hall', label: 'Training', icon: Dumbbell },
  { to: '/sanctuary', label: 'Sanctuary', icon: BookHeart },
  { to: '/kitchen', label: 'Kitchen', icon: ChefHat },
  { to: '/treasury', label: 'Treasury', icon: WalletCards },
  { to: '/archive', label: 'Archive', icon: Archive },
];

export function AppShell({ children }: { children: ReactNode }) {
  const path = useRoutePath();
  const settings = useGameStore((state) => state.settings);
  const progression = useGameStore((state) => state.progression);
  const stats = useGameStore((state) => state.stats);
  const challenges = useGameStore((state) => state.challenges);
  const colorTheme = settings?.colorTheme ?? 'abyss';
  const documentTheme = getDocumentTheme(colorTheme);
  const realm = getSystemRealm(path);
  const shellRef = useRef<HTMLDivElement>(null);
  const [privacyActive, setPrivacyActive] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);
  const qualification =
    progression && stats.length
      ? calculateRankQualification(progression, stats, challenges)
      : undefined;
  const systemState = getLiveSystemState({
    online,
    recoveryActive: settings?.recoveryMode.active ?? false,
    trialActive: challenges.some(
      (challenge) => challenge.kind === 'rank-trial' && challenge.status === 'active',
    ),
    classQualified: Boolean(qualification?.targetRank && qualification.qualified),
    recentAscension: progression?.recentLevelUp || progression?.recentRankUp || false,
    xpMultiplier: progression?.xpMultiplier ?? 1,
  });
  const cycle = getSystemCycle(getCurrentHour(new Date(), settings?.timeZone));
  useSystemDepth(shellRef, {
    enabled: settings?.interfaceStyle === 'system' && !settings.reducedMotion,
    intensity: settings?.themeIntensity ?? 'standard',
  });

  useEffect(() => {
    const hide = () => setPrivacyActive(true);
    const show = () => {
      if (document.visibilityState === 'visible') setPrivacyActive(false);
    };
    const updateConnection = () => setOnline(navigator.onLine);
    const updateVisibility = () => (document.visibilityState === 'hidden' ? hide() : show());
    document.addEventListener('visibilitychange', updateVisibility);
    window.addEventListener('blur', hide);
    window.addEventListener('focus', show);
    window.addEventListener('online', updateConnection);
    window.addEventListener('offline', updateConnection);
    return () => {
      window.removeEventListener('blur', hide);
      window.removeEventListener('focus', show);
      document.removeEventListener('visibilitychange', updateVisibility);
      window.removeEventListener('online', updateConnection);
      window.removeEventListener('offline', updateConnection);
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = documentTheme;
    root.dataset.colorProtocol = colorTheme;
    root.dataset.interface = settings?.interfaceStyle ?? 'system';
    root.dataset.intensity = settings?.themeIntensity ?? 'standard';
    root.dataset.motion = settings?.reducedMotion ? 'reduced' : 'full';
  }, [
    colorTheme,
    documentTheme,
    settings?.interfaceStyle,
    settings?.themeIntensity,
    settings?.reducedMotion,
  ]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [path]);

  return (
    <div
      ref={shellRef}
      className={`app-shell ${settings?.privacyScreenEnabled && privacyActive ? 'privacy-screen-active' : ''}`}
      data-theme={documentTheme}
      data-color-protocol={colorTheme}
      data-interface={settings?.interfaceStyle ?? 'system'}
      data-intensity={settings?.themeIntensity ?? 'standard'}
      data-motion={settings?.reducedMotion ? 'reduced' : 'full'}
      data-realm={realm}
      data-system-state={systemState}
      data-cycle={cycle}
    >
      <RealmTransition key={realm} realm={realm} />
      <div className="ambient-grid" />
      <SystemParticleField
        theme={colorTheme}
        intensity={settings?.themeIntensity ?? 'standard'}
        enabled={settings?.interfaceStyle === 'system' && !settings.reducedMotion}
      />
      <div className="ambient-orb ambient-orb--mint" />
      <div className="ambient-orb ambient-orb--purple" />
      <div className="ascension-atmosphere" aria-hidden="true">
        <span className="ascension-atmosphere__plane ascension-atmosphere__plane--far" />
        <span className="ascension-atmosphere__plane ascension-atmosphere__plane--near" />
        <span className="ascension-atmosphere__gate">
          <i />
          <i />
          <i />
        </span>
        <span className="ascension-atmosphere__signal" />
        <span className="ascension-atmosphere__shard ascension-atmosphere__shard--one" />
        <span className="ascension-atmosphere__shard ascension-atmosphere__shard--two" />
        <span className="ascension-atmosphere__shard ascension-atmosphere__shard--three" />
      </div>
      <header className="app-header">
        <NavLink to="/" className="brand" aria-label="The System home">
          <SystemMark small />
          <span>
            <span className="brand__name">THE SYSTEM</span>
            <span className="brand__tag">V{APP_VERSION} · SYSTEM TRANSCENDENCE</span>
          </span>
        </NavLink>
        <div className="app-header__actions">
          {progression && (
            <NavLink to="/status" className="header-class-chip">
              <Crown size={13} aria-hidden="true" />
              <span>{formatClassName(progression.rank)}</span>
            </NavLink>
          )}
          <NavLink to="/about" className="header-help" aria-label="About and help">
            <CircleHelp size={20} />
            <span>HELP</span>
          </NavLink>
          <span className={`connection-state ${!online ? 'is-offline' : ''}`}>
            <span className="connection-state__dot" />
            {online ? 'LOCAL LINK' : 'OFFLINE'}
          </span>
        </div>
      </header>
      <SystemHud realm={realm} state={systemState} />
      <main className="page-container">{children}</main>
      <nav className="bottom-nav" aria-label="Primary">
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `bottom-nav__item ${isActive ? 'is-active' : ''}`}
          >
            <Icon size={20} strokeWidth={1.7} aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <CompanionPresence realm={realm} />
      {settings?.privacyScreenEnabled && privacyActive && (
        <div className="privacy-veil" aria-label="Privacy Screen active">
          <SystemMark small />
          <strong>PRIVACY SCREEN</strong>
        </div>
      )}
    </div>
  );
}
