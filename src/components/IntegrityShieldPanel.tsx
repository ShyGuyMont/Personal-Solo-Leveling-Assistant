import { Check, ExternalLink, LockKeyhole, ShieldAlert, ShieldCheck } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { ensureIntegrityShield, updateIntegrityShield } from '@/game/integrityShield';
import type { IntegrityShieldProfile } from '@/types/game';

const APPLE_GUIDE_URL =
  'https://support.apple.com/guide/iphone/block-apps-app-downloads-websites-and-purchases-iph3ff83f3b1/ios';

export function IntegrityShieldPanel({
  onActivateStronghold,
}: {
  onActivateStronghold: () => void;
}) {
  const [profile, setProfile] = useState<IntegrityShieldProfile>();
  const [plan, setPlan] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string>();
  const reload = useCallback(async () => {
    const next = await ensureIntegrityShield();
    setProfile(next);
    setPlan(next.interruptionPlan);
  }, []);
  useEffect(() => void reload(), [reload]);

  async function save(input: Parameters<typeof updateIntegrityShield>[0]) {
    setBusy(true);
    setNotice(undefined);
    try {
      const next = await updateIntegrityShield(input);
      setProfile(next);
      setPlan(next.interruptionPlan);
      setNotice('Shield record updated on this device.');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'The Shield record could not be updated.');
    } finally {
      setBusy(false);
    }
  }

  if (!profile) return null;
  const configured = profile.adultWebLimitEnabled;

  return (
    <section className="panel integrity-shield-panel">
      <header>
        <span className={`integrity-shield-panel__sigil ${configured ? 'is-active' : ''}`}>
          {configured ? <ShieldCheck size={26} /> : <LockKeyhole size={26} />}
        </span>
        <div>
          <p className="eyebrow">EXPLICIT CONTENT SHIELD</p>
          <h2>
            {configured ? 'Protection reported active' : 'Real blocking requires iPhone setup'}
          </h2>
          <p>
            The System PWA cannot inspect Safari or other apps. Apple Screen Time performs the
            actual website restriction; this panel records your setup and keeps the response plan
            one tap away.
          </p>
        </div>
      </header>

      <div className="integrity-shield-panel__status">
        <span>
          <strong>{configured ? 'DEVICE SETTING' : 'NOT CONFIGURED'}</strong>
          <small>{configured ? 'Self-reported Screen Time protection' : 'No blocking claim'}</small>
        </span>
        <button
          className={`integrity-shield-switch ${profile.enabled ? 'is-on' : ''}`}
          aria-pressed={profile.enabled}
          onClick={() => void save({ enabled: !profile.enabled })}
          disabled={busy}
        >
          {profile.enabled ? 'Shield tracking on' : 'Enable Shield tracking'}
        </button>
      </div>

      <div className="integrity-shield-panel__steps">
        <label>
          <input
            type="checkbox"
            checked={profile.adultWebLimitEnabled}
            disabled={busy}
            onChange={(event) =>
              void save({
                adultWebLimitEnabled: event.target.checked,
                enforcement: event.target.checked ? 'screen-time' : 'not-configured',
              })
            }
          />
          <span>
            <strong>Limit Adult Websites is enabled</strong>
            <small>Settings → Screen Time → Content & Privacy Restrictions → Web Content</small>
          </span>
        </label>
        <label>
          <input
            type="checkbox"
            checked={profile.restrictedSitesConfigured}
            disabled={busy}
            onChange={(event) => void save({ restrictedSitesConfigured: event.target.checked })}
          />
          <span>
            <strong>Known sites were added to Never Allow</strong>
            <small>
              Optional extra layer for specific websites you already know are a problem.
            </small>
          </span>
        </label>
        <label>
          <input
            type="checkbox"
            checked={profile.settingsPasscodeProtected}
            disabled={busy}
            onChange={(event) => void save({ settingsPasscodeProtected: event.target.checked })}
          />
          <span>
            <strong>Screen Time settings are passcode protected</strong>
            <small>
              Strongest when a trusted person holds a code you cannot casually override.
            </small>
          </span>
        </label>
      </div>

      <div className="integrity-shield-panel__actions">
        <a className="button button--ghost" href={APPLE_GUIDE_URL} target="_blank" rel="noreferrer">
          <ExternalLink size={16} /> Open Apple setup guide
        </a>
        <button className="button button--primary" onClick={onActivateStronghold}>
          <ShieldAlert size={16} /> Interrupt an urge now
        </button>
      </div>

      <label className="integrity-shield-panel__plan">
        <span>Your interruption plan</span>
        <textarea value={plan} onChange={(event) => setPlan(event.target.value)} rows={3} />
        <button
          className="button button--ghost"
          disabled={busy || plan.trim() === profile.interruptionPlan}
          onClick={() => void save({ interruptionPlan: plan })}
        >
          <Check size={15} /> Save plan
        </button>
      </label>

      {profile.lastVerifiedAt && (
        <small className="integrity-shield-panel__verified">
          Last self-check: {new Date(profile.lastVerifiedAt).toLocaleDateString()}
        </small>
      )}
      {notice && <p className="integrity-shield-panel__notice">{notice}</p>}
    </section>
  );
}
