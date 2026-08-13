import {
  Activity,
  ChevronDown,
  Headphones,
  LoaderCircle,
  Mic,
  RotateCcw,
  Save,
  Search,
  SlidersHorizontal,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import {
  AI_ACCENT_OPTIONS,
  AI_CADENCE_OPTIONS,
  AI_DELIVERY_OPTIONS,
  AI_PERFORMANCE_TAKE_OPTIONS,
  AI_REGISTER_OPTIONS,
  AI_RESONANCE_OPTIONS,
  AI_TEXTURE_OPTIONS,
  AI_VOICE_OPTIONS,
  CANON_VOICE_PROFILES,
} from '@/config/aiVoices';
import { COMPANIONS, getCompanionImage } from '@/config/companions';
import { formatEstimatedSpend, getCartesiaMonthlyUsage, type AiUsageSummary } from '@/game/aiVoice';
import type {
  AiCartesiaPlan,
  AiVoiceProfile,
  AiVoiceProvider,
  AiVoiceTake,
  CompanionId,
  Settings,
} from '@/types/game';
import type { AiLinkStatus, CartesiaVoiceOption } from '@/services/aiHeadquarters';

export function AiVoiceLinkPanel({
  settings,
  profiles,
  usage,
  status,
  cartesiaVoices,
  cartesiaCatalogLoading,
  cartesiaCatalogError,
  voiceBusyMessageId,
  onEnable,
  onToggleOutput,
  onToggleAutoPlay,
  onSetWarning,
  onSetProvider,
  onSetCartesiaPlan,
  onLoadCartesiaVoices,
  onSaveProfile,
  onResetProfile,
  onPreview,
  onTestSpeaker,
}: {
  settings: Settings;
  profiles?: Record<CompanionId, AiVoiceProfile>;
  usage?: AiUsageSummary;
  status?: AiLinkStatus;
  cartesiaVoices: CartesiaVoiceOption[];
  cartesiaCatalogLoading: boolean;
  cartesiaCatalogError: string;
  voiceBusyMessageId?: string;
  onEnable: () => Promise<void>;
  onToggleOutput: (enabled: boolean) => Promise<void>;
  onToggleAutoPlay: (enabled: boolean) => Promise<void>;
  onSetWarning: (value: number) => Promise<void>;
  onSetProvider: (provider: AiVoiceProvider) => Promise<void>;
  onSetCartesiaPlan: (plan: AiCartesiaPlan) => Promise<void>;
  onLoadCartesiaVoices: () => Promise<CartesiaVoiceOption[]>;
  onSaveProfile: (profile: AiVoiceProfile) => Promise<AiVoiceProfile>;
  onResetProfile: (companionId: CompanionId) => Promise<AiVoiceProfile>;
  onPreview: (profile: AiVoiceProfile, takeOverride?: AiVoiceTake) => Promise<void>;
  onTestSpeaker: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [forgeId, setForgeId] = useState<CompanionId>('snow');
  const [draft, setDraft] = useState<AiVoiceProfile>();
  const [saving, setSaving] = useState(false);
  const [usageOpen, setUsageOpen] = useState(false);
  const [voiceSearch, setVoiceSearch] = useState('');
  const companion = useMemo(() => COMPANIONS.find((item) => item.id === forgeId)!, [forgeId]);
  const canon = CANON_VOICE_PROFILES[forgeId];
  const selectedProvider = settings.aiVoiceProvider ?? 'openai';
  const cartesiaPlan = settings.aiCartesiaPlan ?? 'free';
  const cartesiaUsage = getCartesiaMonthlyUsage(usage, cartesiaPlan);
  const filteredCartesiaVoices = useMemo(() => {
    const search = voiceSearch.trim().toLowerCase();
    if (!search) return cartesiaVoices;
    return cartesiaVoices.filter(
      (voice) =>
        voice.id === draft?.cartesiaVoiceId ||
        [voice.name, voice.description, voice.gender, voice.country]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(search)),
    );
  }, [cartesiaVoices, draft?.cartesiaVoiceId, voiceSearch]);

  useEffect(() => {
    if (profiles?.[forgeId]) setDraft({ ...profiles[forgeId] });
  }, [forgeId, profiles]);

  useEffect(() => {
    if (
      open &&
      selectedProvider === 'cartesia' &&
      status?.cartesiaConfigured &&
      !cartesiaVoices.length &&
      !cartesiaCatalogLoading &&
      !cartesiaCatalogError
    ) {
      void onLoadCartesiaVoices();
    }
  }, [
    cartesiaCatalogError,
    cartesiaCatalogLoading,
    cartesiaVoices.length,
    onLoadCartesiaVoices,
    open,
    selectedProvider,
    status?.cartesiaConfigured,
  ]);

  const monthWarning =
    settings.aiUsageWarningUsd > 0 &&
    (usage?.month.estimatedCostUsd ?? 0) >= settings.aiUsageWarningUsd;
  const performanceSliders: Array<{
    label: string;
    key:
      | 'pace'
      | 'warmth'
      | 'energy'
      | 'expressiveness'
      | 'naturalism'
      | 'pauseDiscipline'
      | 'intonation'
      | 'articulation'
      | 'emotionalRange';
    min: number;
    max: number;
    step: number;
    value: (profile: AiVoiceProfile) => string;
  }> = [
    {
      label: 'Pace',
      key: 'pace',
      min: 0.75,
      max: 1.65,
      step: 0.05,
      value: (profile) => `${profile.pace.toFixed(2)}x · ~${Math.round(155 * profile.pace)} WPM`,
    },
    {
      label: 'Warmth',
      key: 'warmth',
      min: 1,
      max: 5,
      step: 1,
      value: (profile) => String(profile.warmth),
    },
    {
      label: 'Energy',
      key: 'energy',
      min: 1,
      max: 5,
      step: 1,
      value: (profile) => String(profile.energy),
    },
    {
      label: 'Expression',
      key: 'expressiveness',
      min: 1,
      max: 5,
      step: 1,
      value: (profile) => String(profile.expressiveness),
    },
    {
      label: 'Human feel',
      key: 'naturalism',
      min: 1,
      max: 5,
      step: 1,
      value: (profile) => String(profile.naturalism),
    },
    {
      label: 'Pause control',
      key: 'pauseDiscipline',
      min: 1,
      max: 5,
      step: 1,
      value: (profile) => String(profile.pauseDiscipline),
    },
    {
      label: 'Intonation',
      key: 'intonation',
      min: 1,
      max: 5,
      step: 1,
      value: (profile) => String(profile.intonation),
    },
    {
      label: 'Articulation',
      key: 'articulation',
      min: 1,
      max: 5,
      step: 1,
      value: (profile) => String(profile.articulation),
    },
    {
      label: 'Emotional range',
      key: 'emotionalRange',
      min: 1,
      max: 5,
      step: 1,
      value: (profile) => String(profile.emotionalRange),
    },
  ];

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
                ? `${settings.aiVoiceAutoPlay ? 'Voiced replies automatic' : 'Manual playback'} · ${selectedProvider === 'cartesia' ? 'Cartesia Realistic' : 'OpenAI Standard'}`
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
              <strong>{(usage?.month.inputTokens ?? 0).toLocaleString()}</strong> input ·{' '}
              <strong>{(usage?.month.cachedInputTokens ?? 0).toLocaleString()}</strong> cached ·{' '}
              <strong>{(usage?.month.outputTokens ?? 0).toLocaleString()}</strong> output ·{' '}
              <strong>{(usage?.month.reasoningTokens ?? 0).toLocaleString()}</strong> reasoning
            </p>
            <p>
              <strong>{Math.round(usage?.month.audioSeconds ?? 0)}s</strong> recorded/generated
              audio · <strong>{(usage?.month.characters ?? 0).toLocaleString()}</strong> speech
              characters
            </p>
            {(usage?.month.audioInputTokens ?? 0) + (usage?.month.audioOutputTokens ?? 0) > 0 && (
              <p>
                Live Link · <strong>{(usage?.month.audioInputTokens ?? 0).toLocaleString()}</strong>{' '}
                audio in ·{' '}
                <strong>{(usage?.month.cachedAudioInputTokens ?? 0).toLocaleString()}</strong>{' '}
                cached audio ·{' '}
                <strong>{(usage?.month.audioOutputTokens ?? 0).toLocaleString()}</strong> audio out
              </p>
            )}
            <div className="ai-usage-ledger__models">
              {Object.entries(usage?.byModel ?? {}).map(([model, totals]) => (
                <span key={model}>
                  <strong>{model}</strong>
                  <small>
                    {totals.calls} call{totals.calls === 1 ? '' : 's'} ·{' '}
                    {formatEstimatedSpend(totals.estimatedCostUsd)}
                  </small>
                </span>
              ))}
            </div>
            {(status?.cartesiaConfigured || cartesiaUsage.characters > 0) && (
              <div className="ai-cartesia-allowance">
                <span>
                  <small>CARTESIA {cartesiaPlan.toUpperCase()} · LOCAL APP COUNT</small>
                  <strong>
                    {cartesiaUsage.characters.toLocaleString()} /{' '}
                    {cartesiaUsage.limit.toLocaleString()} credits
                  </strong>
                </span>
                <span>
                  <small>ESTIMATED REMAINING</small>
                  <strong>~{cartesiaUsage.approximateMinutesRemaining} voice minutes</strong>
                </span>
                <div aria-label={`${Math.round(cartesiaUsage.percent)} percent used`}>
                  <i style={{ width: `${cartesiaUsage.percent}%` }} />
                </div>
                <label>
                  Allowance
                  <select
                    value={cartesiaPlan}
                    onChange={(event) =>
                      void onSetCartesiaPlan(event.target.value as AiCartesiaPlan)
                    }
                  >
                    <option value="free">Free · 20,000 monthly credits</option>
                    <option value="pro">Pro · 100,000 monthly credits</option>
                  </select>
                </label>
                <p>
                  This counts speech generated inside The System. Cartesia remains the authority if
                  the same account is used elsewhere.
                </p>
              </div>
            )}
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
            Text, vision, cache, reasoning, transcription, and Live Link audio token counts come
            from API responses. Dollar totals apply current model rates locally; generated-speech
            cost remains an estimate because the speech endpoint returns audio rather than a usage
            ledger. Cartesia speech is counted as local monthly credits rather than estimated
            pay-per-call dollars. This never includes API use outside The System; each provider's
            own dashboard remains the billing authority.
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

          <div className="ai-voice-engine">
            <header>
              <span>
                <Sparkles size={17} />
              </span>
              <div>
                <strong>Voice Engine</strong>
                <small>Change the speaker without changing the companion</small>
              </div>
            </header>
            <div>
              <button
                type="button"
                className={selectedProvider === 'openai' ? 'is-active' : ''}
                onClick={() => void onSetProvider('openai')}
              >
                <strong>OpenAI Standard</strong>
                <small>Current voices · permanent fallback</small>
              </button>
              <button
                type="button"
                className={selectedProvider === 'cartesia' ? 'is-active' : ''}
                disabled={!status?.cartesiaConfigured}
                onClick={() => void onSetProvider('cartesia')}
              >
                <strong>Cartesia Realistic</strong>
                <small>
                  {status?.cartesiaConfigured
                    ? `${status.cartesiaModel ?? 'Sonic 3.5'} · connected`
                    : 'Secure connection required'}
                </small>
              </button>
            </div>
            <p>
              Play Voice, automatic replies, Quick Link, Party Council, and previews use this
              engine. Live Link remains on its native OpenAI realtime channel. Cartesia failures
              return to OpenAI automatically.
            </p>
          </div>

          <div className="ai-voice-forge">
            <header>
              <span>
                <SlidersHorizontal size={18} />
              </span>
              <div>
                <strong>Voice Forge III · Living Performance</strong>
                <small>Eleven unmistakable Soulprints · dual-engine casting · safe fallback</small>
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

                {selectedProvider === 'cartesia' ? (
                  <div className="ai-voice-forge__selectors ai-voice-forge__selectors--cartesia">
                    <label className="ai-cartesia-casting">
                      Cartesia voice
                      <span>
                        <Search size={14} />
                        <input
                          type="search"
                          value={voiceSearch}
                          onChange={(event) => setVoiceSearch(event.target.value)}
                          placeholder="Search name, style, or region"
                        />
                      </span>
                      <select
                        value={draft.cartesiaVoiceId ?? ''}
                        disabled={cartesiaCatalogLoading}
                        onChange={(event) => {
                          const selected = cartesiaVoices.find(
                            (voice) => voice.id === event.target.value,
                          );
                          setDraft({
                            ...draft,
                            cartesiaVoiceId: selected?.id,
                            cartesiaVoiceName: selected?.name,
                          });
                        }}
                      >
                        <option value="">
                          {cartesiaCatalogLoading
                            ? 'Loading casting library…'
                            : 'Uncast · use OpenAI'}
                        </option>
                        {filteredCartesiaVoices.map((voice) => (
                          <option key={voice.id} value={voice.id}>
                            {voice.name}
                            {voice.gender ? ` · ${voice.gender.replace('_', ' ')}` : ''}
                            {voice.country ? ` · ${voice.country}` : ''}
                          </option>
                        ))}
                      </select>
                      <small>
                        {cartesiaCatalogError ||
                          (draft.cartesiaVoiceName
                            ? `${draft.cartesiaVoiceName} is cast for ${companion.name}.`
                            : `${companion.name} will keep using their saved OpenAI voice until cast.`)}
                      </small>
                    </label>
                    <label className="ai-cartesia-speed">
                      <span>
                        Cartesia speed
                        <strong>{(draft.cartesiaSpeed ?? 1).toFixed(2)}x</strong>
                      </span>
                      <input
                        type="range"
                        min="0.75"
                        max="1.65"
                        step="0.05"
                        value={draft.cartesiaSpeed ?? 1}
                        onChange={(event) =>
                          setDraft({ ...draft, cartesiaSpeed: Number(event.target.value) })
                        }
                      />
                      <small>
                        This changes Cartesia only. The OpenAI fallback pace stays saved.
                      </small>
                    </label>
                  </div>
                ) : (
                  <div className="ai-voice-forge__selectors">
                    <label>
                      OpenAI voice
                      <select
                        value={draft.voice}
                        onChange={(event) =>
                          setDraft({
                            ...draft,
                            voice: event.target.value as AiVoiceProfile['voice'],
                          })
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
                        Clearly audible but natural. Canon stays neutral because appearance never
                        determines how someone sounds.
                      </small>
                    </label>
                    <label>
                      Delivery style
                      <select
                        value={draft.delivery}
                        onChange={(event) =>
                          setDraft({
                            ...draft,
                            delivery: event.target.value as AiVoiceProfile['delivery'],
                          })
                        }
                      >
                        {AI_DELIVERY_OPTIONS.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.label} · {option.character}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Cadence
                      <select
                        value={draft.cadence}
                        onChange={(event) =>
                          setDraft({
                            ...draft,
                            cadence: event.target.value as AiVoiceProfile['cadence'],
                          })
                        }
                      >
                        {AI_CADENCE_OPTIONS.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.label} · {option.character}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Vocal texture
                      <select
                        value={draft.texture}
                        onChange={(event) =>
                          setDraft({
                            ...draft,
                            texture: event.target.value as AiVoiceProfile['texture'],
                          })
                        }
                      >
                        {AI_TEXTURE_OPTIONS.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.label} · {option.character}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Vocal register
                      <select
                        value={draft.register}
                        onChange={(event) =>
                          setDraft({
                            ...draft,
                            register: event.target.value as AiVoiceProfile['register'],
                          })
                        }
                      >
                        {AI_REGISTER_OPTIONS.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.label} · {option.character}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Resonance
                      <select
                        value={draft.resonance}
                        onChange={(event) =>
                          setDraft({
                            ...draft,
                            resonance: event.target.value as AiVoiceProfile['resonance'],
                          })
                        }
                      >
                        {AI_RESONANCE_OPTIONS.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.label} · {option.character}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Canon performance
                      <select
                        value={draft.performanceTake}
                        onChange={(event) =>
                          setDraft({
                            ...draft,
                            performanceTake: event.target
                              .value as AiVoiceProfile['performanceTake'],
                          })
                        }
                      >
                        {AI_PERFORMANCE_TAKE_OPTIONS.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.label} · {option.character}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                )}

                {selectedProvider === 'openai' ? (
                  <>
                    <div className="ai-voice-forge__performance-readout">
                      <span>
                        <Sparkles size={13} /> Natural-conversation engine
                      </span>
                      <strong>
                        {AI_DELIVERY_OPTIONS.find((option) => option.id === draft.delivery)?.label}{' '}
                        · {AI_CADENCE_OPTIONS.find((option) => option.id === draft.cadence)?.label}{' '}
                        ·{' '}
                        {AI_REGISTER_OPTIONS.find((option) => option.id === draft.register)?.label}{' '}
                        · ~{Math.round(155 * draft.pace)} WPM
                      </strong>
                      <small>
                        The performance now reacts to celebration, support, accountability,
                        instruction, and strategy scenes while preserving this Soulprint.
                      </small>
                    </div>

                    <div className="ai-voice-forge__sliders">
                      {performanceSliders.map(({ label, key, min, max, step, value }) => (
                        <label key={key}>
                          <span>
                            {label} <strong>{value(draft)}</strong>
                          </span>
                          <input
                            type="range"
                            min={min}
                            max={max}
                            step={step}
                            value={draft[key]}
                            onChange={(event) =>
                              setDraft({ ...draft, [key]: Number(event.target.value) })
                            }
                          />
                        </label>
                      ))}
                    </div>

                    <blockquote>“{canon.audition}”</blockquote>
                    <div className="ai-voice-forge__casting" aria-label="Compare performance takes">
                      <span>
                        <small>CASTING ROOM</small>
                        <strong>Hear the same line two ways</strong>
                      </span>
                      <button
                        className="button button--secondary"
                        type="button"
                        disabled={!settings.aiVoiceOutputEnabled || Boolean(voiceBusyMessageId)}
                        onClick={() => onPreview(draft, 'grounded')}
                      >
                        <Headphones size={15} /> Take A · Grounded
                      </button>
                      <button
                        className="button button--secondary"
                        type="button"
                        disabled={!settings.aiVoiceOutputEnabled || Boolean(voiceBusyMessageId)}
                        onClick={() => onPreview(draft, 'dynamic')}
                      >
                        <Sparkles size={15} /> Take B · Dynamic
                      </button>
                    </div>
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
                        Preview saved take
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
                  </>
                ) : (
                  <>
                    <div className="ai-voice-forge__performance-readout ai-voice-forge__performance-readout--cartesia">
                      <span>
                        <Sparkles size={13} /> Cartesia casting
                      </span>
                      <strong>
                        {draft.cartesiaVoiceName ?? 'No voice selected'} ·{' '}
                        {(draft.cartesiaSpeed ?? 1).toFixed(2)}x
                      </strong>
                      <small>
                        Cartesia supplies the vocal identity. Your complete OpenAI Soulprint remains
                        saved separately and is used automatically whenever fallback is needed.
                      </small>
                    </div>
                    <blockquote>“{canon.audition}”</blockquote>
                    <div className="ai-voice-forge__actions">
                      <button
                        className="button button--secondary"
                        type="button"
                        disabled={
                          !draft.cartesiaVoiceId ||
                          !settings.aiVoiceOutputEnabled ||
                          Boolean(voiceBusyMessageId)
                        }
                        onClick={() => onPreview(draft)}
                      >
                        {voiceBusyMessageId?.startsWith('preview:') ? (
                          <LoaderCircle className="is-spinning" size={16} />
                        ) : (
                          <Headphones size={16} />
                        )}
                        Preview Cartesia voice
                      </button>
                      <button
                        className="button button--primary"
                        type="button"
                        disabled={saving || !draft.cartesiaVoiceId}
                        onClick={save}
                      >
                        {saving ? (
                          <LoaderCircle className="is-spinning" size={16} />
                        ) : (
                          <Save size={16} />
                        )}
                        Save Cartesia casting
                      </button>
                    </div>
                  </>
                )}
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
