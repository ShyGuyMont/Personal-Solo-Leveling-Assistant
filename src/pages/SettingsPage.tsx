import {
  Bell,
  Download,
  Info,
  Palette,
  RotateCcw,
  Save,
  Settings as SettingsIcon,
  ShieldCheck,
  SlidersHorizontal,
  Upload,
  Users,
  Zap,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import {
  commitPreparedImport,
  downloadSave,
  getStorageSummary,
  listLocalSnapshots,
  prepareSaveImport,
  resetAllData,
  restoreLocalSnapshot,
  type PreparedImport,
} from '@/db/backup';
import { equipTitle, saveConfiguration } from '@/db/repositories';
import { DEFAULT_MISSIONS, OPTIONAL_MISSION_TEMPLATES } from '@/config/missions';
import { COMPANIONS, getCompanionImage } from '@/config/companions';
import { APP_VERSION } from '@/config/release';
import { CORE_ATTUNEMENTS } from '@/config/coreAttunements';
import { Modal } from '@/components/Modal';
import { Link } from '@/router';
import { useGameStore } from '@/store/useGameStore';
import { missionAccountXp } from '@/game/rewards';
import { formatClassName } from '@/utils/format';
import { getDocumentTheme } from '@/utils/theme';
import { getMissionDisplayName, sanitizeSensitiveDisplayText } from '@/utils/privacy';
import { readMediaAudit } from '@/utils/mediaSecurity';
import type {
  BackupSnapshot,
  CompanionId,
  MissionDefinition,
  RecoveryReason,
  Settings,
} from '@/types/game';

export function SettingsPage() {
  const { profile, settings, missions, titles, refresh, resume, load } = useGameStore();
  const [displayName, setDisplayName] = useState(profile?.displayName ?? '');
  const [systemTitle, setSystemTitle] = useState(profile?.systemTitle ?? '');
  const [draft, setDraft] = useState<Settings | undefined>(settings);
  const [missionDrafts, setMissionDrafts] = useState<MissionDefinition[]>(
    missions.filter((mission) => !mission.archived),
  );
  const [saved, setSaved] = useState(false);
  const [preparedImport, setPreparedImport] = useState<PreparedImport>();
  const [resetOpen, setResetOpen] = useState(false);
  const [resetText, setResetText] = useState('');
  const [snapshots, setSnapshots] = useState<BackupSnapshot[]>([]);
  const [storage, setStorage] = useState<Awaited<ReturnType<typeof getStorageSummary>>>();
  const [dataMessage, setDataMessage] = useState('');
  const importRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraft(settings);
    setMissionDrafts(missions.filter((mission) => !mission.archived));
  }, [settings, missions]);

  useEffect(() => {
    if (!draft) return;
    const root = document.documentElement;
    root.dataset.theme = getDocumentTheme(draft.colorTheme);
    root.dataset.colorProtocol = draft.colorTheme;
    root.dataset.interface = draft.interfaceStyle;
    root.dataset.intensity = draft.themeIntensity;
    root.dataset.motion = draft.reducedMotion ? 'reduced' : 'full';
    return () => {
      const savedTheme = settings?.colorTheme ?? 'abyss';
      root.dataset.theme = getDocumentTheme(savedTheme);
      root.dataset.colorProtocol = savedTheme;
      root.dataset.interface = settings?.interfaceStyle ?? 'system';
      root.dataset.intensity = settings?.themeIntensity ?? 'standard';
      root.dataset.motion = settings?.reducedMotion ? 'reduced' : 'full';
    };
  }, [draft, settings]);

  const refreshLocalData = async () => {
    const [nextSnapshots, nextStorage] = await Promise.all([
      listLocalSnapshots(),
      getStorageSummary(),
    ]);
    setSnapshots(nextSnapshots);
    setStorage(nextStorage);
  };

  useEffect(() => {
    void refreshLocalData();
  }, []);

  const unlockedTitleIds = useMemo(() => new Set(titles.map((title) => title.titleId)), [titles]);
  if (!profile || !draft) return null;

  const mediaAudit = readMediaAudit();
  const lastMediaAction = mediaAudit[mediaAudit.length - 1];
  const mediaAuditLabel = lastMediaAction
    ? {
        'audio-requested': 'Microphone requested',
        'audio-opened': 'Microphone opened',
        'video-blocked': 'Camera request blocked',
        'media-released': 'All app media released',
      }[lastMediaAction.action]
    : 'No media request this session';

  const patchSetting = <K extends keyof Settings>(key: K, value: Settings[K]) =>
    setDraft((current) => (current ? { ...current, [key]: value } : current));

  const toggleCompanion = (id: CompanionId, enabled: boolean) => {
    const next = enabled
      ? Array.from(new Set([...draft.enabledCompanionIds, id]))
      : draft.enabledCompanionIds.filter((companionId) => companionId !== id);
    patchSetting('enabledCompanionIds', next);
  };

  const saveAll = async () => {
    await saveConfiguration({
      profile: {
        ...profile,
        displayName: displayName.trim(),
        systemTitle: systemTitle.trim() || 'Candidate',
      },
      settings: draft,
      missions: missionDrafts,
    });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
    await resume();
  };

  return (
    <div className="page">
      <header className="page-heading">
        <div>
          <p className="eyebrow">INTERFACE CONFIGURATION</p>
          <h1>Settings</h1>
          <p>Control the campaign without surrendering your data or dignity.</p>
        </div>
        <span className="page-heading__glyph">
          <SettingsIcon size={25} />
        </span>
      </header>

      <div className="settings-layout">
        <section className="panel settings-section">
          <header>
            <div>
              <p className="eyebrow">PROFILE</p>
              <h2>Candidate identity</h2>
            </div>
          </header>
          <div className="form-grid">
            <label className="field">
              <span>Display name</span>
              <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
            </label>
            <label className="field">
              <span>Custom System title</span>
              <input
                value={systemTitle}
                onChange={(event) => setSystemTitle(event.target.value)}
                placeholder="Candidate"
                maxLength={50}
              />
              <small>
                Cosmetic nickname only—it does not affect XP, stats, achievement titles, or class.
              </small>
            </label>
            <label className="field">
              <span>Equipped achievement title</span>
              <select
                value={profile.equippedTitleId}
                onChange={(event) => void equipTitle(event.target.value).then(refresh)}
              >
                {Array.from(unlockedTitleIds).map((id) => (
                  <option key={id} value={id}>
                    {id
                      .split('-')
                      .map((part) => part[0].toUpperCase() + part.slice(1))
                      .join(' ')}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className="panel settings-section">
          <header>
            <div>
              <p className="eyebrow">DAILY CYCLE</p>
              <h2>Time and exceptions</h2>
            </div>
          </header>
          <div className="form-grid">
            <label className="field">
              <span>Daily reset time</span>
              <input
                type="time"
                value={draft.resetTime}
                onChange={(event) => patchSetting('resetTime', event.target.value)}
              />
              <small>Current time zone: {draft.timeZone}</small>
            </label>
            <label className="field">
              <span>Week begins on</span>
              <select
                value={draft.weekStartsOn}
                onChange={(event) => patchSetting('weekStartsOn', Number(event.target.value))}
              >
                <option value={0}>Sunday</option>
                <option value={1}>Monday</option>
                <option value={6}>Saturday</option>
              </select>
            </label>
            <label className="field">
              <span>Protected exceptions per month</span>
              <input
                type="number"
                min="0"
                max="10"
                value={draft.protectedExceptionsPerMonth}
                onChange={(event) =>
                  patchSetting('protectedExceptionsPerMonth', Number(event.target.value))
                }
              />
            </label>
          </div>
        </section>

        <section className="panel settings-section">
          <header>
            <div>
              <p className="eyebrow">INTERFACE</p>
              <h2>Immersion and feedback</h2>
            </div>
          </header>
          <div className="settings-toggles">
            <div className="appearance-config">
              <div className="appearance-config__heading">
                <Palette size={18} />
                <span>
                  <strong>Interface style</strong>
                  <small>Change the presentation without changing your campaign data.</small>
                </span>
              </div>
              <div className="appearance-choice-grid">
                <button
                  type="button"
                  className={draft.interfaceStyle === 'system' ? 'is-active' : ''}
                  onClick={() => patchSetting('interfaceStyle', 'system')}
                >
                  <span className="appearance-preview appearance-preview--system">SYS_01</span>
                  <strong>System</strong>
                  <small>Living HUD, companion presence, realm travel, and cinematic depth</small>
                </button>
                <button
                  type="button"
                  className={draft.interfaceStyle === 'clean' ? 'is-active' : ''}
                  onClick={() => patchSetting('interfaceStyle', 'clean')}
                >
                  <span className="appearance-preview appearance-preview--clean">Aa</span>
                  <strong>Clean</strong>
                  <small>The same complete campaign with quieter transitions and surfaces</small>
                </button>
              </div>
            </div>
            <div className="appearance-config">
              <div className="appearance-config__heading">
                <span>
                  <strong>Color protocol</strong>
                  <small>Choose the atmosphere independently from interface style.</small>
                </span>
              </div>
              <div className="theme-choice-grid">
                <button
                  type="button"
                  className={draft.colorTheme === 'abyss' ? 'is-active' : ''}
                  onClick={() => patchSetting('colorTheme', 'abyss')}
                >
                  <span className="theme-swatch theme-swatch--abyss" />
                  <span>
                    <strong>Abyss</strong>
                    <small>Black · mint · violet</small>
                  </span>
                </button>
                <button
                  type="button"
                  className={draft.colorTheme === 'daybreak' ? 'is-active' : ''}
                  onClick={() => patchSetting('colorTheme', 'daybreak')}
                >
                  <span className="theme-swatch theme-swatch--daybreak" />
                  <span>
                    <strong>Daybreak</strong>
                    <small>Light gray · navy · sun yellow</small>
                  </span>
                </button>
                <button
                  type="button"
                  className={draft.colorTheme === 'bloodmoon' ? 'is-active' : ''}
                  onClick={() => patchSetting('colorTheme', 'bloodmoon')}
                >
                  <span className="theme-swatch theme-swatch--bloodmoon" />
                  <span>
                    <strong>Blood Moon</strong>
                    <small>Obsidian · crimson · antique gold</small>
                  </span>
                </button>
                <button
                  type="button"
                  className={draft.colorTheme === 'frostbound' ? 'is-active' : ''}
                  onClick={() => patchSetting('colorTheme', 'frostbound')}
                >
                  <span className="theme-swatch theme-swatch--frostbound" />
                  <span>
                    <strong>Frostbound</strong>
                    <small>Midnight · glacial blue · silver violet</small>
                  </span>
                </button>
                <button
                  type="button"
                  className={draft.colorTheme === 'winter-crown' ? 'is-active' : ''}
                  onClick={() => patchSetting('colorTheme', 'winter-crown')}
                >
                  <span className="theme-swatch theme-swatch--winter-crown" />
                  <span>
                    <strong>Winter Crown</strong>
                    <small>Snow · glacier · sovereign navy</small>
                  </span>
                </button>
                <button
                  type="button"
                  className={draft.colorTheme === 'verdant-nexus' ? 'is-active' : ''}
                  onClick={() => patchSetting('colorTheme', 'verdant-nexus')}
                >
                  <span className="theme-swatch theme-swatch--verdant-nexus" />
                  <span>
                    <strong>
                      Verdant Nexus <i className="theme-choice-grid__new">NEW</i>
                    </strong>
                    <small>Void black · living jade · ion lime</small>
                  </span>
                </button>
                <button
                  type="button"
                  className={draft.colorTheme === 'solar-warden' ? 'is-active' : ''}
                  onClick={() => patchSetting('colorTheme', 'solar-warden')}
                >
                  <span className="theme-swatch theme-swatch--solar-warden" />
                  <span>
                    <strong>
                      Solar Warden <i className="theme-choice-grid__new">NEW</i>
                    </strong>
                    <small>Obsidian · solar gold · white flame</small>
                  </span>
                </button>
                <button
                  type="button"
                  className={draft.colorTheme === 'neon-revenant' ? 'is-active' : ''}
                  onClick={() => patchSetting('colorTheme', 'neon-revenant')}
                >
                  <span className="theme-swatch theme-swatch--neon-revenant" />
                  <span>
                    <strong>
                      Neon Revenant <i className="theme-choice-grid__new">NEW</i>
                    </strong>
                    <small>Ink violet · shock pink · ion cyan</small>
                  </span>
                </button>
                <button
                  type="button"
                  className={draft.colorTheme === 'phantom-steel' ? 'is-active' : ''}
                  onClick={() => patchSetting('colorTheme', 'phantom-steel')}
                >
                  <span className="theme-swatch theme-swatch--phantom-steel" />
                  <span>
                    <strong>
                      Phantom Steel <i className="theme-choice-grid__new">NEW</i>
                    </strong>
                    <small>Graphite · silver · spectral blue</small>
                  </span>
                </button>
              </div>
            </div>
            <div className="appearance-config core-attunement-config">
              <div className="appearance-config__heading">
                <Zap size={18} />
                <span>
                  <strong>Core Attunement</strong>
                  <small>Color the Ascension Core independently from the world around it.</small>
                </span>
              </div>
              <div className="core-attunement-grid">
                {CORE_ATTUNEMENTS.map((attunement) => (
                  <button
                    type="button"
                    className={
                      (draft.coreAttunement ?? 'protocol-linked') === attunement.id
                        ? 'is-active'
                        : ''
                    }
                    data-core-preview={attunement.id}
                    key={attunement.id}
                    onClick={() => patchSetting('coreAttunement', attunement.id)}
                  >
                    <span className="core-attunement-grid__swatch" aria-hidden="true">
                      <i />
                    </span>
                    <span>
                      <strong>{attunement.name}</strong>
                      <small>{attunement.detail}</small>
                    </span>
                  </button>
                ))}
              </div>
              <p className="core-attunement-config__note">
                Attunement changes are visual only. Your Class, charge, XP, and progression remain
                untouched.
              </p>
            </div>
            {(
              [
                ['soundEnabled', 'System tones', 'Brief signals for victories and breakthroughs'],
                ['vibrationEnabled', 'Vibration', 'Used only when browser support is available'],
                [
                  'reducedMotion',
                  'Reduced motion',
                  'Stops cinematic movement while preserving dimensional styling',
                ],
                [
                  'privacyScreenEnabled',
                  'Privacy Screen',
                  'Blurs sensitive mission details whenever the app loses focus',
                ],
              ] as const
            ).map(([key, label, description]) => (
              <label className="switch-row" key={key}>
                <span>
                  <strong>{label}</strong>
                  <small>{description}</small>
                </span>
                <input
                  type="checkbox"
                  checked={draft[key]}
                  onChange={(event) => patchSetting(key, event.target.checked)}
                />
                <span className="switch" />
              </label>
            ))}
            <label className="field immersion-field">
              <span>Immersion intensity</span>
              <select
                value={draft.themeIntensity}
                onChange={(event) =>
                  patchSetting('themeIntensity', event.target.value as Settings['themeIntensity'])
                }
              >
                <option value="subtle">Subtle · quiet atmosphere</option>
                <option value="standard">Standard · living System</option>
                <option value="intense">Intense · full cinematic signal</option>
              </select>
              <small>
                Controls surface perspective, ambient depth, portal energy, companion glow, and
                interface motion.
              </small>
            </label>
            <label className="field">
              <span>Sensitive mission alias</span>
              <input
                value={draft.sensitiveMissionAlias}
                maxLength={48}
                onChange={(event) => patchSetting('sensitiveMissionAlias', event.target.value)}
              />
              <small>
                The saved mission ID never changes, so history and rewards remain stable.
              </small>
            </label>
            <label className="field">
              <span>System tone volume</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={draft.soundVolume}
                disabled={!draft.soundEnabled}
                onChange={(event) => patchSetting('soundVolume', Number(event.target.value))}
              />
            </label>
            <button
              className="button button--ghost"
              onClick={() => patchSetting('firstDayGuideCompleted', false)}
            >
              Restart first-day guide
            </button>
            <div className="placeholder-setting">
              <Bell size={18} />
              <div>
                <strong>Notifications</strong>
                <small>Reserved for a future version. No permission is requested.</small>
              </div>
              <span>PLANNED</span>
            </div>
          </div>
        </section>

        <section className="panel settings-section settings-section--wide companion-settings">
          <header>
            <div>
              <p className="eyebrow">PARTY & RARE EVENTS</p>
              <h2>Make the journey feel inhabited</h2>
              <p>Companion reactions and rare events are generated locally and work offline.</p>
            </div>
            <Users size={22} />
          </header>
          <div className="settings-toggles">
            <label className="switch-row">
              <span>
                <strong>Rare daily events</strong>
                <small>7% Emergency Quest · 5% Mission Pass · one saved roll per System day</small>
              </span>
              <input
                type="checkbox"
                checked={draft.dailyEventsEnabled}
                onChange={(event) => patchSetting('dailyEventsEnabled', event.target.checked)}
              />
              <span className="switch" />
            </label>
            <label className="field">
              <span>Companion frequency</span>
              <select
                value={draft.companionMode}
                onChange={(event) =>
                  patchSetting('companionMode', event.target.value as Settings['companionMode'])
                }
              >
                <option value="off">Off</option>
                <option value="quiet">Quiet · level-ups and major events only</option>
                <option value="balanced">Balanced · occasional mission reactions</option>
                <option value="talkative">Talkative · frequent encouragement</option>
              </select>
            </label>
          </div>
          <div className="party-settings-grid">
            {COMPANIONS.map((companion) => {
              const enabled = draft.enabledCompanionIds.includes(companion.id);
              return (
                <article
                  key={companion.id}
                  className={`party-setting-card ${companion.primary ? 'party-setting-card--primary' : ''} ${enabled ? 'is-enabled' : 'is-disabled'}`}
                  style={{ '--companion-accent': companion.accent } as CSSProperties}
                >
                  <img
                    src={getCompanionImage(companion.image)}
                    alt={`${companion.name}, ${companion.title}`}
                  />
                  <div>
                    <span className="eyebrow">
                      {companion.primary ? `PRIMARY SUPPORT · ${companion.title}` : companion.title}
                    </span>
                    <h3>{companion.name}</h3>
                    <strong>{companion.shortRole}</strong>
                    <p>{companion.description}</p>
                    <small>
                      <b>Personality:</b> {companion.personality}
                    </small>
                    <small>
                      <b>Appearance:</b> {companion.appearance}
                    </small>
                  </div>
                  <label className="companion-enable">
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={(event) => toggleCompanion(companion.id, event.target.checked)}
                    />
                    <span>
                      {companion.primary
                        ? enabled
                          ? 'Primary link'
                          : 'Snow muted'
                        : enabled
                          ? 'Linked'
                          : 'Muted'}
                    </span>
                  </label>
                </article>
              );
            })}
          </div>
          <div className="info-callout">
            <Zap size={17} />
            <span>
              Snow is your primary support and checks in once per System day. Stat level-ups still
              call the specialist responsible for that stat, while ordinary mission messages follow
              the frequency selected above.
            </span>
          </div>
        </section>

        <section
          className={`panel settings-section recovery-settings ${draft.recoveryMode.active ? 'is-active' : ''}`}
        >
          <header>
            <div>
              <p className="eyebrow">RECOVERY MODE</p>
              <h2>Protect a difficult season</h2>
              <p>
                Reduces active requirements and decay. It is not medical advice and never diagnoses
                you.
              </p>
            </div>
            <ShieldCheck size={22} />
          </header>
          <label className="switch-row">
            <span>
              <strong>Recovery Mode</strong>
              <small>
                Preserve stability during illness, injury, travel, emergency, or overload.
              </small>
            </span>
            <input
              type="checkbox"
              checked={draft.recoveryMode.active}
              onChange={(event) =>
                patchSetting('recoveryMode', {
                  ...draft.recoveryMode,
                  active: event.target.checked,
                })
              }
            />
            <span className="switch" />
          </label>
          {draft.recoveryMode.active && (
            <div className="form-grid">
              <label className="field">
                <span>Reason</span>
                <select
                  value={draft.recoveryMode.reason ?? 'other'}
                  onChange={(event) =>
                    patchSetting('recoveryMode', {
                      ...draft.recoveryMode,
                      reason: event.target.value as RecoveryReason,
                    })
                  }
                >
                  {['illness', 'injury', 'travel', 'emergency', 'overload', 'other'].map(
                    (reason) => (
                      <option key={reason} value={reason}>
                        {reason[0].toUpperCase() + reason.slice(1)}
                      </option>
                    ),
                  )}
                </select>
              </label>
              <label className="field">
                <span>End date · optional</span>
                <input
                  type="date"
                  value={draft.recoveryMode.endDate ?? ''}
                  onChange={(event) =>
                    patchSetting('recoveryMode', {
                      ...draft.recoveryMode,
                      endDate: (event.target.value ||
                        undefined) as Settings['recoveryMode']['endDate'],
                    })
                  }
                />
              </label>
            </div>
          )}
        </section>

        <section className="panel settings-section settings-section--wide">
          <header>
            <ShieldCheck size={21} />
            <div>
              <p className="eyebrow">MEDIA LOCK</p>
              <h2>Camera sealed</h2>
              <p>
                The System does not need camera access. Photos remain normal library selections,
                and voice starts only after a deliberate microphone press.
              </p>
            </div>
          </header>
          <div className="storage-summary">
            <strong>Current session</strong>
            <span>{mediaAuditLabel}</span>
            {lastMediaAction && (
              <small>{new Date(lastMediaAction.at).toLocaleString()}</small>
            )}
            <small>
              This audit stores only the action and time on this device—never speech, images,
              device names, or media content.
            </small>
          </div>
        </section>

        <section className="panel settings-section settings-section--wide">
          <header>
            <div>
              <p className="eyebrow">MISSION CONFIGURATION</p>
              <h2>Default directives</h2>
              <p>
                Disabled missions are removed from future System days. Existing history is
                preserved.
              </p>
            </div>
            <SlidersHorizontal size={22} />
          </header>
          <div className="mission-settings-list">
            {missionDrafts.map((mission, index) => (
              <div key={mission.id} className="mission-setting">
                <label className="switch-row">
                  <span>
                    <strong>{getMissionDisplayName(mission, draft.sensitiveMissionAlias)}</strong>
                    <small>
                      {mission.category} · {mission.accountXp} base XP
                    </small>
                  </span>
                  <input
                    type="checkbox"
                    checked={mission.enabled}
                    onChange={(event) =>
                      setMissionDrafts((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, enabled: event.target.checked } : item,
                        ),
                      )
                    }
                  />
                  <span className="switch" />
                </label>
                <label className="field">
                  <span>Mission name</span>
                  <input
                    value={sanitizeSensitiveDisplayText(mission.name)}
                    onChange={(event) =>
                      setMissionDrafts((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index
                            ? {
                                ...item,
                                name: sanitizeSensitiveDisplayText(event.target.value),
                              }
                            : item,
                        ),
                      )
                    }
                  />
                </label>
                <label className="field">
                  <span>Description</span>
                  <input
                    value={sanitizeSensitiveDisplayText(
                      mission.customDescription ?? mission.description,
                    )}
                    onChange={(event) =>
                      setMissionDrafts((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index
                            ? {
                                ...item,
                                customDescription: sanitizeSensitiveDisplayText(event.target.value),
                              }
                            : item,
                        ),
                      )
                    }
                  />
                </label>
                <div className="form-grid">
                  <label className="field">
                    <span>Category</span>
                    <select
                      value={mission.category}
                      onChange={(event) =>
                        setMissionDrafts((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index
                              ? {
                                  ...item,
                                  category: event.target.value as MissionDefinition['category'],
                                }
                              : item,
                          ),
                        )
                      }
                    >
                      {['faith', 'discipline', 'physical', 'creator', 'character'].map(
                        (category) => (
                          <option key={category} value={category}>
                            {category[0].toUpperCase() + category.slice(1)}
                          </option>
                        ),
                      )}
                    </select>
                  </label>
                  <label className="field">
                    <span>Completion type</span>
                    <select
                      value={mission.method}
                      onChange={(event) =>
                        setMissionDrafts((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index
                              ? {
                                  ...item,
                                  method: event.target.value as MissionDefinition['method'],
                                  detailFields:
                                    event.target.value === 'numeric'
                                      ? ['quantity', 'note']
                                      : event.target.value === 'duration'
                                        ? ['minutes', 'note']
                                        : event.target.value === 'checklist'
                                          ? ['checklist', 'note']
                                          : item.detailFields,
                                  checklistItems:
                                    event.target.value === 'checklist'
                                      ? (item.checklistItems ?? ['Step one', 'Step two'])
                                      : item.checklistItems,
                                }
                              : item,
                          ),
                        )
                      }
                    >
                      <option value="toggle">Simple toggle</option>
                      <option value="numeric">Numeric target</option>
                      <option value="duration">Duration</option>
                      <option value="checklist">Checklist</option>
                      <option value="choice">Choice</option>
                      <option value="day-boundary">End-of-day confirmation</option>
                    </select>
                  </label>
                  {mission.method === 'numeric' && (
                    <label className="field">
                      <span>Numeric target</span>
                      <input
                        type="number"
                        min="0"
                        value={mission.numericTarget ?? 1}
                        onChange={(event) =>
                          setMissionDrafts((current) =>
                            current.map((item, itemIndex) =>
                              itemIndex === index
                                ? { ...item, numericTarget: Number(event.target.value) }
                                : item,
                            ),
                          )
                        }
                      />
                    </label>
                  )}
                  {mission.method === 'checklist' && (
                    <label className="field">
                      <span>Checklist items · comma separated</span>
                      <input
                        value={(mission.checklistItems ?? []).join(', ')}
                        onChange={(event) =>
                          setMissionDrafts((current) =>
                            current.map((item, itemIndex) =>
                              itemIndex === index
                                ? {
                                    ...item,
                                    checklistItems: event.target.value
                                      .split(',')
                                      .map((value) => value.trim())
                                      .filter(Boolean),
                                  }
                                : item,
                            ),
                          )
                        }
                      />
                    </label>
                  )}
                  <label className="switch-row">
                    <span>
                      <strong>Optional mission</strong>
                      <small>Does not affect Perfect Day status</small>
                    </span>
                    <input
                      type="checkbox"
                      checked={mission.optional ?? false}
                      onChange={(event) =>
                        setMissionDrafts((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index
                              ? {
                                  ...item,
                                  optional: event.target.checked,
                                  isCore: !event.target.checked,
                                }
                              : item,
                          ),
                        )
                      }
                    />
                    <span className="switch" />
                  </label>
                </div>
                <fieldset className="weekday-picker">
                  <legend>Active weekdays</legend>
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, weekday) => (
                    <label key={`${mission.id}-${weekday}`}>
                      <input
                        type="checkbox"
                        checked={
                          !mission.activeWeekdays?.length ||
                          mission.activeWeekdays.includes(weekday)
                        }
                        onChange={(event) => {
                          const currentDays = mission.activeWeekdays?.length
                            ? mission.activeWeekdays
                            : [0, 1, 2, 3, 4, 5, 6];
                          const activeWeekdays = event.target.checked
                            ? [...new Set([...currentDays, weekday])].sort()
                            : currentDays.filter((value) => value !== weekday);
                          setMissionDrafts((current) =>
                            current.map((item, itemIndex) =>
                              itemIndex === index ? { ...item, activeWeekdays } : item,
                            ),
                          );
                        }}
                      />
                      <span>{day}</span>
                    </label>
                  ))}
                </fieldset>
                {draft.advancedBalanceUnlocked && (
                  <div className="form-grid">
                    <label className="field">
                      <span>Configured account XP</span>
                      <input
                        type="number"
                        min="0"
                        max="500"
                        value={mission.customAccountXp ?? mission.accountXp}
                        onChange={(event) =>
                          setMissionDrafts((current) =>
                            current.map((item, itemIndex) =>
                              itemIndex === index
                                ? { ...item, customAccountXp: Number(event.target.value) }
                                : item,
                            ),
                          )
                        }
                      />
                      <small>Current System baseline awards {missionAccountXp(mission)} XP.</small>
                    </label>
                    <label className="field">
                      <span>Primary stat mapping</span>
                      <select
                        value={mission.statRewards[0]?.stat ?? 'discipline'}
                        onChange={(event) =>
                          setMissionDrafts((current) =>
                            current.map((item, itemIndex) => {
                              if (itemIndex !== index) return item;
                              const [primary, ...rest] = item.statRewards;
                              return {
                                ...item,
                                statRewards: [
                                  {
                                    stat: event.target
                                      .value as MissionDefinition['statRewards'][number]['stat'],
                                    xp: primary?.xp ?? 5,
                                  },
                                  ...rest,
                                ],
                              };
                            }),
                          )
                        }
                      >
                        {[
                          'faith',
                          'strength',
                          'endurance',
                          'discipline',
                          'willpower',
                          'wisdom',
                          'creativity',
                          'focus',
                          'vitality',
                          'character',
                          'empathy',
                          'stewardship',
                        ].map((stat) => (
                          <option key={stat} value={stat}>
                            {stat[0].toUpperCase() + stat.slice(1)}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="advanced-balance">
            <label className="switch-row">
              <span>
                <strong>Advanced Balance</strong>
                <small>Changing XP rewards can materially alter long-term pacing.</small>
              </span>
              <input
                type="checkbox"
                checked={draft.advancedBalanceUnlocked}
                onChange={(event) => patchSetting('advancedBalanceUnlocked', event.target.checked)}
              />
              <span className="switch" />
            </label>
            <button
              className="button button--ghost mission-defaults-button"
              onClick={() => setMissionDrafts(DEFAULT_MISSIONS.map((mission) => ({ ...mission })))}
            >
              <RotateCcw size={16} /> Restore mission defaults
            </button>
            <details className="mission-template-picker">
              <summary>Add an optional mission</summary>
              <div>
                {OPTIONAL_MISSION_TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    className="mini-button"
                    disabled={missionDrafts.some((mission) => mission.id === template.id)}
                    onClick={() =>
                      setMissionDrafts((current) => [
                        ...current,
                        {
                          ...template,
                          id: template.id,
                          enabled: true,
                        },
                      ])
                    }
                  >
                    {template.name}
                  </button>
                ))}
                <button
                  className="mini-button"
                  onClick={() =>
                    setMissionDrafts((current) => [
                      ...current,
                      {
                        id: `custom-${crypto.randomUUID()}`,
                        name: 'Custom Mission',
                        shortName: 'Custom',
                        description: 'Describe the action that completes this mission.',
                        category: 'discipline',
                        method: 'toggle',
                        accountXp: 10,
                        statRewards: [{ stat: 'discipline', xp: 5 }],
                        enabled: true,
                        isCore: false,
                        optional: true,
                        allowNotes: true,
                        detailFields: ['note'],
                        recoveryEligible: true,
                      },
                    ])
                  }
                >
                  Blank custom mission
                </button>
              </div>
            </details>
          </div>
        </section>

        <section className="panel settings-section settings-section--wide">
          <header>
            <div>
              <p className="eyebrow">ARCHIVE SHIELD · LOCAL DATA</p>
              <h2>Full-campaign backup</h2>
              <p>
                Everything—including System Ascension preferences, Kitchen notes, structured
                Training Hall records, Treasury records, Campaign Arcs, questlines, briefings,
                Councils, chats, and all twelve companions—is stored on this device. Export
                regularly before clearing browser data or changing phones.
              </p>
            </div>
          </header>
          <div className="data-actions">
            <button
              className="button button--primary"
              onClick={() =>
                void downloadSave().then(() => setDataMessage('Integrity-checked save exported.'))
              }
            >
              <Download size={17} />
              Export save
            </button>
            <button className="button button--ghost" onClick={() => importRef.current?.click()}>
              <Upload size={17} />
              Import save
            </button>
            <Link to="/update-center" className="button button--ghost">
              Open Update Center
            </Link>
            <input
              ref={importRef}
              type="file"
              accept="application/json,.json"
              hidden
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                try {
                  setPreparedImport(await prepareSaveImport(file));
                  setDataMessage('');
                } catch (error) {
                  setDataMessage(
                    error instanceof Error ? error.message : 'That save could not be inspected.',
                  );
                } finally {
                  event.target.value = '';
                }
              }}
            />
          </div>
          {dataMessage && (
            <p className="data-message" role="status" aria-live="polite">
              {dataMessage}
            </p>
          )}
          <div className="storage-summary">
            <strong>On-device storage</strong>
            <span>Current save: {formatBytes(storage?.saveBytes)}</span>
            <span>Recovery snapshots: {formatBytes(storage?.backupBytes)}</span>
            <small>
              Automatic snapshots are created before a daily finalization, import, or reset. The
              newest five are kept on this phone. Portable imports are integrity-checked up to 32
              MB.
            </small>
          </div>
          <div className="snapshot-list">
            {snapshots.map((snapshot) => (
              <div key={snapshot.id} className="snapshot-row">
                <div>
                  <strong>{snapshot.reason.replaceAll('-', ' ')}</strong>
                  <small>
                    {new Date(snapshot.createdAt).toLocaleString()} ·{' '}
                    {formatBytes(snapshot.byteSize)}
                  </small>
                </div>
                <button
                  className="mini-button"
                  onClick={async () => {
                    if (!window.confirm('Restore this snapshot and replace the current save?'))
                      return;
                    try {
                      await restoreLocalSnapshot(snapshot.id);
                      await load();
                      await refreshLocalData();
                      setDataMessage('Recovery snapshot restored.');
                    } catch (error) {
                      setDataMessage(
                        error instanceof Error
                          ? error.message
                          : 'That recovery snapshot could not be restored.',
                      );
                    }
                  }}
                >
                  Restore
                </button>
              </div>
            ))}
          </div>
          <aside className="danger-zone">
            <div>
              <p className="eyebrow">DANGER ZONE</p>
              <strong>Reset the entire local campaign</strong>
              <small>
                This control is intentionally separated from backup and configuration actions.
              </small>
            </div>
            <button className="button button--danger" onClick={() => setResetOpen(true)}>
              Reset app data
            </button>
          </aside>
        </section>

        <section className="panel settings-section settings-section--wide about-panel">
          <Info size={21} />
          <div>
            <p className="eyebrow">ABOUT</p>
            <h2>The System · Version {APP_VERSION}</h2>
            <p>
              An original, offline-first personal progression RPG. It uses no login, backend,
              external API, analytics, advertising, tracking, paid service, or copied franchise
              asset. All campaign data remains on this device unless you export it.
            </p>
          </div>
        </section>
      </div>

      <div className="save-dock">
        <button className="button button--primary button--large" onClick={() => void saveAll()}>
          <Save size={18} />
          {saved ? 'Configuration saved' : 'Save configuration'}
        </button>
      </div>

      <Modal
        open={Boolean(preparedImport)}
        onClose={() => setPreparedImport(undefined)}
        eyebrow="IMPORT PREVIEW"
        title="Replace the current campaign?"
      >
        {preparedImport && (
          <div className="import-preview">
            <p>
              A recovery snapshot of the current campaign will be created first. The replacement is
              atomic: if validation or writing fails, the current save remains unchanged.
            </p>
            <div className="detail-facts">
              <div>
                <span>Candidate</span>
                <strong>{preparedImport.preview.displayName}</strong>
              </div>
              <div>
                <span>Level / Class</span>
                <strong>
                  {preparedImport.preview.level} / {formatClassName(preparedImport.preview.rank)}
                </strong>
              </div>
              <div>
                <span>Exported</span>
                <strong>{new Date(preparedImport.preview.exportedAt).toLocaleDateString()}</strong>
              </div>
            </div>
            <button
              className="button button--danger button--wide"
              onClick={async () => {
                try {
                  await commitPreparedImport(preparedImport);
                  setPreparedImport(undefined);
                  await load();
                  await refreshLocalData();
                  setDataMessage('Save imported successfully.');
                } catch (error) {
                  setPreparedImport(undefined);
                  setDataMessage(
                    error instanceof Error
                      ? error.message
                      : 'The import failed. The current save was not replaced.',
                  );
                }
              }}
            >
              Confirm and replace current save
            </button>
          </div>
        )}
      </Modal>

      <Modal
        open={resetOpen}
        onClose={() => {
          setResetOpen(false);
          setResetText('');
        }}
        eyebrow="DESTRUCTIVE ACTION"
        title="Reset all campaign data"
      >
        <div className="reset-confirmation">
          <p>
            This removes the local profile, mission history, XP, stats, and settings. A recovery
            snapshot is created automatically, but exporting a separate file is safest before
            clearing Safari data or changing phones.
          </p>
          <button className="button button--ghost button--wide" onClick={() => void downloadSave()}>
            <Download size={17} /> Export backup first
          </button>
          <label className="field">
            <span>Type RESET to continue</span>
            <input value={resetText} onChange={(event) => setResetText(event.target.value)} />
          </label>
          <button
            className="button button--danger button--wide"
            disabled={resetText !== 'RESET'}
            onClick={async () => {
              await resetAllData();
              setResetOpen(false);
              setResetText('');
              await load();
            }}
          >
            Final confirmation: reset app
          </button>
        </div>
      </Modal>
    </div>
  );
}

function formatBytes(value?: number) {
  if (value === undefined) return 'Calculating…';
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}
