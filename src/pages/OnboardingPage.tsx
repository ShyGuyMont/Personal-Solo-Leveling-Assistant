import { ArrowRight, Check, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { useEffect, useState } from 'react';
import { SystemMark } from '@/components/SystemMark';
import { listLocalSnapshots, restoreLocalSnapshot } from '@/db/backup';
import { useGameStore } from '@/store/useGameStore';
import type { BackupSnapshot, Focus } from '@/types/game';

const FOCUS_OPTIONS: Array<{ id: Focus; label: string; text: string }> = [
  { id: 'balanced', label: 'Balanced', text: 'Advance every major domain together.' },
  { id: 'faith', label: 'Faith', text: 'Begin from spiritual foundation and reflection.' },
  {
    id: 'discipline',
    label: 'Discipline',
    text: 'Begin from consistency, resolve, and structure.',
  },
  { id: 'physical', label: 'Physical', text: 'Begin from vitality, motion, and strength.' },
  { id: 'creator', label: 'Creator', text: 'Begin from imagination, focus, and meaningful work.' },
];

export function OnboardingPage() {
  const initializeProfile = useGameStore((state) => state.initializeProfile);
  const load = useGameStore((state) => state.load);
  const [stage, setStage] = useState<'detected' | 'profile' | 'initializing'>('detected');
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [resetTime, setResetTime] = useState('04:00');
  const [focus, setFocus] = useState<Focus>('balanced');
  const [sound, setSound] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false,
  );
  const [recoverySnapshot, setRecoverySnapshot] = useState<BackupSnapshot>();

  useEffect(() => {
    void listLocalSnapshots().then((snapshots) =>
      setRecoverySnapshot(
        snapshots.find(
          (snapshot) =>
            snapshot.data.profiles?.length &&
            snapshot.data.progression?.length &&
            snapshot.data.settings?.length,
        ),
      ),
    );
  }, []);

  if (stage === 'detected') {
    return (
      <main className="onboarding onboarding--cinematic">
        <div className="ambient-grid" />
        <div className="ambient-orb ambient-orb--mint" />
        <div className="candidate-detection">
          <SystemMark />
          <p className="eyebrow onboarding-line onboarding-line--one">UNKNOWN INTERFACE</p>
          <h1 className="onboarding-line onboarding-line--two">
            A compatible candidate
            <br />
            has been detected.
          </h1>
          <p className="onboarding-line onboarding-line--three">Initialization required.</p>
          <button
            className="button button--primary button--large onboarding-line onboarding-line--four"
            onClick={() => setStage('profile')}
          >
            Initialize System
            <ArrowRight size={19} />
          </button>
          {recoverySnapshot && (
            <button
              className="button button--ghost onboarding-line onboarding-line--four"
              onClick={async () => {
                if (
                  !window.confirm(
                    `Restore the recovery snapshot from ${new Date(recoverySnapshot.createdAt).toLocaleString()}?`,
                  )
                )
                  return;
                await restoreLocalSnapshot(recoverySnapshot.id);
                await load();
              }}
            >
              <RotateCcw size={17} /> Restore previous campaign
            </button>
          )}
          <small className="onboarding-line onboarding-line--four">
            Private by design · Stored only on this device
          </small>
        </div>
      </main>
    );
  }

  if (stage === 'initializing') {
    return (
      <main className="onboarding onboarding--cinematic">
        <div className="ambient-grid" />
        <div className="initialization-sequence">
          <SystemMark />
          <p className="eyebrow">SYSTEM INITIALIZATION</p>
          <h1>Establishing progression framework…</h1>
          <div className="initialization-scan">
            <span />
          </div>
          <div className="initialization-checks">
            <span>
              <Check size={15} /> Local archive secured
            </span>
            <span>
              <Check size={15} /> Mission protocol issued
            </span>
            <span>
              <Check size={15} /> Candidate profile linked
            </span>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="onboarding onboarding--profile">
      <div className="ambient-grid" />
      <section className="onboarding-panel">
        <header>
          <SystemMark small />
          <div>
            <p className="eyebrow">CANDIDATE REGISTRATION</p>
            <h1>Define your interface.</h1>
            <p>
              These choices personalize the opening sequence. They do not grant gameplay advantages.
            </p>
          </div>
        </header>
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            if (!name.trim()) return;
            setStage('initializing');
            await new Promise((resolve) => window.setTimeout(resolve, reducedMotion ? 150 : 1000));
            await initializeProfile({
              displayName: name,
              systemTitle: title,
              resetTime,
              focus,
              soundEnabled: sound,
              reducedMotion,
            });
          }}
        >
          <div className="form-grid">
            <label className="field">
              <span>Display name</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Candidate name"
                required
                autoFocus
                maxLength={40}
              />
            </label>
            <label className="field">
              <span>Custom System title · optional</span>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Candidate"
                maxLength={50}
              />
              <small>
                Cosmetic nickname only—it does not affect XP, stats, achievement titles, or class.
              </small>
            </label>
            <label className="field">
              <span>Daily reset time</span>
              <input
                type="time"
                value={resetTime}
                onChange={(event) => setResetTime(event.target.value)}
              />
              <small>A new System day begins at this local time.</small>
            </label>
          </div>
          <fieldset className="focus-select">
            <legend>Starting focus</legend>
            <div className="focus-grid">
              {FOCUS_OPTIONS.map((option) => (
                <button
                  type="button"
                  key={option.id}
                  className={focus === option.id ? 'is-selected' : ''}
                  aria-pressed={focus === option.id}
                  onClick={() => setFocus(option.id)}
                >
                  <span>{option.label}</span>
                  <small>{option.text}</small>
                </button>
              ))}
            </div>
          </fieldset>
          <div className="preference-row">
            <button
              type="button"
              className={`preference-toggle ${sound ? 'is-on' : ''}`}
              aria-pressed={sound}
              onClick={() => setSound((value) => !value)}
            >
              {sound ? <Volume2 size={18} /> : <VolumeX size={18} />}
              <span>System tones</span>
              <strong>{sound ? 'On' : 'Off'}</strong>
            </button>
            <label className="switch-row">
              <span>Reduced motion</span>
              <input
                type="checkbox"
                checked={reducedMotion}
                onChange={(event) => setReducedMotion(event.target.checked)}
              />
              <span className="switch" />
            </label>
          </div>
          <button className="button button--primary button--large button--wide" type="submit">
            Confirm initialization
            <ArrowRight size={19} />
          </button>
        </form>
      </section>
    </main>
  );
}
