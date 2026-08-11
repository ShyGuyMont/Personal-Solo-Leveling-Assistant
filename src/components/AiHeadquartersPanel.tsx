import {
  BookmarkCheck,
  BrainCircuit,
  Check,
  ChevronDown,
  LoaderCircle,
  LockKeyhole,
  MessageCircleMore,
  Plus,
  Radio,
  Send,
  ShieldCheck,
  Sparkles,
  Trash2,
  Users,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { COMPANIONS, getCompanion, getCompanionImage } from '@/config/companions';
import { db } from '@/db/database';
import {
  approveAiRelationshipMemory,
  createAiConversation,
  createCompanionMessage,
  createHunterMessage,
  forgetAiRelationshipMemory,
  getAiRelationshipMemories,
  getRecentAiConversations,
  saveAiMemoryCandidates,
  saveAiConversation,
} from '@/game/aiHeadquarters';
import {
  getAiLinkStatus,
  requestAiHeadquartersReply,
  type AiLinkStatus,
  type AiProgressContext,
} from '@/services/aiHeadquarters';
import { useGameStore } from '@/store/useGameStore';
import { formatClassName } from '@/utils/format';
import { scrollChatViewportToBottom } from '@/utils/scroll';
import type { AiConversation, AiConversationAudience, AiRelationshipMemory } from '@/types/game';

export function AiHeadquartersPanel() {
  const { profile, settings, progression, missions, todayRecords, stats, systemDate, refresh } =
    useGameStore();
  const [conversations, setConversations] = useState<AiConversation[]>([]);
  const [activeId, setActiveId] = useState<string>();
  const [draft, setDraft] = useState('');
  const [status, setStatus] = useState<AiLinkStatus>();
  const [statusLoading, setStatusLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState('');
  const [memoryLedger, setMemoryLedger] = useState<AiRelationshipMemory[]>([]);
  const [memoryOpen, setMemoryOpen] = useState(false);
  const [deviceOnline, setDeviceOnline] = useState(navigator.onLine);
  const messageListRef = useRef<HTMLDivElement>(null);

  const activeConversation = conversations.find((item) => item.id === activeId);
  const enabledCompanions = useMemo(() => {
    const enabled = new Set(settings?.enabledCompanionIds ?? []);
    return COMPANIONS.filter((companion) => enabled.has(companion.id));
  }, [settings?.enabledCompanionIds]);

  const refreshStatus = useCallback(async () => {
    setStatusLoading(true);
    setStatus(await getAiLinkStatus());
    setStatusLoading(false);
  }, []);

  const refreshMemoryLedger = useCallback(async () => {
    setMemoryLedger(await getAiRelationshipMemories());
  }, []);

  useEffect(() => {
    let active = true;
    void getRecentAiConversations().then(async (items) => {
      if (!active) return;
      if (items.length) {
        setConversations(items);
        setActiveId(items[0].id);
        return;
      }
      const first = createAiConversation();
      await saveAiConversation(first);
      if (!active) return;
      setConversations([first]);
      setActiveId(first.id);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    void refreshStatus();
  }, [refreshStatus]);

  useEffect(() => {
    void refreshMemoryLedger();
  }, [refreshMemoryLedger]);

  useEffect(() => {
    const update = () => setDeviceOnline(navigator.onLine);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  useEffect(() => {
    const viewport = messageListRef.current;
    if (!viewport) return;

    const frame = window.requestAnimationFrame(() => {
      scrollChatViewportToBottom(viewport, settings?.reducedMotion);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [activeConversation?.id, activeConversation?.messages.length, settings?.reducedMotion]);

  if (!profile || !settings || !progression || !activeConversation) return null;

  const currentProfile = profile;
  const currentProgression = progression;
  const currentConversation = activeConversation;
  const currentSettings = settings;

  const onlineMode = settings.aiLinkMode === 'online' && settings.aiDataSharingAcknowledged;
  const activeCompanion =
    activeConversation.audience === 'party' ? undefined : getCompanion(activeConversation.audience);
  const audienceAvailable =
    activeConversation.audience === 'party'
      ? enabledCompanions.length > 0
      : enabledCompanions.some((companion) => companion.id === activeConversation.audience);
  const linkReady = onlineMode && deviceOnline && status?.configured && audienceAvailable;

  async function updateConversation(conversation: AiConversation) {
    await saveAiConversation(conversation);
    setConversations((current) => {
      const remaining = current.filter((item) => item.id !== conversation.id);
      return [conversation, ...remaining].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    });
    setActiveId(conversation.id);
  }

  async function activateOnlineLink() {
    try {
      await db.settings.update('primary', {
        aiLinkMode: 'online',
        aiDataSharingAcknowledged: true,
      });
      await refresh();
      await refreshStatus();
      setNotice('Online mode activated. No transmission is sent until you press Send.');
    } catch (error) {
      setNotice(
        error instanceof Error
          ? `Online mode could not be activated: ${error.message}`
          : 'Online mode could not be activated on this device.',
      );
    }
  }

  async function returnOffline() {
    await db.settings.update('primary', { aiLinkMode: 'offline' });
    await refresh();
    setNotice('Offline mode restored. Saved conversations remain available on this device.');
  }

  async function setBondMemoryEnabled(enabled: boolean) {
    await db.settings.update('primary', { aiRelationshipMemoryEnabled: enabled });
    await refresh();
    setMemoryOpen(true);
    setNotice(
      enabled
        ? 'Bond Memory enabled. Only memories you approve can cross into a future conversation.'
        : 'Bond Memory paused. The local ledger is intact, but no approved memory will be sent.',
    );
  }

  async function approveMemory(id: string) {
    await approveAiRelationshipMemory(id);
    await refreshMemoryLedger();
    setNotice('Bond approved. It can now guide a relevant future conversation.');
  }

  async function forgetMemory(id: string) {
    await forgetAiRelationshipMemory(id);
    await refreshMemoryLedger();
    setNotice('Bond Memory forgotten from this device.');
  }

  async function startConversation(audience: AiConversationAudience = 'party') {
    const conversation = createAiConversation(audience);
    await updateConversation(conversation);
    setDraft('');
    setNotice('');
  }

  async function selectAudience(audience: AiConversationAudience) {
    if (currentConversation.messages.length) {
      await startConversation(audience);
      return;
    }
    const now = new Date().toISOString();
    await updateConversation({
      ...currentConversation,
      audience,
      title:
        audience === 'party' ? 'New Party Council' : `Direct Link · ${getCompanion(audience).name}`,
      updatedAt: now,
    });
  }

  function buildProgressContext(): AiProgressContext {
    const available = missions.filter((mission) => mission.enabled && !mission.archived);
    const completed = new Set(
      todayRecords
        .filter((record) => record.status === 'completed')
        .map((record) => record.missionId),
    );
    const approvedMemories = memoryLedger
      .filter(
        (memory) =>
          memory.status === 'approved' &&
          (currentConversation.audience === 'party' ||
            memory.scope === 'party' ||
            memory.scope === currentConversation.audience),
      )
      .slice(0, 12);
    return {
      hunter: {
        firstName: currentProfile.displayName.trim().split(/\s+/)[0] || 'Hunter',
        systemTitle: currentProfile.systemTitle,
        level: currentProgression.level,
        class: currentProgression.rank,
        startingFocus: currentProfile.startingFocus,
      },
      today: {
        date: systemDate,
        completedMissions: available.filter((mission) => completed.has(mission.id)).length,
        availableMissions: available.length,
        pendingMissionNames: available
          .filter((mission) => !completed.has(mission.id))
          .slice(0, 12)
          .map((mission) => mission.name),
      },
      momentum: stats.map((stat) => ({
        stat: stat.name,
        level: stat.level,
        trend: stat.trend,
        neglectedDays: stat.neglectedDays,
      })),
      party: {
        enabledCompanionIds: enabledCompanions.map((companion) => companion.id),
      },
      state: {
        recoveryActive: currentSettings.recoveryMode.active,
      },
      bondMemory: {
        enabled: currentSettings.aiRelationshipMemoryEnabled,
        approved: currentSettings.aiRelationshipMemoryEnabled
          ? approvedMemories.map((memory) => ({
              fact: memory.fact,
              category: memory.category,
              scope: memory.scope,
            }))
          : [],
      },
    };
  }

  async function sendMessage() {
    const message = draft.trim();
    if (!message || sending || !linkReady) return;
    setSending(true);
    setNotice('');
    setDraft('');
    const hunterMessage = createHunterMessage(message);
    const pendingConversation: AiConversation = {
      ...currentConversation,
      updatedAt: hunterMessage.createdAt,
      messages: [...currentConversation.messages, hunterMessage],
    };
    await updateConversation(pendingConversation);

    try {
      const result = await requestAiHeadquartersReply({
        audience: currentConversation.audience,
        message,
        history: currentConversation.messages,
        context: buildProgressContext(),
      });
      const memoryAdditions = currentSettings.aiRelationshipMemoryEnabled
        ? await saveAiMemoryCandidates(
            result.memoryCandidates,
            currentConversation.audience,
            currentConversation.id,
          )
        : [];
      const replyTime = new Date().toISOString();
      const completedConversation: AiConversation = {
        ...pendingConversation,
        title: result.title,
        updatedAt: replyTime,
        messages: [
          ...pendingConversation.messages,
          ...result.replies.map((reply) =>
            createCompanionMessage(reply.companionId, reply.message, replyTime),
          ),
        ],
      };
      await updateConversation(completedConversation);
      if (memoryAdditions.length) {
        await refreshMemoryLedger();
        setMemoryOpen(true);
        setNotice(
          `${memoryAdditions.length} new Bond Memory suggestion${memoryAdditions.length === 1 ? '' : 's'} awaiting your approval.`,
        );
      }
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'The online link could not respond.');
    } finally {
      setSending(false);
    }
  }

  const readiness = !deviceOnline
    ? { label: 'DEVICE OFFLINE', className: 'is-offline', icon: WifiOff }
    : !onlineMode
      ? { label: 'OFFLINE MODE', className: 'is-offline', icon: LockKeyhole }
      : statusLoading
        ? { label: 'CHECKING LINK', className: 'is-checking', icon: LoaderCircle }
        : status?.configured
          ? { label: 'AI LINK READY', className: 'is-ready', icon: Wifi }
          : { label: 'SETUP PENDING', className: 'is-pending', icon: Radio };
  const ReadinessIcon = readiness.icon;

  return (
    <section className="ai-headquarters panel" aria-labelledby="ai-headquarters-title">
      <header className="ai-headquarters__header">
        <div className="ai-headquarters__sigil" aria-hidden="true">
          <BrainCircuit size={30} />
          <i />
          <i />
        </div>
        <div>
          <p className="eyebrow">AWAKENED LINK · SOULPRINT II</p>
          <h2 id="ai-headquarters-title">Ten distinct lives. One party that remembers.</h2>
          <p>
            Call one companion or open the full council. Their sharper identities, history with one
            another, and optional Hunter-approved Bond Memory create continuity without surrendering
            control of your private campaign.
          </p>
        </div>
        <span className={`ai-headquarters__readiness ${readiness.className}`}>
          <ReadinessIcon className={statusLoading && onlineMode ? 'is-spinning' : ''} size={15} />
          {readiness.label}
        </span>
      </header>

      {!onlineMode ? (
        <div className="ai-consent">
          <div>
            <ShieldCheck size={24} />
            <span>
              <strong>Online mode is opt-in.</strong>
              <small>
                When you press Send, only your first name, message, up to 16 recent chat messages,
                and a compact Class, level, focus, recovery, mission, and stat signal go to OpenAI.
                Notes, journals, Treasury amounts, and your save file stay local. Bond Memory
                remains off until you enable it, and only memories you approve may be included
                later.
              </small>
            </span>
          </div>
          <button className="button button--primary" type="button" onClick={activateOnlineLink}>
            <Sparkles size={17} /> Activate Secure AI Link
          </button>
        </div>
      ) : (
        <div className="ai-headquarters__modebar">
          <span>
            <LockKeyhole size={14} /> API key protected behind the private gateway
          </span>
          <button className="text-link" type="button" onClick={returnOffline}>
            Return to offline mode
          </button>
        </div>
      )}

      {(onlineMode || memoryLedger.length > 0) && (
        <section
          className={`ai-bond-memory ${currentSettings.aiRelationshipMemoryEnabled ? 'is-enabled' : ''}`}
        >
          <div className="ai-bond-memory__header">
            <button
              type="button"
              className="ai-bond-memory__summary"
              onClick={() => setMemoryOpen((open) => !open)}
              aria-expanded={memoryOpen}
            >
              <span>
                <BookmarkCheck size={18} />
              </span>
              <span>
                <strong>Bond Memory</strong>
                <small>
                  {currentSettings.aiRelationshipMemoryEnabled
                    ? `${memoryLedger.filter((memory) => memory.status === 'approved').length} approved · ${memoryLedger.filter((memory) => memory.status === 'pending').length} awaiting you`
                    : 'Paused · nothing crosses conversations'}
                </small>
              </span>
              <ChevronDown className={memoryOpen ? 'is-open' : ''} size={16} />
            </button>
            <button
              className="text-link"
              type="button"
              onClick={() => setBondMemoryEnabled(!currentSettings.aiRelationshipMemoryEnabled)}
            >
              {currentSettings.aiRelationshipMemoryEnabled ? 'Pause memory' : 'Enable memory'}
            </button>
          </div>

          {memoryOpen && (
            <div className="ai-bond-memory__body">
              <p>
                Headquarters can suggest durable facts from what you explicitly say. Suggestions
                stay local and inactive until you approve them. You can forget any bond at any time.
              </p>
              {!memoryLedger.length ? (
                <div className="ai-bond-memory__empty">
                  <BrainCircuit size={18} />
                  <span>
                    <strong>No bonds recorded yet.</strong>
                    <small>
                      Natural preferences, long-term goals, boundaries, and commitments may appear
                      here after a conversation.
                    </small>
                  </span>
                </div>
              ) : (
                <div className="ai-bond-memory__list">
                  {memoryLedger.map((memory) => (
                    <article
                      key={memory.id}
                      className={memory.status === 'pending' ? 'is-pending' : ''}
                    >
                      <div>
                        <span>
                          {memory.status === 'pending' ? 'AWAITING APPROVAL' : 'APPROVED BOND'} ·{' '}
                          {memory.category} ·{' '}
                          {memory.scope === 'party' ? 'party' : getCompanion(memory.scope).name}
                        </span>
                        <p>{memory.fact}</p>
                      </div>
                      <div>
                        {memory.status === 'pending' && (
                          <button type="button" onClick={() => approveMemory(memory.id)}>
                            <Check size={14} /> Keep
                          </button>
                        )}
                        <button type="button" onClick={() => forgetMemory(memory.id)}>
                          <Trash2 size={14} /> Forget
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      )}

      <div className="ai-headquarters__layout">
        <aside className="ai-conversation-list" aria-label="AI conversation history">
          <button
            className="button button--secondary ai-conversation-list__new"
            type="button"
            onClick={() => startConversation()}
          >
            <Plus size={16} /> New conversation
          </button>
          <div>
            {conversations.slice(0, 10).map((conversation) => {
              const companion =
                conversation.audience === 'party' ? undefined : getCompanion(conversation.audience);
              return (
                <button
                  key={conversation.id}
                  className={conversation.id === activeConversation.id ? 'is-active' : ''}
                  type="button"
                  onClick={() => setActiveId(conversation.id)}
                >
                  {companion ? (
                    <img src={getCompanionImage(companion.image)} alt="" />
                  ) : (
                    <span>
                      <Users size={17} />
                    </span>
                  )}
                  <span>
                    <strong>{conversation.title}</strong>
                    <small>
                      {conversation.audience === 'party' ? 'Full party' : companion?.name} ·{' '}
                      {conversation.messages.length} messages
                    </small>
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        <div className="ai-command-link">
          <div className="ai-audience" aria-label="Choose who answers">
            <button
              className={activeConversation.audience === 'party' ? 'is-active' : ''}
              type="button"
              onClick={() => selectAudience('party')}
            >
              <span>
                <Users size={18} />
              </span>
              <strong>Full Party</strong>
              <small>Council channel</small>
            </button>
            {enabledCompanions.map((companion) => (
              <button
                key={companion.id}
                className={activeConversation.audience === companion.id ? 'is-active' : ''}
                type="button"
                style={{ '--companion-accent': companion.accent } as CSSProperties}
                onClick={() => selectAudience(companion.id)}
              >
                <img src={getCompanionImage(companion.image)} alt="" />
                <strong>{companion.name}</strong>
                <small>{companion.title}</small>
              </button>
            ))}
          </div>

          <div className="ai-message-stage">
            <header>
              <div>
                {activeCompanion ? (
                  <img src={getCompanionImage(activeCompanion.image)} alt="" />
                ) : (
                  <span>
                    <Users size={20} />
                  </span>
                )}
                <div>
                  <strong>{activeCompanion?.name ?? 'Party Council'}</strong>
                  <small>
                    {activeCompanion?.title ?? `${enabledCompanions.length} companion links`} ·
                    Level {progression.level} · {formatClassName(progression.rank)}
                  </small>
                </div>
              </div>
              <span>
                <MessageCircleMore size={14} /> LIVING BOND ACTIVE
              </span>
            </header>

            <div ref={messageListRef} className="ai-message-stage__messages" aria-live="polite">
              {!activeConversation.messages.length && (
                <div className="ai-message-stage__empty">
                  <Sparkles size={25} />
                  <strong>
                    {activeCompanion
                      ? `${activeCompanion.name} is listening.`
                      : 'The council chamber is open.'}
                  </strong>
                  <p>
                    Talk naturally. Ask for perspective, make a plan, celebrate a win, admit where
                    you are stuck, or simply check in.
                  </p>
                </div>
              )}
              {activeConversation.messages.map((message) => {
                const companion = message.companionId
                  ? getCompanion(message.companionId)
                  : undefined;
                return (
                  <article
                    key={message.id}
                    className={`ai-message ${message.role === 'hunter' ? 'is-hunter' : 'is-companion'}`}
                    style={
                      companion
                        ? ({ '--companion-accent': companion.accent } as CSSProperties)
                        : undefined
                    }
                  >
                    {companion && (
                      <img src={getCompanionImage(companion.image)} alt={`${companion.name}`} />
                    )}
                    <div>
                      <span>{companion?.name ?? profile.displayName}</span>
                      <p>{message.message}</p>
                    </div>
                  </article>
                );
              })}
              {sending && (
                <div className="ai-message-stage__thinking">
                  <LoaderCircle className="is-spinning" size={17} /> Headquarters is responding…
                </div>
              )}
            </div>

            {notice && <p className="ai-command-link__notice">{notice}</p>}
            {onlineMode && !statusLoading && !status?.configured && (
              <div className="ai-setup-pending">
                <Radio size={18} />
                <span>
                  <strong>The chamber is built. The OpenAI key is the final connection.</strong>
                  <small>
                    No API usage or charge can occur until that private secret is added.
                  </small>
                </span>
                <button className="text-link" type="button" onClick={refreshStatus}>
                  Check again
                </button>
              </div>
            )}
            {onlineMode && status?.configured && !audienceAvailable && (
              <p className="ai-command-link__notice">
                This channel is muted in Settings. Enable at least one companion link before
                sending.
              </p>
            )}
            <div className="ai-composer">
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value.slice(0, 4_000))}
                placeholder={
                  linkReady
                    ? `Talk to ${activeCompanion?.name ?? 'the party'}…`
                    : 'Activate and connect the online link to send a message.'
                }
                disabled={!linkReady || sending}
                rows={3}
                aria-label="Message Headquarters"
              />
              <div>
                <small>{draft.length.toLocaleString()} / 4,000 · Stored locally</small>
                <button
                  className="button button--primary"
                  type="button"
                  onClick={sendMessage}
                  disabled={!draft.trim() || !linkReady || sending}
                >
                  {sending ? (
                    <LoaderCircle className="is-spinning" size={17} />
                  ) : (
                    <Send size={17} />
                  )}
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
