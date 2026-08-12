import {
  ArrowUpRight,
  Check,
  LoaderCircle,
  MessageSquareText,
  Mic,
  Send,
  ShieldCheck,
  Square,
  Users,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { COMPANIONS, getCompanion, getCompanionImage } from '@/config/companions';
import {
  createCompanionMessage,
  createHunterMessage,
  getContinuingAiConversation,
  saveAiConversation,
  saveAiMemoryCandidates,
} from '@/game/aiHeadquarters';
import { buildAiProgressContext } from '@/game/aiContext';
import { saveCustomKitchenRecipe } from '@/game/kitchenGrimoire';
import {
  buildQuickLinkActionCatalog,
  commandSuccessAcknowledgement,
  navigationAcknowledgement,
  parseQuickLinkAddress,
  parseQuickNavigationCommand,
  type QuickLinkAction,
} from '@/game/aiQuickLink';
import { useAiVoiceLink } from '@/hooks/useAiVoiceLink';
import { Link } from '@/router';
import {
  getAiLinkStatus,
  requestAiHeadquartersReply,
  type AiHeadquartersReply,
  type AiLinkStatus,
} from '@/services/aiHeadquarters';
import { useGameStore } from '@/store/useGameStore';
import type { AiConversation, AiConversationMessage, CompanionId } from '@/types/game';

interface PendingQuickLinkAction {
  action: QuickLinkAction;
  proposal: NonNullable<AiHeadquartersReply['commandProposal']>;
}

export function CompanionQuickLink() {
  const {
    profile,
    settings,
    progression,
    missions,
    todayRecords,
    stats,
    challenges,
    systemDate,
    refresh,
    complete,
    updateStatus,
    undo,
  } = useGameStore();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<AiLinkStatus>();
  const [deviceOnline, setDeviceOnline] = useState(navigator.onLine);
  const [notice, setNotice] = useState('Say a companion’s name, then speak naturally.');
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [replies, setReplies] = useState<AiConversationMessage[]>([]);
  const [pendingAction, setPendingAction] = useState<PendingQuickLinkAction>();
  const [pendingRecipe, setPendingRecipe] =
    useState<NonNullable<AiHeadquartersReply['recipeProposal']>>();
  const [executingAction, setExecutingAction] = useState(false);
  const [continuityTurns, setContinuityTurns] = useState(0);
  const [activeCompanionId, setActiveCompanionId] = useState<CompanionId>('snow');
  const submitRef = useRef<(text: string) => Promise<void>>(async () => undefined);
  const conversationRef = useRef<AiConversation>();
  const enabledCompanions = useMemo(() => {
    const enabled = new Set(settings?.enabledCompanionIds ?? []);
    return COMPANIONS.filter((companion) => enabled.has(companion.id));
  }, [settings?.enabledCompanionIds]);
  const actionCatalog = useMemo(
    () => buildQuickLinkActionCatalog(missions, todayRecords),
    [missions, todayRecords],
  );
  const voiceLink = useAiVoiceLink({
    settings,
    refresh,
    autoSubmitTranscript: true,
    onTranscript: (text) => submitRef.current(text),
    onNotice: setNotice,
  });

  useEffect(() => {
    void getAiLinkStatus().then(setStatus);
    const online = () => setDeviceOnline(true);
    const offline = () => setDeviceOnline(false);
    window.addEventListener('online', online);
    window.addEventListener('offline', offline);
    return () => {
      window.removeEventListener('online', online);
      window.removeEventListener('offline', offline);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const previousRootOverflow = root.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    root.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      root.style.overflow = previousRootOverflow;
      document.body.style.overflow = previousBodyOverflow;
    };
  }, [open]);

  const transmit = useCallback(
    async (raw: string) => {
      const text = raw.trim();
      if (
        !text ||
        sending ||
        !profile ||
        !settings ||
        !progression ||
        !deviceOnline ||
        settings.aiLinkMode !== 'online' ||
        !settings.aiDataSharingAcknowledged
      ) {
        if (text && !sending) {
          setNotice(
            !deviceOnline
              ? 'Quick Link needs a connection for speech and intelligence. The rest of your campaign remains available offline.'
              : 'Activate the Secure AI Link in Headquarters before opening a voice command.',
          );
        }
        return;
      }

      const addressed = parseQuickLinkAddress(text);
      const addressedCompanion = addressed.audience === 'party' ? 'snow' : addressed.audience;
      if (
        addressed.audience !== 'party' &&
        !settings.enabledCompanionIds.includes(addressed.audience)
      ) {
        setNotice(`${getCompanion(addressed.audience).name}'s link is disabled in Settings.`);
        return;
      }
      setActiveCompanionId(addressedCompanion);
      setTranscript(text);
      setDraft('');
      setReplies([]);
      setPendingAction(undefined);
      setPendingRecipe(undefined);
      setSending(true);
      setNotice(
        addressed.audience === 'party'
          ? 'Party channel open. The council is thinking…'
          : `${getCompanion(addressed.audience).name} is thinking…`,
      );

      const conversation =
        conversationRef.current?.audience === addressed.audience
          ? conversationRef.current
          : await getContinuingAiConversation(addressed.audience);
      conversationRef.current = conversation;
      setContinuityTurns(conversation.messages.length);
      const hunterMessage = createHunterMessage(addressed.message || text);
      const pendingConversation = {
        ...conversation,
        messages: [...conversation.messages, hunterMessage],
        updatedAt: hunterMessage.createdAt,
      };
      await saveAiConversation(pendingConversation);
      conversationRef.current = pendingConversation;

      try {
        const navigation = parseQuickNavigationCommand(addressed.message);
        if (navigation) {
          const companionMessage = createCompanionMessage(
            addressedCompanion,
            navigationAcknowledgement(addressedCompanion, navigation.label),
          );
          const completedConversation = {
            ...pendingConversation,
            title: `Quick Route · ${navigation.label}`,
            messages: [...pendingConversation.messages, companionMessage],
            updatedAt: companionMessage.createdAt,
          };
          await saveAiConversation(completedConversation);
          conversationRef.current = completedConversation;
          setReplies([companionMessage]);
          setNotice(`Opening ${navigation.label} — no text intelligence call was needed.`);
          window.dispatchEvent(
            new CustomEvent('system:ai-conversations-changed', {
              detail: { id: conversation.id },
            }),
          );
          if (settings.aiVoiceOutputEnabled) await voiceLink.playMessages([companionMessage]);
          window.location.hash = navigation.route;
          setOpen(false);
          return;
        }

        const result = await requestAiHeadquartersReply({
          audience: addressed.audience,
          message: addressed.message || text,
          history: conversation.messages,
          context: await buildAiProgressContext({
            audience: addressed.audience,
            profile,
            settings,
            progression,
            missions,
            todayRecords,
            stats,
            challenges,
            systemDate,
            enabledCompanionIds: enabledCompanions.map((companion) => companion.id),
          }),
          commandMode: 'propose',
        });
        await voiceLink.trackTextUsage(result);
        if (settings.aiRelationshipMemoryEnabled) {
          await saveAiMemoryCandidates(
            result.memoryCandidates,
            addressed.audience,
            conversation.id,
          );
        }
        const replyTime = new Date().toISOString();
        const responseMessages = result.replies.map((reply) =>
          createCompanionMessage(reply.companionId, reply.message, replyTime),
        );
        const completedConversation = {
          ...pendingConversation,
          title: result.title,
          messages: [...pendingConversation.messages, ...responseMessages],
          updatedAt: replyTime,
        };
        await saveAiConversation(completedConversation);
        conversationRef.current = completedConversation;
        setReplies(responseMessages);
        const proposedAction = result.commandProposal
          ? actionCatalog.find((action) => action.actionId === result.commandProposal?.actionId)
          : undefined;
        if (result.commandProposal && proposedAction) {
          setPendingAction({ action: proposedAction, proposal: result.commandProposal });
          setActiveCompanionId(result.commandProposal.companionId);
        }
        if (result.recipeProposal) {
          setPendingRecipe(result.recipeProposal);
          setActiveCompanionId('saffron');
        }
        setNotice(
          proposedAction || result.recipeProposal
            ? 'Command prepared. Nothing changes until you confirm it below.'
            : result.route === 'sovereign'
              ? `${result.model} · Sovereign counsel route`
              : result.route === 'counsel'
                ? `${result.model} · deeper counsel route`
                : `${result.model} · quick response route`,
        );
        window.dispatchEvent(
          new CustomEvent('system:ai-conversations-changed', {
            detail: { id: conversation.id },
          }),
        );
        if (settings.aiVoiceOutputEnabled) void voiceLink.playMessages(responseMessages);
      } catch (error) {
        setNotice(error instanceof Error ? error.message : 'Quick Link could not respond.');
      } finally {
        setSending(false);
      }
    },
    [
      challenges,
      actionCatalog,
      deviceOnline,
      enabledCompanions,
      missions,
      profile,
      progression,
      sending,
      settings,
      stats,
      systemDate,
      todayRecords,
      voiceLink,
    ],
  );
  submitRef.current = transmit;

  async function appendLocalAcknowledgement(companionId: CompanionId, message: string) {
    const companionMessage = createCompanionMessage(companionId, message);
    const conversation = conversationRef.current;
    if (conversation) {
      const updatedConversation = {
        ...conversation,
        messages: [...conversation.messages, companionMessage],
        updatedAt: companionMessage.createdAt,
      };
      await saveAiConversation(updatedConversation);
      conversationRef.current = updatedConversation;
      window.dispatchEvent(
        new CustomEvent('system:ai-conversations-changed', {
          detail: { id: updatedConversation.id },
        }),
      );
    }
    setReplies((current) => [...current, companionMessage]);
    if (settings?.aiVoiceOutputEnabled) void voiceLink.playMessages([companionMessage]);
  }

  async function executePendingAction() {
    if (!pendingAction || executingAction) return;
    setExecutingAction(true);
    try {
      if (pendingAction.action.kind === 'complete_mission') {
        await complete(pendingAction.action.missionId);
      } else if (pendingAction.action.kind === 'skip_mission') {
        await updateStatus(pendingAction.action.missionId, 'skipped');
      } else if (pendingAction.action.kind === 'fail_mission') {
        await updateStatus(pendingAction.action.missionId, 'failed');
      } else if (pendingAction.action.kind === 'reopen_mission') {
        await undo(pendingAction.action.missionId);
      } else {
        await updateStatus(pendingAction.action.missionId, 'pending');
      }
      await appendLocalAcknowledgement(
        pendingAction.proposal.companionId,
        commandSuccessAcknowledgement(pendingAction.proposal.companionId, pendingAction.action),
      );
      setPendingAction(undefined);
      setNotice('Command confirmed · local campaign synchronized.');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'The command could not be completed.');
    } finally {
      setExecutingAction(false);
    }
  }

  async function savePendingRecipe() {
    if (!pendingRecipe || executingAction) return;
    setExecutingAction(true);
    try {
      const recipe = {
        name: pendingRecipe.name,
        codename: pendingRecipe.codename,
        servings: pendingRecipe.servings,
        prepMinutes: pendingRecipe.prepMinutes,
        cookMinutes: pendingRecipe.cookMinutes,
        costTier: pendingRecipe.costTier,
        equipment: pendingRecipe.equipment,
        plate: pendingRecipe.plate,
        ingredients: pendingRecipe.ingredients,
        steps: pendingRecipe.steps,
        swaps: pendingRecipe.swaps,
        storage: pendingRecipe.storage,
        safety: pendingRecipe.safety,
      };
      await saveCustomKitchenRecipe(recipe);
      await appendLocalAcknowledgement(
        'saffron',
        `${recipe.name} is in my Private Grimoire now. Your recipe, your device, and nobody touched it before you confirmed.`,
      );
      setPendingRecipe(undefined);
      setNotice('Recipe confirmed · Saffron’s Private Grimoire updated.');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'That recipe could not be saved.');
    } finally {
      setExecutingAction(false);
    }
  }

  async function beginListening() {
    if (
      !deviceOnline ||
      settings?.aiLinkMode !== 'online' ||
      !settings.aiDataSharingAcknowledged ||
      status?.configured === false
    ) {
      setNotice(
        !deviceOnline
          ? 'Quick Link is offline. Your local campaign is still fully available.'
          : 'Activate the Secure AI Link in Headquarters before using the microphone.',
      );
      return;
    }
    if (!status) void getAiLinkStatus().then(setStatus);
    setNotice('Listening now. Tap the square when you finish speaking.');
    await voiceLink.startRecording();
  }

  async function openAndListen() {
    if (voiceLink.recording) {
      voiceLink.stopRecording();
      return;
    }
    if (sending || voiceLink.transcribing) return;
    voiceLink.stopPlayback();
    setOpen(true);
    setReplies([]);
    setPendingAction(undefined);
    setPendingRecipe(undefined);
    setTranscript('');
    await beginListening();
  }

  function close() {
    if (voiceLink.recording) voiceLink.stopRecording();
    voiceLink.stopPlayback();
    setOpen(false);
  }

  const activeCompanion = getCompanion(activeCompanionId);
  const busy = sending || voiceLink.transcribing || executingAction;
  const ready =
    deviceOnline &&
    settings?.aiLinkMode === 'online' &&
    settings.aiDataSharingAcknowledged &&
    status?.configured;

  return (
    <>
      <button
        type="button"
        className={`header-ai-link header-quick-link ${voiceLink.recording ? 'is-listening' : ''}`}
        aria-label={voiceLink.recording ? 'Stop listening' : 'Open Companion Quick Link and listen'}
        onClick={openAndListen}
      >
        {voiceLink.recording ? <Square size={13} /> : <Mic size={15} />}
        <span>{voiceLink.recording ? 'LISTENING' : 'QUICK LINK'}</span>
        <i aria-hidden="true" />
      </button>

      {open &&
        createPortal(
          <div
            className="quick-link"
            role="dialog"
            aria-modal="true"
            aria-labelledby="quick-link-title"
          >
            <button
              className="quick-link__backdrop"
              type="button"
              onClick={close}
              aria-label="Close"
            />
            <section className="quick-link__panel">
              <header>
                <div className="quick-link__identity">
                  <img src={getCompanionImage(activeCompanion.image)} alt="" />
                  <span>
                    <small>COMPANION QUICK LINK</small>
                    <strong id="quick-link-title">
                      {replies.length > 1 ? 'Party Channel' : activeCompanion.name}
                    </strong>
                  </span>
                </div>
                <button type="button" onClick={close} aria-label="Close Quick Link">
                  <X size={19} />
                </button>
              </header>

              <div className={`quick-link__core ${voiceLink.recording ? 'is-listening' : ''}`}>
                <button
                  type="button"
                  onClick={voiceLink.recording ? voiceLink.stopRecording : beginListening}
                  disabled={busy}
                  aria-label={voiceLink.recording ? 'Stop recording' : 'Start recording'}
                >
                  {busy ? (
                    <LoaderCircle className="is-spinning" size={30} />
                  ) : voiceLink.recording ? (
                    <Square size={27} />
                  ) : (
                    <Mic size={31} />
                  )}
                  <i />
                  <i />
                </button>
                <strong>
                  {voiceLink.recording
                    ? `Listening · ${voiceLink.recordingSeconds.toFixed(1)}s`
                    : voiceLink.transcribing
                      ? 'Understanding your voice…'
                      : sending
                        ? 'Companion link active…'
                        : ready
                          ? 'Tap and speak'
                          : 'Secure link required'}
                </strong>
                <p>Try “Snow, take me to the Training Hall” or “Saffron, what should I cook?”</p>
              </div>

              {transcript && (
                <div className="quick-link__transcript">
                  <span>YOU</span>
                  <p>{transcript}</p>
                </div>
              )}

              {replies.length > 0 && (
                <div className="quick-link__replies" aria-live="polite">
                  {replies.map((message) => {
                    const companion = getCompanion(message.companionId!);
                    return (
                      <article
                        key={message.id}
                        style={{ '--companion-accent': companion.accent } as CSSProperties}
                      >
                        <img src={getCompanionImage(companion.image)} alt="" />
                        <div>
                          <span>{companion.name}</span>
                          <p>{message.message}</p>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}

              {pendingAction && (
                <section className="quick-link__command" aria-live="polite">
                  <header>
                    <span>
                      <ShieldCheck size={15} /> COMMAND DECK
                    </span>
                    <small>CONFIRMATION REQUIRED</small>
                  </header>
                  <strong>{pendingAction.action.label}</strong>
                  <p>{pendingAction.proposal.summary}</p>
                  <dl>
                    <div>
                      <dt>LOCAL IMPACT</dt>
                      <dd>{pendingAction.action.impact}</dd>
                    </div>
                    <div>
                      <dt>COMPANION CHECK</dt>
                      <dd>{pendingAction.proposal.confirmation}</dd>
                    </div>
                  </dl>
                  <div className="quick-link__command-actions">
                    <button
                      type="button"
                      className="button button--primary"
                      disabled={executingAction}
                      onClick={() => void executePendingAction()}
                    >
                      {executingAction ? (
                        <LoaderCircle className="is-spinning" size={15} />
                      ) : (
                        <Check size={15} />
                      )}
                      Confirm command
                    </button>
                    <button
                      type="button"
                      className="button button--ghost"
                      disabled={executingAction}
                      onClick={() => {
                        setPendingAction(undefined);
                        setNotice('Command dismissed. No campaign data changed.');
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </section>
              )}

              {pendingRecipe && (
                <section
                  className="quick-link__command quick-link__recipe-command"
                  aria-live="polite"
                >
                  <header>
                    <span>
                      <ShieldCheck size={15} /> SAFFRON'S PRIVATE GRIMOIRE
                    </span>
                    <small>PREVIEW BEFORE SAVE</small>
                  </header>
                  <strong>{pendingRecipe.name}</strong>
                  <p>{pendingRecipe.codename}</p>
                  <div className="quick-link__recipe-meta">
                    <span>{pendingRecipe.prepMinutes + pendingRecipe.cookMinutes} min</span>
                    <span>{pendingRecipe.servings} servings</span>
                    <span>{pendingRecipe.costTier}</span>
                  </div>
                  <details>
                    <summary>Review ingredients and steps</summary>
                    <h4>Ingredients</h4>
                    <ul>
                      {pendingRecipe.ingredients.map((ingredient) => (
                        <li key={ingredient}>{ingredient}</li>
                      ))}
                    </ul>
                    <h4>Method</h4>
                    <ol>
                      {pendingRecipe.steps.map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ol>
                    <p>
                      <strong>Safety:</strong> {pendingRecipe.safety}
                    </p>
                    <p>
                      <strong>Storage:</strong> {pendingRecipe.storage}
                    </p>
                  </details>
                  <p className="quick-link__recipe-confirmation">{pendingRecipe.confirmation}</p>
                  <div className="quick-link__command-actions">
                    <button
                      type="button"
                      className="button button--primary"
                      disabled={executingAction}
                      onClick={() => void savePendingRecipe()}
                    >
                      {executingAction ? (
                        <LoaderCircle className="is-spinning" size={15} />
                      ) : (
                        <Check size={15} />
                      )}
                      Save recipe
                    </button>
                    <button
                      type="button"
                      className="button button--ghost"
                      disabled={executingAction}
                      onClick={() => {
                        setPendingRecipe(undefined);
                        setNotice('Recipe dismissed. Saffron changed nothing on this device.');
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </section>
              )}

              <p className="quick-link__notice">{notice}</p>

              <form
                className="quick-link__fallback"
                onSubmit={(event) => {
                  event.preventDefault();
                  void transmit(draft);
                }}
              >
                <MessageSquareText size={16} aria-hidden="true" />
                <input
                  value={draft}
                  maxLength={4_000}
                  placeholder="Or type a quick transmission…"
                  onChange={(event) => setDraft(event.target.value)}
                />
                <button type="submit" disabled={!draft.trim() || busy} aria-label="Send">
                  <Send size={16} />
                </button>
              </form>

              <footer>
                <span>
                  <Users size={14} />{' '}
                  {continuityTurns
                    ? `${continuityTurns} recent messages linked`
                    : 'Say “Everyone” for Party Council'}
                </span>
                <Link to="/headquarters?focus=ai" onClick={close}>
                  Full Headquarters <ArrowUpRight size={14} />
                </Link>
              </footer>
            </section>
          </div>,
          document.body,
        )}
    </>
  );
}
