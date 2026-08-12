import {
  Activity,
  ChevronDown,
  Headphones,
  LoaderCircle,
  Mic,
  RotateCcw,
  Save,
  SlidersHorizontal,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { AI_ACCENT_OPTIONS, AI_VOICE_OPTIONS, CANON_VOICE_PROFILES } from '@/config/aiVoices';
import { COMPANIONS, getCompanionImage } from '@/config/companions';
import { formatEstimatedSpend, type AiUsageSummary } from '@/game/aiVoice';
import type { AiVoiceProfile, CompanionId, Settings } from '@/types/game';

export function AiVoiceLinkPanel({
  settings,
  profiles,
  usage,
  voiceBusyMessageId,
  onEnable,
  onToggleOutput,
  onToggleAutoPlay,
  onSetWarning,
  onSaveProfile,
  onResetProfile,
  onPreview,
  onTestSpeaker,
}: {
  settings: Settings;
  profiles?: Record<CompanionId, AiVoiceProfile>;
  usage?: AiUsageSummary;
  voiceBusyMessageId?: string;
  onEnable: () => Promise<void>;
  onToggleOutput: (enabled: boolean) => Promise<void>;
  onToggleAutoPlay: (enabled: boolean) => Promise<void>;
  onSetWarning: (value: number) => Promise<void>;
  onSaveProfile: (profile: AiVoiceProfile) => Promise<AiVoiceProfile>;
  onResetProfile: (companionId: CompanionId) => Promise<AiVoiceProfile>;
  onPreview: (profile: AiVoiceProfile) => Promise<void>;
  onTestSpeaker: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [forgeId, setForgeId] = useState<CompanionId>('snow');
  const [draft, setDraft] = useState<AiVoiceProfile>();
  const [saving, setSaving] = useState(false);
  const [usageOpen, setUsageOpen] = useState(false);
  const companion = useMemo(() => COMPANIONS.find((item) => item.id === forgeId)!, [forgeId]);
  const canon = CANON_VOICE_PROFILES[forgeId];

  useEffect(() => {
    if (profiles?.[forgeId]) setDraft({ ...profiles[forgeId] });
  }, [forgeId, profiles]);

  const monthWarning =
    settings.aiUsageWarningUsd > 0 &&
    (usage?.month.estimatedCostUsd ?? 0) >= settings.aiUsageWarningUsd;

  async function save() {
    if (!draft) return;
    setSaving(true);
    const saved = await onSaveProfile(draft);
    setDraft(saved);
    setSaving(false);
  }

  async function reset() {
    setSaving(true);
    setDraft(await onResetProfile(forgeId));
    setSaving(false);
  }

  return (
    <section className={`ai-voice-link ${settings.aiVoiceOutputEnabled ? 'is-enabled' : ''}`}>
      <div className="ai-voice-link__topline">
        <button
          className="ai-voice-link__summary"
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
        >
          <span>
            <Headphones size={19} />
          </span>
          <span>
            <strong>Voice Link · Voice Forge</strong>
            <small>
              {settings.aiVoiceOutputEnabled
                ? `${settings.aiVoiceAutoPlay ? 'Voiced replies automatic' : 'Manual playback'} · ten soulprints ready`
                : 'AI-generated companion voices are muted'}
            </small>
          </span>
          <ChevronDown className={open ? 'is-open' : ''} size={16} />
        </button>

        <button
          className={`ai-usage-chip ${monthWarning ? 'is-warning' : ''}`}
          type="button"
          onClick={() => setUsageOpen((value) => !value)}
          aria-expanded={usageOpen}
        >
          <Activity size={15} />
          <span>
            <small>APP ESTIMATE · THIS MONTH</small>
            <strong>{formatEstimatedSpend(usage?.month.estimatedCostUsd ?? 0)}</strong>
          </span>
        </button>
      </div>

      {usageOpen && (
        <div className="ai-usage-ledger">
          <div className="ai-usage-ledger__totals">
            {(
              [
                ['Session', usage?.session],
                ['Today', usage?.today],
                ['Month', usage?.month],
              ] as Array<[string, AiUsageSummary['month'] | undefined]>
            ).map(([label, current]) => {
              return (
                <article key={String(label)}>
                  <span>{label}</span>
                  <strong>{formatEstimatedSpend(current?.estimatedCostUsd ?? 0)}</strong>
                  <small>{current?.calls ?? 0} API calls</small>
                </article>
              );
            })}
          </div>
          <div className="ai-usage-ledger__detail">
            <p>
              <strong>{(usage?.month.totalTokens ?? 0).toLocaleString()}</strong> exact text tokens
              · <strong>{Math.round(usage?.month.audioSeconds ?? 0)}s</strong> recorded/generated
              audio · <strong>{(usage?.month.characters ?? 0).toLocaleString()}</strong> speech
              characters
            </p>
            <label>
              Warn me near
              <span>$</span>
              <input
                type="number"
                min="0"
                max="1000"
                step="1"
                value={settings.aiUsageWarningUsd}
                onChange={(event) => void onSetWarning(Number(event.target.value) || 0)}
              />
            </label>
          </div>
          <p className="ai-usage-ledger__note">
            Token and call counts come from this app’s responses. Dollar totals are estimates based
            on current model rates and never include API use outside this System; the OpenAI Usage
            dashboard remains the billing authority.
          </p>
        </div>
      )}

      {open && (
        <div className="ai-voice-link__body">
          {!settings.aiVoiceDisclosureAcknowledged ? (
            <div className="ai-voice-disclosure">
              <Sparkles size={22} />
              <span>
                <strong>Every spoken companion voice is AI-generated.</strong>
                <small>
                  Text always stays visible. Voice costs are shown in the local usage estimate, and
                  you can mute the entire layer at any time without changing campaign data.
                </small>
              </span>
              <button className="button button--primary" type="button" onClick={onEnable}>
                <Volume2 size={16} /> I understand · Enable voices
              </button>
            </div>
          ) : (
            <div className="ai-voice-controls">
              <button
                type="button"
                className={settings.aiVoiceOutputEnabled ? 'is-active' : ''}
                onClick={() => onToggleOutput(!settings.aiVoiceOutputEnabled)}
              >
                {settings.aiVoiceOutputEnabled ? <Volume2 size={17} /> : <VolumeX size={17} />}
                <span>
                  <strong>{settings.aiVoiceOutputEnabled ? 'Voices on' : 'Voices muted'}</strong>
                  <small>Manual play and previews</small>
                </span>
              </button>
              <button
                type="button"
                className={settings.aiVoiceAutoPlay ? 'is-active' : ''}
                disabled={!settings.aiVoiceOutputEnabled}
                onClick={() => onToggleAutoPlay(!settings.aiVoiceAutoPlay)}
              >
                <Mic size={17} />
                <span>
                  <strong>{settings.aiVoiceAutoPlay ? 'Auto voice on' : 'Auto voice off'}</strong>
                  <small>Party replies play in order</small>
                </span>
              </button>
              <button type="button" onClick={onTestSpeaker}>
                <Volume2 size={17} />
                <span>
                  <strong>Test speaker</strong>
                  <small>Free · three System tones</small>
                </span>
              </button>
            </div>
          )}

          <div className="ai-voice-forge">
            <header>
              <span>
                <SlidersHorizontal size={18} />
              </span>
              <div>
                <strong>Voice Forge</strong>
                <small>Canon defaults by The System · every setting remains yours</small>
              </div>
            </header>

            <div className="ai-voice-forge__roster" aria-label="Choose a companion voice">
              {COMPANIONS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={item.id === forgeId ? 'is-active' : ''}
                  style={{ '--companion-accent': item.accent } as CSSProperties}
                  onClick={() => setForgeId(item.id)}
                >
                  <img src={getCompanionImage(item.image)} alt="" />
                  <span>{item.name}</span>
                </button>
              ))}
            </div>

            {draft ? (
              <div className="ai-voice-forge__workbench">
                <div className="ai-voice-forge__identity">
                  <img src={getCompanionImage(companion.image)} alt="" />
                  <span>
                    <small>CANON SOULPRINT</small>
                    <strong>
                      {companion.name} · {companion.title}
                    </strong>
                    <p>{canon.direction}</p>
                  </span>
                </div>

                <div className="ai-voice-forge__selectors">
                  <label>
                    Base voice
                    <select
                      value={draft.voice}
                      onChange={(event) =>
                        setDraft({ ...draft, voice: event.target.value as AiVoiceProfile['voice'] })
                      }
                    >
                      {AI_VOICE_OPTIONS.map((voice) => (
                        <option key={voice.id} value={voice.id}>
                          {voice.label} · {voice.character}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Accent / region
                    <select
                      value={draft.accent}
                      onChange={(event) =>
                        setDraft({
                          ...draft,
                          accent: event.target.value as AiVoiceProfile['accent'],
                        })
                      }
                    >
                      {AI_ACCENT_OPTIONS.map((accent) => (
                        <option key={accent.id} value={accent.id}>
                          {accent.label}
                        </option>
                      ))}
                    </select>
                    <small>
                      Canon stays neutral because appearance never determines how someone sounds.
                    </small>
                  </label>
                </div>

                <div className="ai-voice-forge__sliders">
                  {[
                    ['Pace', 'pace', 0.8, 1.2, 0.05],
                    ['Warmth', 'warmth', 1, 5, 1],
                    ['Energy', 'energy', 1, 5, 1],
                    ['Expression', 'expressiveness', 1, 5, 1],
                  ].map(([label, key, min, max, step]) => (
                    <label key={String(key)}>
                      <span>
                        {label} <strong>{draft[key as keyof AiVoiceProfile]}</strong>
                      </span>
                      <input
                        type="range"
                        min={Number(min)}
                        max={Number(max)}
                        step={Number(step)}
                        value={Number(draft[key as keyof AiVoiceProfile])}
                        onChange={(event) =>
                          setDraft({ ...draft, [key]: Number(event.target.value) })
                        }
                      />
                    </label>
                  ))}
                </div>

                <blockquote>“{canon.audition}”</blockquote>
                <div className="ai-voice-forge__actions">
                  <button
                    className="button button--secondary"
                    type="button"
                    disabled={!settings.aiVoiceOutputEnabled || Boolean(voiceBusyMessageId)}
                    onClick={() => onPreview(draft)}
                  >
                    {voiceBusyMessageId?.startsWith('preview:') ? (
                      <LoaderCircle className="is-spinning" size={16} />
                    ) : (
                      <Headphones size={16} />
                    )}
                    Preview voice
                  </button>
                  <button
                    className="button button--secondary"
                    type="button"
                    disabled={saving}
                    onClick={reset}
                  >
                    <RotateCcw size={16} /> Restore canon
                  </button>
                  <button
                    className="button button--primary"
                    type="button"
                    disabled={saving}
                    onClick={save}
                  >
                    {saving ? (
                      <LoaderCircle className="is-spinning" size={16} />
                    ) : (
                      <Save size={16} />
                    )}
                    Save soulprint
                  </button>
                </div>
              </div>
            ) : (
              <div className="ai-voice-forge__loading">
                <LoaderCircle className="is-spinning" size={18} /> Loading soulprints…
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
