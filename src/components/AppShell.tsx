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
import { useEffect, useState, type ReactNode } from 'react';
import { SystemMark } from '@/components/SystemMark';
import { NavLink } from '@/router';
import { useRoutePath } from '@/routeState';
import { useGameStore } from '@/store/useGameStore';
import { formatClassName } from '@/utils/format';

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

function getRealm(path: string) {
  if (path.startsWith('/training-hall')) return 'training';
  if (path.startsWith('/sanctuary')) return 'sanctuary';
  if (path.startsWith('/kitchen')) return 'kitchen';
  if (path.startsWith('/treasury')) return 'treasury';
  if (path.startsWith('/headquarters') || path.startsWith('/party-chat')) return 'party';
  if (path.startsWith('/campaigns')) return 'campaign';
  if (path.startsWith('/archive')) return 'archive';
  if (path.startsWith('/status') || path.startsWith('/challenges')) return 'progression';
  return 'system';
}

export function AppShell({ children }: { children: ReactNode }) {
  const path = useRoutePath();
  const settings = useGameStore((state) => state.settings);
  const progression = useGameStore((state) => state.progression);
  const realm = getRealm(path);
  const [privacyActive, setPrivacyActive] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);

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
    root.dataset.theme = settings?.colorTheme ?? 'abyss';
    root.dataset.interface = settings?.interfaceStyle ?? 'system';
    root.dataset.intensity = settings?.themeIntensity ?? 'standard';
  }, [settings?.colorTheme, settings?.interfaceStyle, settings?.themeIntensity]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [path]);

  return (
    <div
      className={`app-shell ${settings?.privacyScreenEnabled && privacyActive ? 'privacy-screen-active' : ''}`}
      data-theme={settings?.colorTheme ?? 'abyss'}
      data-interface={settings?.interfaceStyle ?? 'system'}
      data-intensity={settings?.themeIntensity ?? 'standard'}
      data-realm={realm}
    >
      <div className="ambient-grid" />
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
      </div>
      <header className="app-header">
        <NavLink to="/" className="brand" aria-label="The System home">
          <SystemMark small />
          <span>
            <span className="brand__name">THE SYSTEM</span>
            <span className="brand__tag">V6.0 · SYSTEM ASCENSION</span>
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
      <main className="page-container" key={path}>
        {children}
      </main>
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
      {settings?.privacyScreenEnabled && privacyActive && (
        <div className="privacy-veil" aria-label="Privacy Screen active">
          <SystemMark small />
          <strong>PRIVACY SCREEN</strong>
        </div>
      )}
    </div>
  );
}
