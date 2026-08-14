import {
  ArrowUpRight,
  BookOpenCheck,
  CalendarCheck2,
  Check,
  Headphones,
  LoaderCircle,
  MessageSquareText,
  Mic,
  Play,
  Radio,
  RadioTower,
  Send,
  ShieldCheck,
  Sparkles,
  Square,
  Users,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { COMPANIONS, getCompanion, getCompanionImage } from '@/config/companions';
import {
  createCompanionMessage,
  createAiConversation,
  createHunterMessage,
  getAiConversation,
  getContinuingAiConversation,
  saveAiConversation,
  saveAiMemoryCandidates,
} from '@/game/aiHeadquarters';
import { hasAiVoiceSummary } from '@/game/aiVoice';
import {
  completeAgentMission,
  createAgentMission,
  reopenAgentMission,
  retireAgentMission,
  updateAgentMission,
} from '@/game/agentMissions';
import { buildAiProgressContext } from '@/game/aiContext';
import {
  clearPendingAiProposal,
  extractAiPendingProposal,
  getPendingAiProposal,
  savePendingAiProposal,
  type AiPendingProposal,
} from '@/game/aiPendingProposals';
import {
  clearPendingAiTransmission,
  getPendingAiTransmission,
  savePendingAiTransmission,
} from '@/game/aiTransmissions';
import { applyCalendarProposal } from '@/game/calendar';
import {
  applyCreatorProjectUpdate,
  saveCreatorCampaign,
  saveCreatorProject,
} from '@/game/creatorForge';
import { saveArcCanonSource } from '@/game/arcArchives';
import {
  addDailyOperationNote,
  cancelStagedCompanionOperation,
  getDailyOperations,
  prepareCompanionOperation,
  stageCompanionOperation,
  synchronizeKitchenOperation,
} from '@/game/dailyOperations';
import { assignSpecificKitchenOrder } from '@/game/kitchen';
import { deleteCustomKitchenRecipe, saveCustomKitchenRecipe } from '@/game/kitchenGrimoire';
import {
  acquireQuickLinkTransmission,
  buildQuickLinkActionCatalog,
  canBeginQuickLinkTransmission,
  commandSuccessAcknowledgement,
  navigationAcknowledgement,
  parseQuickLinkAddress,
  parseQuickNavigationCommand,
  releaseQuickLinkTransmission,
  type QuickLinkAction,
  type QuickLinkTransmissionIntent,
} from '@/game/aiQuickLink';
import { useAiVoiceLink } from '@/hooks/useAiVoiceLink';
import { useAiRealtimeLink } from '@/hooks/useAiRealtimeLink';
import { Link } from '@/router';
import {
  createAiTransmissionId,
  getAiLinkStatus,
  requestAiHeadquartersReply,
  resumeAiHeadquartersReply,
  type AiHeadquartersReply,
  type AiLinkStatus,
} from '@/services/aiHeadquarters';
import { useGameStore } from '@/store/useGameStore';
import { sanitizeSensitiveDisplayText } from '@/utils/privacy';
import type {
  AiConversation,
  AiConversationMessage,
  CompanionId,
  CompanionOperationRequest,
  DailyOperationsRecord,
  LocalDateKey,
} from '@/types/game';

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
  const [linkMode, setLinkMode] = useState<'command' | 'live'>('command');
  const [status, setStatus] = useState<AiLinkStatus>();
  const [deviceOnline, setDeviceOnline] = useState(navigator.onLine);
  const [notice, setNotice] = useState('Say a companion’s name, then speak naturally.');
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [replies, setReplies] = useState<AiConversationMessage[]>([]);
  const [pendingAction, setPendingAction] = useState<PendingQuickLinkAction>();
  const [pendingOperation, setPendingOperation] = useState<CompanionOperationRequest>();
  const [pendingMission, setPendingMission] =
    useState<NonNullable<AiHeadquartersReply['missionProposal']>>();
  const [pendingRecipe, setPendingRecipe] =
    useState<NonNullable<AiHeadquartersReply['recipeProposal']>>();
  const [pendingContent, setPendingContent] =
    useState<NonNullable<AiHeadquartersReply['contentProposal']>>();
  const [pendingCampaign, setPendingCampaign] =
    useState<NonNullable<AiHeadquartersReply['campaignProposal']>>();
  const [pendingCalendar, setPendingCalendar] =
    useState<NonNullable<AiHeadquartersReply['calendarProposal']>>();
  const [pendingCalendarOwner, setPendingCalendarOwner] = useState<'kairo' | 'snow'>('kairo');
  const [pendingHandoff, setPendingHandoff] =
    useState<NonNullable<AiHeadquartersReply['handoffProposal']>>();
  const [pendingCreatorUpdate, setPendingCreatorUpdate] =
    useState<NonNullable<AiHeadquartersReply['creatorUpdateProposal']>>();
  const [pendingArcNote, setPendingArcNote] =
    useState<NonNullable<AiHeadquartersReply['arcNoteProposal']>>();
  const protectedConfirmationWaiting = Boolean(
    pendingAction ||
    pendingOperation ||
    pendingMission ||
    pendingRecipe ||
    pendingContent ||
    pendingCampaign ||
    pendingCalendar ||
    pendingCreatorUpdate ||
    pendingArcNote,
  );
  const [executingAction, setExecutingAction] = useState(false);
  const [continuityTurns, setContinuityTurns] = useState(0);
  const [activeCompanionId, setActiveCompanionId] = useState<CompanionId>('snow');
  const submitRef = useRef<(text: string) => Promise<void>>(async () => undefined);
  const transmissionLockRef = useRef(false);
  const recoveryStartedRef = useRef(false);
  const conversationRef = useRef<AiConversation>();
  const repliesRef = useRef<HTMLDivElement>(null);
  const liveWriteQueueRef = useRef(Promise.resolve());
  const executionLockRef = useRef(false);
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
  const voiceLinkRef = useRef(voiceLink);
  voiceLinkRef.current = voiceLink;
  const appendLiveMessage = useCallback(
    (role: 'hunter' | 'companion', companionId: CompanionId, text: string) => {
      const operation = liveWriteQueueRef.current.then(async () => {
        const current =
          conversationRef.current?.audience === companionId
            ? conversationRef.current
            : createAiConversation(companionId);
        const message =
          role === 'hunter' ? createHunterMessage(text) : createCompanionMessage(companionId, text);
        const updated = {
          ...current,
          title: `Live Link · ${getCompanion(companionId).name}`,
          messages: [...current.messages, message],
          updatedAt: message.createdAt,
        };
        conversationRef.current = updated;
        await saveAiConversation(updated);
        setReplies((existing) => [...existing, message]);
        setContinuityTurns(updated.messages.length);
        window.dispatchEvent(
          new CustomEvent('system:ai-conversations-changed', { detail: { id: updated.id } }),
        );
      });
      liveWriteQueueRef.current = operation.catch(() => undefined);
      return operation;
    },
    [],
  );
  const realtimeLink = useAiRealtimeLink({
    onHunterTranscript: (text) => appendLiveMessage('hunter', activeCompanionId, text),
    onCompanionTranscript: (companionId, text) => appendLiveMessage('companion', companionId, text),
    onNotice: setNotice,
  });

  const restorePendingProposal = useCallback((proposal?: AiPendingProposal) => {
    if (!proposal) return;
    if (proposal.kind === 'command') setPendingAction(proposal.payload);
    if (proposal.kind === 'operation') setPendingOperation(proposal.payload);
    if (proposal.kind === 'mission') setPendingMission(proposal.payload);
    if (proposal.kind === 'recipe') setPendingRecipe(proposal.payload);
    if (proposal.kind === 'content') setPendingContent(proposal.payload);
    if (proposal.kind === 'campaign') setPendingCampaign(proposal.payload);
    if (proposal.kind === 'calendar') {
      setPendingCalendar(proposal.payload);
      setPendingCalendarOwner(proposal.ownerId);
    }
    if (proposal.kind === 'creator-update') setPendingCreatorUpdate(proposal.payload);
    if (proposal.kind === 'arc-note') setPendingArcNote(proposal.payload);
    setNotice('Your unfinished confirmation is still waiting below. Nothing changed without you.');
  }, []);

  useEffect(() => {
    void getAiLinkStatus().then(setStatus);
    const online = () => setDeviceOnline(true);
    const offline = () => setDeviceOnline(false);
    window.addEventListener('online', online);
    window.addEventListener('offline', offline);
    const openDirectLink = (event: Event) => {
      const detail = (event as CustomEvent<{ companionId?: CompanionId; initialDraft?: string }>)
        .detail;
      const companionId = detail?.companionId;
      if (!companionId) return;
      voiceLinkRef.current.stopPlayback();
      setActiveCompanionId(companionId);
      setReplies([]);
      setPendingAction(undefined);
      setPendingOperation(undefined);
      setPendingMission(undefined);
      setPendingRecipe(undefined);
      setPendingContent(undefined);
      setPendingCampaign(undefined);
      setPendingCalendar(undefined);
      setPendingHandoff(undefined);
      setPendingCreatorUpdate(undefined);
      setPendingArcNote(undefined);
      setDraft(typeof detail.initialDraft === 'string' ? detail.initialDraft.slice(0, 4_000) : '');
      setContinuityTurns(0);
      setLinkMode('command');
      setNotice(`${getCompanion(companionId).name}'s live channel is ready.`);
      setOpen(true);
      void (async () => {
        const continuing = await getContinuingAiConversation(companionId, new Date(), 24);
        const conversation = continuing ?? createAiConversation(companionId);
        conversationRef.current = conversation;
        setReplies(conversation.messages);
        setContinuityTurns(conversation.messages.length);
        restorePendingProposal(await getPendingAiProposal(conversation.id));
        const operations = await getDailyOperations(systemDate);
        if (operations?.status === 'awaiting-confirmation' && operations.pendingProposal) {
          setPendingOperation(operations.pendingProposal);
          setNotice(
            `${getCompanion(companionId).name}'s channel is ready. Your staged preparation is still waiting below.`,
          );
        }
      })();
    };
    window.addEventListener('system:open-quick-link', openDirectLink);
    return () => {
      window.removeEventListener('online', online);
      window.removeEventListener('offline', offline);
      window.removeEventListener('system:open-quick-link', openDirectLink);
    };
  }, [restorePendingProposal, systemDate]);

  useEffect(() => {
    if (
      recoveryStartedRef.current ||
      !profile ||
      !settings ||
      !progression ||
      settings.aiLinkMode !== 'online' ||
      !settings.aiDataSharingAcknowledged
    ) {
      return;
    }
    recoveryStartedRef.current = true;
    void (async () => {
      const pendingTransmission = await getPendingAiTransmission('quick-link');
      if (!pendingTransmission) return;
      const conversation = await getAiConversation(pendingTransmission.conversationId);
      if (!conversation) {
        await clearPendingAiTransmission('quick-link', pendingTransmission.transmissionId);
        return;
      }
      const hunterIndex = conversation.messages.findIndex(
        (message) => message.id === pendingTransmission.hunterMessageId,
      );
      if (
        hunterIndex >= 0 &&
        conversation.messages.slice(hunterIndex + 1).some((message) => message.role === 'companion')
      ) {
        await clearPendingAiTransmission('quick-link', pendingTransmission.transmissionId);
        return;
      }

      setSending(true);
      setNotice('Restoring the companion transmission that finished while The System was awayâ€¦');
      try {
        const result = await resumeAiHeadquartersReply(pendingTransmission.transmissionId);
        await voiceLink.trackTextUsage(result);
        if (settings.aiRelationshipMemoryEnabled) {
          await saveAiMemoryCandidates(
            result.memoryCandidates,
            pendingTransmission.audience,
            conversation.id,
          );
        }
        const replyTime = new Date().toISOString();
        const responseMessages = result.replies.map((reply) =>
          createCompanionMessage(reply.companionId, reply.message, replyTime, reply.voiceSummary),
        );
        const completedConversation = {
          ...conversation,
          title: result.title,
          messages: [...conversation.messages, ...responseMessages],
          updatedAt: replyTime,
        };
        await saveAiConversation(completedConversation);
        const pendingProposal = extractAiPendingProposal(
          result,
          actionCatalog,
          pendingTransmission.audience,
        );
        if (pendingProposal) {
          await savePendingAiProposal(completedConversation.id, pendingProposal);
          restorePendingProposal(pendingProposal);
        }
        if (result.operationProposal) {
          await stageCompanionOperation(
            systemDate,
            result.operationProposal,
            completedConversation.id,
          );
        }
        if (result.handoffProposal) setPendingHandoff(result.handoffProposal);
        conversationRef.current = completedConversation;
        setReplies(completedConversation.messages);
        setContinuityTurns(completedConversation.messages.length);
        setActiveCompanionId(
          pendingTransmission.audience === 'party' ? 'snow' : pendingTransmission.audience,
        );
        setOpen(true);
        setNotice(
          pendingProposal
            ? 'Recovered transmission complete. Its protected preview is waiting for your confirmation.'
            : 'Recovered transmission complete. Snow kept the channel open for you.',
        );
        await clearPendingAiTransmission('quick-link', pendingTransmission.transmissionId);
        window.dispatchEvent(
          new CustomEvent('system:ai-conversations-changed', {
            detail: { id: completedConversation.id },
          }),
        );
      } catch (error) {
        setNotice(
          error instanceof Error
            ? error.message
            : 'The unfinished transmission is still protected and will be checked again later.',
        );
      } finally {
        setSending(false);
      }
    })();
  }, [
    actionCatalog,
    profile,
    progression,
    restorePendingProposal,
    settings,
    systemDate,
    voiceLink,
  ]);

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

  useEffect(() => {
    const container = repliesRef.current;
    if (!open || !container) return;
    container.scrollTop = container.scrollHeight;
  }, [open, replies]);

  const transmit = useCallback(
    async (raw: string, intent: QuickLinkTransmissionIntent = 'message') => {
      const text = raw.trim();
      if (
        !text ||
        sending ||
        transmissionLockRef.current ||
        !profile ||
        !settings ||
        !progression ||
        !deviceOnline ||
        settings.aiLinkMode !== 'online' ||
        !settings.aiDataSharingAcknowledged
      ) {
        if (text && !sending && !transmissionLockRef.current) {
          setNotice(
            !deviceOnline
              ? 'Quick Link needs a connection for speech and intelligence. The rest of your campaign remains available offline.'
              : 'Activate the Secure AI Link in Headquarters before opening a voice command.',
          );
        }
        return;
      }
      if (
        !canBeginQuickLinkTransmission(
          {
            hasCommand: protectedConfirmationWaiting,
            hasHandoff: Boolean(pendingHandoff),
          },
          intent,
        )
      ) {
        setNotice(
          'A prepared command is still waiting below. Confirm or cancel it before opening another transmission.',
        );
        return;
      }

      const fallbackAudience = conversationRef.current?.audience ?? activeCompanionId;
      const addressed = parseQuickLinkAddress(text, fallbackAudience);
      const addressedCompanion = addressed.audience === 'party' ? 'snow' : addressed.audience;
      if (
        addressed.audience !== 'party' &&
        !settings.enabledCompanionIds.includes(addressed.audience)
      ) {
        setNotice(`${getCompanion(addressed.audience).name}'s link is disabled in Settings.`);
        return;
      }
      if (!acquireQuickLinkTransmission(transmissionLockRef)) return;
      setSending(true);
      try {
        setActiveCompanionId(addressedCompanion);
        setDraft('');
        setPendingAction(undefined);
        if (pendingOperation) await cancelStagedCompanionOperation(systemDate);
        if (conversationRef.current) {
          await clearPendingAiProposal(conversationRef.current.id);
        }
        setPendingOperation(undefined);
        setPendingMission(undefined);
        setPendingRecipe(undefined);
        setPendingContent(undefined);
        setPendingCampaign(undefined);
        setPendingCalendar(undefined);
        setPendingHandoff(undefined);
        setPendingCreatorUpdate(undefined);
        setPendingArcNote(undefined);
        setNotice(
          addressed.audience === 'party'
            ? 'Party channel open. The council is thinking…'
            : `${getCompanion(addressed.audience).name} is thinking…`,
        );

        const continuing = conversationRef.current?.audience === addressed.audience;
        const conversation = continuing
          ? conversationRef.current!
          : createAiConversation(addressed.audience);
        conversationRef.current = conversation;
        if (!continuing) setReplies([]);
        setContinuityTurns(conversation.messages.length);
        const hunterMessage = createHunterMessage(addressed.message || text);
        setReplies((current) => (continuing ? [...current, hunterMessage] : [hunterMessage]));
        const pendingConversation = {
          ...conversation,
          messages: [...conversation.messages, hunterMessage],
          updatedAt: hunterMessage.createdAt,
        };
        await saveAiConversation(pendingConversation);
        conversationRef.current = pendingConversation;

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
          setReplies((current) => [...current, companionMessage]);
          setContinuityTurns(completedConversation.messages.length);
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

        const transmissionId = createAiTransmissionId();
        await savePendingAiTransmission({
          surface: 'quick-link',
          transmissionId,
          conversationId: pendingConversation.id,
          hunterMessageId: hunterMessage.id,
          audience: addressed.audience,
          startedAt: new Date().toISOString(),
        });
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
            query: addressed.message || text,
            history: conversation.messages,
          }),
          commandMode: 'propose',
          transmissionId,
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
          createCompanionMessage(reply.companionId, reply.message, replyTime, reply.voiceSummary),
        );
        const completedConversation = {
          ...pendingConversation,
          title: result.title,
          messages: [...pendingConversation.messages, ...responseMessages],
          updatedAt: replyTime,
        };
        await saveAiConversation(completedConversation);
        conversationRef.current = completedConversation;
        setReplies((current) => [...current, ...responseMessages]);
        setContinuityTurns(completedConversation.messages.length);
        const pending = extractAiPendingProposal(result, actionCatalog, addressed.audience);
        if (pending) await savePendingAiProposal(completedConversation.id, pending);
        const proposedAction = result.commandProposal
          ? actionCatalog.find((action) => action.actionId === result.commandProposal?.actionId)
          : undefined;
        if (result.commandProposal && proposedAction) {
          setPendingAction({ action: proposedAction, proposal: result.commandProposal });
          setActiveCompanionId(result.commandProposal.companionId);
        }
        if (result.operationProposal) {
          await stageCompanionOperation(
            systemDate,
            result.operationProposal,
            completedConversation.id,
          );
          setPendingOperation(result.operationProposal);
          setActiveCompanionId(result.operationProposal.companionId);
        }
        if (result.missionProposal) {
          setPendingMission(result.missionProposal);
          setActiveCompanionId(result.missionProposal.companionId);
        }
        if (result.recipeProposal) {
          setPendingRecipe(result.recipeProposal);
          setActiveCompanionId('saffron');
        }
        if (result.contentProposal) {
          setPendingContent(result.contentProposal);
          setActiveCompanionId('haven');
        }
        if (result.campaignProposal) {
          setPendingCampaign(result.campaignProposal);
          setActiveCompanionId('haven');
        }
        if (result.calendarProposal) {
          const owner = addressed.audience === 'snow' ? 'snow' : 'kairo';
          setPendingCalendar(result.calendarProposal);
          setPendingCalendarOwner(owner);
          setActiveCompanionId(owner);
        }
        if (result.handoffProposal) setPendingHandoff(result.handoffProposal);
        if (result.creatorUpdateProposal) {
          setPendingCreatorUpdate(result.creatorUpdateProposal);
          setActiveCompanionId('haven');
        }
        if (result.arcNoteProposal) {
          setPendingArcNote(result.arcNoteProposal);
          setActiveCompanionId('quill');
        }
        setNotice(
          proposedAction ||
            result.operationProposal ||
            result.missionProposal ||
            result.recipeProposal ||
            result.contentProposal ||
            result.campaignProposal ||
            result.calendarProposal ||
            result.creatorUpdateProposal ||
            result.arcNoteProposal
            ? 'Command prepared. Nothing changes until you confirm it below.'
            : result.handoffProposal
              ? `${getCompanion(result.handoffProposal.companionId).name} is ready to take the specialist relay.`
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
        await clearPendingAiTransmission('quick-link', transmissionId);
        if (settings.aiVoiceOutputEnabled) void voiceLink.playMessages(responseMessages);
      } catch (error) {
        setNotice(error instanceof Error ? error.message : 'Quick Link could not respond.');
      } finally {
        releaseQuickLinkTransmission(transmissionLockRef);
        setSending(false);
      }
    },
    [
      challenges,
      actionCatalog,
      activeCompanionId,
      deviceOnline,
      enabledCompanions,
      missions,
      profile,
      progression,
      pendingOperation,
      pendingHandoff,
      protectedConfirmationWaiting,
      sending,
      settings,
      stats,
      systemDate,
      todayRecords,
      voiceLink,
    ],
  );
  submitRef.current = transmit;

  async function appendLocalMessages(
    messages: Array<{ companionId: CompanionId; message: string }>,
    options?: { party?: boolean; title?: string },
  ) {
    const companionMessages = messages.map((entry) =>
      createCompanionMessage(entry.companionId, entry.message),
    );
    const conversation = conversationRef.current;
    if (conversation) {
      const updatedConversation = {
        ...conversation,
        audience: options?.party ? ('party' as const) : conversation.audience,
        title: options?.title ?? conversation.title,
        messages: [...conversation.messages, ...companionMessages],
        updatedAt: companionMessages.at(-1)?.createdAt ?? conversation.updatedAt,
      };
      await saveAiConversation(updatedConversation);
      conversationRef.current = updatedConversation;
      window.dispatchEvent(
        new CustomEvent('system:ai-conversations-changed', {
          detail: { id: updatedConversation.id },
        }),
      );
    }
    setReplies((current) => [...current, ...companionMessages]);
    if (settings?.aiVoiceOutputEnabled) void voiceLink.playMessages(companionMessages);
  }

  async function appendLocalAcknowledgement(companionId: CompanionId, message: string) {
    await appendLocalMessages([{ companionId, message }]);
  }

  async function executePendingAction() {
    if (!pendingAction || executingAction || executionLockRef.current) return;
    executionLockRef.current = true;
    setExecutingAction(true);
    let applied = false;
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
      applied = true;
      setPendingAction(undefined);
      await appendLocalAcknowledgement(
        pendingAction.proposal.companionId,
        commandSuccessAcknowledgement(pendingAction.proposal.companionId, pendingAction.action),
      );
      if (conversationRef.current) await clearPendingAiProposal(conversationRef.current.id);
      setNotice('Command confirmed · local campaign synchronized.');
    } catch (error) {
      setNotice(
        applied
          ? 'Command confirmed locally. Only the companion acknowledgement failed to save.'
          : error instanceof Error
            ? error.message
            : 'The command could not be completed.',
      );
    } finally {
      executionLockRef.current = false;
      setExecutingAction(false);
    }
  }

  async function executePendingMission() {
    if (!pendingMission || executingAction || executionLockRef.current) return;
    executionLockRef.current = true;
    setExecutingAction(true);
    let applied = false;
    try {
      let acknowledgement = '';
      if (pendingMission.action === 'create') {
        const mission = await createAgentMission({
          title: pendingMission.title,
          description: pendingMission.description,
          category: pendingMission.category,
          companionId: pendingMission.companionId,
          createdBy: pendingMission.companionId,
          source: pendingMission.companionId === 'snow' ? 'party' : 'companion',
          difficulty: pendingMission.difficulty,
          dueDate: (pendingMission.dueDate || undefined) as LocalDateKey | undefined,
          recurrence: pendingMission.recurrence,
          recurrenceInterval: pendingMission.recurrenceInterval,
          checklistItems: pendingMission.checklistItems,
        });
        acknowledgement = `“${mission.title}” is secured under ${getCompanion(mission.companionId).name}. The Daily Mission cycle is unchanged.`;
      } else if (pendingMission.action === 'update') {
        const mission = await updateAgentMission(pendingMission.missionId, {
          title: pendingMission.title || undefined,
          description: pendingMission.description || undefined,
          category: pendingMission.category || undefined,
          companionId: pendingMission.companionId,
          difficulty: pendingMission.difficulty,
          dueDate: (pendingMission.dueDate || undefined) as LocalDateKey | undefined,
          recurrence: pendingMission.recurrence,
          recurrenceInterval: pendingMission.recurrenceInterval,
          checklistItems: pendingMission.checklistItems,
        });
        acknowledgement = `“${mission.title}” is updated. Its previous record remains in the audit trail.`;
      } else if (pendingMission.action === 'complete') {
        const result = await completeAgentMission(pendingMission.missionId, systemDate);
        acknowledgement = `“${result.mission?.title ?? pendingMission.title}” is confirmed clear. ${result.awardedXp ? `${result.awardedXp} XP applied.` : 'The clear is recorded with no extra XP beyond today’s Agent ceiling.'}`;
      } else if (pendingMission.action === 'reopen') {
        const mission = await reopenAgentMission(pendingMission.missionId, systemDate);
        acknowledgement = `“${mission?.title ?? pendingMission.title}” is reopened and today’s reward was reversed.`;
      } else {
        const mission = await retireAgentMission(pendingMission.missionId);
        acknowledgement = `“${mission.title}” is retired without deleting its history.`;
      }
      applied = true;
      const owner = pendingMission.companionId;
      setPendingMission(undefined);
      await appendLocalAcknowledgement(owner, acknowledgement);
      if (conversationRef.current) await clearPendingAiProposal(conversationRef.current.id);
      await refresh();
      setNotice('Companion Order confirmed · local Mission Forge synchronized.');
    } catch (error) {
      setNotice(
        applied
          ? 'The mission changed locally. Only the companion acknowledgement failed to save.'
          : error instanceof Error
            ? error.message
            : 'The Companion Order could not be applied.',
      );
    } finally {
      executionLockRef.current = false;
      setExecutingAction(false);
    }
  }

  function hasMeaningfulFoodConstraint(value?: string) {
    const normalized = value?.trim().toLowerCase();
    return Boolean(
      normalized &&
      !['none', 'no', 'no restrictions', 'nothing', 'anything is fine'].includes(normalized),
    );
  }

  async function reviewPreparedKitchen(
    request: CompanionOperationRequest,
  ): Promise<Array<{ companionId: CompanionId; message: string }>> {
    if (
      !hasMeaningfulFoodConstraint(request.foodConstraints) ||
      !profile ||
      !settings ||
      !progression
    ) {
      return [];
    }
    try {
      const result = await requestAiHeadquartersReply({
        audience: 'saffron',
        message: `The Hunter already confirmed today's preparation. Review the current Kitchen Order against this exact boundary: "${request.foodConstraints}". If the current order satisfies it, keep the roll and return no recipe. If it conflicts, create one complete practical replacement recipe that satisfies the boundary. Do not return a Companion Operation; the operation is already confirmed.`,
        history: conversationRef.current?.messages ?? [],
        context: await buildAiProgressContext({
          audience: 'saffron',
          profile,
          settings,
          progression,
          missions,
          todayRecords,
          stats,
          challenges,
          systemDate,
          enabledCompanionIds: enabledCompanions.map((companion) => companion.id),
          history: conversationRef.current?.messages,
        }),
        commandMode: 'propose',
      });
      await voiceLink.trackTextUsage(result);
      if (result.recipeProposal) {
        let replacementRecipeId: string | undefined;
        try {
          const recipe = await saveCustomKitchenRecipe({
            name: result.recipeProposal.name,
            codename: result.recipeProposal.codename,
            servings: result.recipeProposal.servings,
            prepMinutes: result.recipeProposal.prepMinutes,
            cookMinutes: result.recipeProposal.cookMinutes,
            costTier: result.recipeProposal.costTier,
            equipment: result.recipeProposal.equipment,
            plate: result.recipeProposal.plate,
            ingredients: result.recipeProposal.ingredients,
            steps: result.recipeProposal.steps,
            swaps: result.recipeProposal.swaps,
            storage: result.recipeProposal.storage,
            safety: result.recipeProposal.safety,
          });
          replacementRecipeId = recipe.id;
          await assignSpecificKitchenOrder(systemDate, recipe.id);
          await synchronizeKitchenOperation(systemDate, request.foodConstraints);
        } catch (error) {
          if (replacementRecipeId) {
            await deleteCustomKitchenRecipe(replacementRecipeId).catch(() => undefined);
          }
          throw error;
        }
      }
      return result.replies;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Saffron could not verify the boundary.';
      await addDailyOperationNote(systemDate, `Kitchen constraint review: ${message}`);
      return [
        {
          companionId: 'saffron',
          message: `I kept the Kitchen Order intact, but I could not safely finish the “${request.foodConstraints}” replacement check. I flagged it instead of pretending the menu is settled.`,
        },
      ];
    }
  }

  function buildOperationMessages(
    record: DailyOperationsRecord,
    request: CompanionOperationRequest,
    kitchenMessages: Array<{ companionId: CompanionId; message: string }>,
  ) {
    const messages: Array<{ companionId: CompanionId; message: string }> = [];
    const reportsTraining =
      request.kind === 'prepare-training' ||
      (request.kind === 'assemble-day' && request.includeTraining);
    const reportsKitchen =
      request.kind === 'prepare-kitchen' ||
      (request.kind === 'assemble-day' && request.includeKitchen);
    const reportsSanctuary =
      request.kind === 'prepare-sanctuary' ||
      (request.kind === 'assemble-day' && request.includeSanctuary);

    if (reportsTraining && record.training) {
      const lead = record.training.location === 'recovery' ? 'mira' : 'rook';
      messages.push({
        companionId: lead,
        message:
          record.training.state === 'completed'
            ? `${record.training.label} was already complete today. I preserved the cleared record—nothing was rerolled, reopened, or rewarded twice.`
            : record.training.location === 'recovery'
              ? `${record.training.label} is prepared. The movements and timing are waiting in the Training Hall; nothing begins until you do.`
              : `${record.training.label} is rolled and loaded. Open the Training Hall and the proper deployment screen will already be waiting.`,
      });
      if (
        request.kind === 'assemble-day' &&
        record.training.location !== 'recovery' &&
        record.training.state !== 'completed'
      ) {
        messages.push({
          companionId: 'ember',
          message:
            'I checked the deployment. It is real work, not decorative movement—and no, I did not mark a single rep complete for you.',
        });
      }
    }
    if (reportsKitchen) {
      if (kitchenMessages.length) messages.push(...kitchenMessages);
      else if (record.kitchen) {
        messages.push({
          companionId: 'saffron',
          message:
            record.kitchen.state === 'completed'
              ? `${record.kitchen.label} is already complete today. I kept the finished Kitchen record exactly where it belongs—no duplicate order and no duplicate reward.`
              : `${record.kitchen.label} is loaded in the Kitchen. Ingredients, steps, and the cooking checklist are all ready when you are.`,
        });
      }
    }
    if (reportsSanctuary && record.sanctuary) {
      messages.push({
        companionId: 'selah',
        message:
          record.sanctuary.state === 'completed'
            ? `${record.sanctuary.label} is already complete today. I preserved the finished Sanctuary record and your private reflection exactly as they were.`
            : `${record.sanctuary.label} is prepared around ${record.sanctuary.detail.toLowerCase()}. The Sanctuary will open directly into the session, and your private reflection remains yours.`,
      });
    }
    if (request.kind === 'assemble-day') {
      const selectedStates = [
        reportsTraining ? record.training?.state : undefined,
        reportsKitchen ? record.kitchen?.state : undefined,
        reportsSanctuary ? record.sanctuary?.state : undefined,
      ].filter((state): state is NonNullable<typeof state> => Boolean(state));
      const selectedAlreadyComplete =
        selectedStates.length > 0 && selectedStates.every((state) => state === 'completed');
      messages.push({
        companionId: 'snow',
        message: selectedAlreadyComplete
          ? 'Every selected realm was already cleared today. I preserved the completed records exactly as they were—no rerolls, no reopened work, and no duplicate rewards.'
          : record.preparationNotes.length
            ? `The party is assembled and every safe assignment I could prepare is loaded. I left ${record.preparationNotes.length} clear flag${record.preparationNotes.length === 1 ? '' : 's'} in the briefing instead of forcing anything.`
            : `Everybody is awake. Your assignments are assembled, the real section screens are preloaded, and nothing has been claimed or completed. Start wherever you want—I have the board.`,
      });
    }
    return messages;
  }

  async function executePendingOperation() {
    if (!pendingOperation || executingAction || executionLockRef.current) return;
    executionLockRef.current = true;
    setExecutingAction(true);
    let prepared = false;
    try {
      let record = await prepareCompanionOperation(
        systemDate,
        pendingOperation,
        conversationRef.current?.id,
      );
      const kitchenMessages =
        (pendingOperation.kind === 'prepare-kitchen' ||
          (pendingOperation.kind === 'assemble-day' && pendingOperation.includeKitchen)) &&
        record.kitchen &&
        record.kitchen.state !== 'completed'
          ? await reviewPreparedKitchen(pendingOperation)
          : [];
      record = (await getDailyOperations(systemDate)) ?? record;
      const messages = buildOperationMessages(record, pendingOperation, kitchenMessages);
      prepared = true;
      setPendingOperation(undefined);
      if (conversationRef.current) await clearPendingAiProposal(conversationRef.current.id);
      await refresh();
      if (messages.length) {
        await appendLocalMessages(messages, {
          party: pendingOperation.kind === 'assemble-day',
          title:
            pendingOperation.kind === 'assemble-day'
              ? `Party Operation · ${systemDate}`
              : undefined,
        });
      }
      setNotice(
        record.status === 'partial'
          ? 'Party preparation complete with a visible flag · no assignment was forced.'
          : 'Party preparation complete · real section assignments are ready.',
      );
    } catch (error) {
      setNotice(
        prepared
          ? 'Assignments were prepared locally. Only the companion briefing failed to save.'
          : error instanceof Error
            ? error.message
            : 'The party could not prepare that order.',
      );
    } finally {
      executionLockRef.current = false;
      setExecutingAction(false);
    }
  }

  async function dismissPendingOperation() {
    if (executingAction || executionLockRef.current) return;
    executionLockRef.current = true;
    setExecutingAction(true);
    try {
      await cancelStagedCompanionOperation(systemDate);
      setPendingOperation(undefined);
      if (conversationRef.current) await clearPendingAiProposal(conversationRef.current.id);
      setNotice('Preparation dismissed. Existing assignments remain untouched.');
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : 'That preparation could not be dismissed.',
      );
    } finally {
      executionLockRef.current = false;
      setExecutingAction(false);
    }
  }

  async function dismissPendingPreview(clearPreview: () => void, notice: string) {
    try {
      if (conversationRef.current) {
        await clearPendingAiProposal(conversationRef.current.id);
      }
      clearPreview();
      setNotice(notice);
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : 'That preview could not be safely dismissed.',
      );
    }
  }

  async function savePendingRecipe() {
    if (!pendingRecipe || executingAction || executionLockRef.current) return;
    executionLockRef.current = true;
    setExecutingAction(true);
    let saved = false;
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
      saved = true;
      setPendingRecipe(undefined);
      if (conversationRef.current) await clearPendingAiProposal(conversationRef.current.id);
      await appendLocalAcknowledgement(
        'saffron',
        `${recipe.name} is in my Private Grimoire and Daily Rotation now. Open the Kitchen whenever you want to cook it with me step by step. Your recipe, your device, and nobody touched it before you confirmed.`,
      );
      setNotice('Recipe confirmed · Private Grimoire and Daily Rotation updated.');
    } catch (error) {
      setNotice(
        saved
          ? 'Recipe saved locally. Only Saffron’s acknowledgement failed to save.'
          : error instanceof Error
            ? error.message
            : 'That recipe could not be saved.',
      );
    } finally {
      executionLockRef.current = false;
      setExecutingAction(false);
    }
  }

  async function savePendingContent() {
    if (!pendingContent || executingAction || executionLockRef.current) return;
    executionLockRef.current = true;
    setExecutingAction(true);
    let saved = false;
    try {
      const content = await saveCreatorProject({
        title: pendingContent.title,
        platform: pendingContent.platform,
        contentType: pendingContent.contentType,
        status: 'idea',
        pillar: pendingContent.pillar,
        hook: pendingContent.hook,
        audiencePromise: pendingContent.audiencePromise,
        nextAction: pendingContent.nextAction,
        notes: pendingContent.notes,
      });
      saved = true;
      setPendingContent(undefined);
      if (conversationRef.current) await clearPendingAiProposal(conversationRef.current.id);
      await appendLocalAcknowledgement(
        'haven',
        `“${content.title}” is on the Creator Forge board now. The spotlight is not asking for perfection—just ${content.nextAction || 'one honest next move'}.`,
      );
      setNotice('Content operation confirmed · Creator Forge synchronized.');
    } catch (error) {
      setNotice(
        saved
          ? 'Content operation saved locally. Only Vesper’s acknowledgement failed to save.'
          : error instanceof Error
            ? error.message
            : 'That content operation could not be saved.',
      );
    } finally {
      executionLockRef.current = false;
      setExecutingAction(false);
    }
  }

  async function applyPendingCreatorUpdate() {
    if (!pendingCreatorUpdate || executingAction || executionLockRef.current) return;
    executionLockRef.current = true;
    setExecutingAction(true);
    let saved = false;
    try {
      const project = await applyCreatorProjectUpdate({
        projectId: pendingCreatorUpdate.projectId,
        status: pendingCreatorUpdate.status || undefined,
        nextAction: pendingCreatorUpdate.nextAction || undefined,
        notesAppend: pendingCreatorUpdate.notesAppend || undefined,
      });
      saved = true;
      setPendingCreatorUpdate(undefined);
      if (conversationRef.current) await clearPendingAiProposal(conversationRef.current.id);
      await appendLocalAcknowledgement(
        'haven',
        `“${project.title}” is actually updated on the Creator Forge now. ${project.status !== 'idea' ? `Stage: ${project.status}. ` : ''}Next move: ${project.nextAction || 'define the next physical production step'}.`,
      );
      setNotice('Creator operation confirmed · board record updated.');
    } catch (error) {
      setNotice(
        saved
          ? 'Creator operation updated locally. Only Vesper’s acknowledgement failed to save.'
          : error instanceof Error
            ? error.message
            : 'That Creator Forge update could not be applied.',
      );
    } finally {
      executionLockRef.current = false;
      setExecutingAction(false);
    }
  }

  async function savePendingArcNote() {
    if (!pendingArcNote || executingAction || executionLockRef.current) return;
    executionLockRef.current = true;
    setExecutingAction(true);
    let saved = false;
    try {
      const note = await saveArcCanonSource({
        title: pendingArcNote.title,
        kind: pendingArcNote.kind,
        text: pendingArcNote.text,
        tags: pendingArcNote.tags,
        characterNames: pendingArcNote.characterNames,
      });
      saved = true;
      setPendingArcNote(undefined);
      if (conversationRef.current) await clearPendingAiProposal(conversationRef.current.id);
      await appendLocalAcknowledgement(
        'quill',
        `“${note.title}” is in the Canon Vault now—real source, locally filed, and ready for future Story Room retrieval. That one is canon because you confirmed it, not because I got excited.`,
      );
      setNotice('Canon note confirmed · Quill’s Vault synchronized.');
    } catch (error) {
      setNotice(
        saved
          ? 'Canon note saved locally. Only Quill’s acknowledgement failed to save.'
          : error instanceof Error
            ? error.message
            : 'That Canon Vault note could not be saved.',
      );
    } finally {
      executionLockRef.current = false;
      setExecutingAction(false);
    }
  }

  async function savePendingCampaign() {
    if (!pendingCampaign || executingAction || executionLockRef.current) return;
    executionLockRef.current = true;
    setExecutingAction(true);
    let saved = false;
    try {
      const projects = await saveCreatorCampaign(pendingCampaign.operations);
      saved = true;
      setPendingCampaign(undefined);
      if (conversationRef.current) await clearPendingAiProposal(conversationRef.current.id);
      await appendLocalAcknowledgement(
        'haven',
        `${pendingCampaign.name} is live on the Creator Forge board: ${projects.length} releases, one sequence, and no disappearing between uploads. We start with ${projects[0]?.nextAction || 'the first physical move'}.`,
      );
      setNotice(`Reawakening confirmed · ${projects.length} operations added to Creator Forge.`);
    } catch (error) {
      setNotice(
        saved
          ? 'Reawakening campaign saved locally. Only Vesper’s acknowledgement failed to save.'
          : error instanceof Error
            ? error.message
            : 'That comeback campaign could not be saved.',
      );
    } finally {
      executionLockRef.current = false;
      setExecutingAction(false);
    }
  }

  async function savePendingCalendar() {
    if (!pendingCalendar || executingAction || executionLockRef.current) return;
    executionLockRef.current = true;
    setExecutingAction(true);
    let saved = false;
    try {
      const event = await applyCalendarProposal(pendingCalendar, pendingCalendarOwner);
      saved = true;
      setPendingCalendar(undefined);
      if (conversationRef.current) await clearPendingAiProposal(conversationRef.current.id);
      const localDateTime = new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: pendingCalendar.allDay ? undefined : 'numeric',
        minute: pendingCalendar.allDay ? undefined : '2-digit',
        timeZone: settings?.timeZone,
      }).format(new Date(pendingCalendar.startAt));
      const actionLine =
        pendingCalendar.action === 'create'
          ? `${event.title} is secured for ${localDateTime}.`
          : pendingCalendar.action === 'update'
            ? `${event.title} is updated for ${localDateTime}.`
            : `${event.title} is canceled. The record remains visible instead of disappearing.`;
      await appendLocalAcknowledgement(
        pendingCalendarOwner,
        pendingCalendarOwner === 'snow'
          ? `${actionLine} Kairo has the same confirmed record now.`
          : `${actionLine} Snow's schedule view is synchronized too.`,
      );
      setNotice('Calendar command confirmed · local schedule synchronized.');
    } catch (error) {
      setNotice(
        saved
          ? 'Calendar changed locally. Only the companion acknowledgement failed to save.'
          : error instanceof Error
            ? error.message
            : 'That calendar command could not be applied.',
      );
    } finally {
      executionLockRef.current = false;
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

  async function beginLiveConversation() {
    if (
      !deviceOnline ||
      !profile ||
      !settings ||
      !progression ||
      settings.aiLinkMode !== 'online' ||
      !settings.aiDataSharingAcknowledged ||
      status?.configured === false
    ) {
      setNotice(
        !deviceOnline
          ? 'Live Link needs a connection. Your local campaign and Command Link history are safe.'
          : 'Activate the Secure AI Link in Headquarters before opening Live Link.',
      );
      return;
    }
    const voiceProfile = voiceLink.profiles?.[activeCompanionId];
    if (!voiceProfile) {
      setNotice('That companion’s Soulprint is still initializing. Try again in a moment.');
      return;
    }
    if (!settings.aiVoiceDisclosureAcknowledged || !settings.aiVoiceOutputEnabled) {
      setNotice('Enable Voice Link in Headquarters first. Every companion voice is AI-generated.');
      return;
    }
    if (voiceLink.recording) voiceLink.stopRecording();
    voiceLink.stopPlayback();
    if (conversationRef.current?.audience !== activeCompanionId) {
      conversationRef.current = createAiConversation(activeCompanionId);
      setReplies([]);
      setContinuityTurns(0);
    }
    setNotice(`${getCompanion(activeCompanionId).name} is opening a live channel…`);
    const context = await buildAiProgressContext({
      audience: activeCompanionId,
      profile,
      settings,
      progression,
      missions,
      todayRecords,
      stats,
      challenges,
      systemDate,
      enabledCompanionIds: enabledCompanions.map((companion) => companion.id),
      history: conversationRef.current?.messages,
    });
    const started = await realtimeLink.start({
      companionId: activeCompanionId,
      profile: voiceProfile,
      context,
    });
    if (started) {
      setNotice(
        `${getCompanion(activeCompanionId).name} is here. Speak naturally—you can interrupt at any time.`,
      );
    }
  }

  function endLiveConversation() {
    realtimeLink.stop();
    setNotice('Live Link closed. The transcript remains in your private conversation history.');
  }

  function selectLiveCompanion(companionId: CompanionId) {
    if (realtimeLink.active) realtimeLink.stop();
    conversationRef.current = createAiConversation(companionId);
    setActiveCompanionId(companionId);
    setReplies([]);
    setContinuityTurns(0);
    setNotice(`${getCompanion(companionId).name}'s live channel is ready.`);
  }

  function changeLinkMode(next: 'command' | 'live') {
    if (next === linkMode) return;
    if (
      !canBeginQuickLinkTransmission({
        hasCommand: protectedConfirmationWaiting,
        hasHandoff: Boolean(pendingHandoff),
      })
    ) {
      setNotice(
        'A prepared command is still waiting below. Confirm or cancel it before switching channels.',
      );
      return;
    }
    if (voiceLink.recording) voiceLink.stopRecording();
    voiceLink.stopPlayback();
    realtimeLink.stop();
    conversationRef.current = undefined;
    setReplies([]);
    setContinuityTurns(0);
    setPendingAction(undefined);
    setPendingMission(undefined);
    setPendingRecipe(undefined);
    setPendingContent(undefined);
    setPendingCampaign(undefined);
    setPendingCalendar(undefined);
    setPendingHandoff(undefined);
    setPendingCreatorUpdate(undefined);
    setPendingArcNote(undefined);
    setLinkMode(next);
    setNotice(
      next === 'live'
        ? 'Choose one companion, then open a continuous voice conversation.'
        : 'Say a companion’s name, then speak naturally.',
    );
  }

  async function openAndListen() {
    if (voiceLink.recording) {
      voiceLink.stopRecording();
      return;
    }
    if (sending || voiceLink.transcribing) return;
    voiceLink.stopPlayback();
    realtimeLink.stop();
    const listening = beginListening();
    setOpen(true);
    setLinkMode('command');
    const operations = await getDailyOperations(systemDate);
    const continuing = operations?.conversationId
      ? await getAiConversation(operations.conversationId)
      : await getContinuingAiConversation('snow', new Date(), 24);
    const storedProposal = continuing ? await getPendingAiProposal(continuing.id) : undefined;
    conversationRef.current = continuing;
    setActiveCompanionId(operations?.pendingProposal?.companionId ?? 'snow');
    setReplies(continuing?.messages ?? []);
    setPendingAction(undefined);
    setPendingOperation(
      operations?.status === 'awaiting-confirmation' ? operations.pendingProposal : undefined,
    );
    setPendingMission(undefined);
    setPendingRecipe(undefined);
    setPendingContent(undefined);
    setPendingCampaign(undefined);
    setPendingCalendar(undefined);
    setPendingHandoff(undefined);
    setPendingCreatorUpdate(undefined);
    setPendingArcNote(undefined);
    restorePendingProposal(storedProposal);
    setContinuityTurns(continuing?.messages.length ?? 0);
    await listening;
  }

  function close() {
    if (voiceLink.recording) voiceLink.stopRecording();
    voiceLink.stopPlayback();
    realtimeLink.stop();
    conversationRef.current = undefined;
    setOpen(false);
  }

  const activeCompanion = getCompanion(activeCompanionId);
  const pendingOperationTitle = pendingOperation
    ? pendingOperation.kind === 'assemble-day'
      ? 'Party Operation'
      : pendingOperation.kind === 'prepare-training'
        ? 'Training Hall Deployment'
        : pendingOperation.kind === 'prepare-kitchen'
          ? 'Kitchen Order'
          : 'Sanctuary Assignment'
    : '';
  const busy =
    sending || voiceLink.transcribing || executingAction || realtimeLink.state === 'connecting';
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
                      {conversationRef.current?.audience === 'party'
                        ? 'Party Channel'
                        : activeCompanion.name}
                    </strong>
                  </span>
                </div>
                <button type="button" onClick={close} aria-label="Close Quick Link">
                  <X size={19} />
                </button>
              </header>

              <nav className="quick-link__modes" aria-label="Quick Link mode">
                <button
                  type="button"
                  className={linkMode === 'command' ? 'is-active' : ''}
                  onClick={() => changeLinkMode('command')}
                >
                  <Mic size={15} />
                  <span>
                    <strong>Command Link</strong>
                    <small>Voice command or text</small>
                  </span>
                </button>
                <button
                  type="button"
                  className={linkMode === 'live' ? 'is-active' : ''}
                  onClick={() => changeLinkMode('live')}
                >
                  <RadioTower size={15} />
                  <span>
                    <strong>Live Link</strong>
                    <small>Continuous one-on-one</small>
                  </span>
                </button>
              </nav>

              {linkMode === 'command' ? (
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
              ) : (
                <section className={`quick-link__live is-${realtimeLink.state}`}>
                  <div className="quick-link__live-roster" aria-label="Choose a live companion">
                    {enabledCompanions.map((companion) => (
                      <button
                        key={companion.id}
                        type="button"
                        className={companion.id === activeCompanionId ? 'is-active' : ''}
                        style={{ '--companion-accent': companion.accent } as CSSProperties}
                        disabled={realtimeLink.active}
                        onClick={() => selectLiveCompanion(companion.id)}
                        aria-label={`Open ${companion.name}'s Live Link`}
                      >
                        <img src={getCompanionImage(companion.image)} alt="" />
                        <span>{companion.name}</span>
                      </button>
                    ))}
                  </div>
                  <div className="quick-link__live-stage">
                    <div className="quick-link__live-portrait">
                      <img src={getCompanionImage(activeCompanion.image)} alt="" />
                      <i />
                      <i />
                    </div>
                    <span className="quick-link__live-signal">
                      {realtimeLink.state === 'connecting'
                        ? 'SYNCHRONIZING SOULPRINT'
                        : realtimeLink.state === 'speaking'
                          ? `${activeCompanion.name.toUpperCase()} IS SPEAKING`
                          : realtimeLink.state === 'thinking'
                            ? `${activeCompanion.name.toUpperCase()} IS THINKING`
                            : realtimeLink.active
                              ? 'LISTENING · SPEAK NOW'
                              : 'LIVE CHANNEL STANDBY'}
                    </span>
                    <strong>
                      {activeCompanion.name} · {activeCompanion.title}
                    </strong>
                    <p>
                      {realtimeLink.active
                        ? `${Math.floor(realtimeLink.elapsedSeconds / 60)}:${Math.floor(
                            realtimeLink.elapsedSeconds % 60,
                          )
                            .toString()
                            .padStart(2, '0')} · ${realtimeLink.model ?? 'secure realtime route'}`
                        : 'Natural turn-taking, emotional delivery, and local transcripts. One companion at a time.'}
                    </p>
                    <div className="quick-link__live-actions">
                      {realtimeLink.active ? (
                        <>
                          <button
                            type="button"
                            className="button button--secondary"
                            onClick={realtimeLink.toggleMute}
                          >
                            {realtimeLink.muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                            {realtimeLink.muted ? 'Unmute me' : 'Mute me'}
                          </button>
                          <button
                            type="button"
                            className="button button--primary"
                            onClick={endLiveConversation}
                          >
                            <Square size={15} /> End Live Link
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          className="button button--primary"
                          disabled={!ready || realtimeLink.state === 'connecting'}
                          onClick={() => void beginLiveConversation()}
                        >
                          {realtimeLink.state === 'connecting' ? (
                            <LoaderCircle className="is-spinning" size={16} />
                          ) : (
                            <Headphones size={16} />
                          )}
                          Open Live Link
                        </button>
                      )}
                    </div>
                    <small>
                      AI-generated voice · higher-cost realtime model · exact model tokens added to
                      your local Usage Ledger
                    </small>
                  </div>
                </section>
              )}

              {replies.length > 0 && (
                <div ref={repliesRef} className="quick-link__replies" aria-live="polite">
                  {replies.map((message) => {
                    const companion =
                      message.role === 'companion' && message.companionId
                        ? getCompanion(message.companionId)
                        : undefined;
                    return (
                      <article
                        key={message.id}
                        className={message.role === 'hunter' ? 'is-hunter' : undefined}
                        style={
                          {
                            '--companion-accent': companion?.accent ?? 'var(--accent)',
                          } as CSSProperties
                        }
                      >
                        {companion && <img src={getCompanionImage(companion.image)} alt="" />}
                        <div>
                          <span>{companion?.name ?? 'YOU'}</span>
                          <p>{sanitizeSensitiveDisplayText(message.message)}</p>
                          {companion && settings?.aiVoiceOutputEnabled && (
                            <div className="ai-message__voice-actions">
                              <button
                                className="ai-message__voice"
                                type="button"
                                onClick={() =>
                                  voiceLink.playingMessageId === message.id
                                    ? voiceLink.stopPlayback()
                                    : voiceLink.playMessages([message])
                                }
                                disabled={
                                  Boolean(voiceLink.voiceBusyMessageId) &&
                                  voiceLink.voiceBusyMessageId !== message.id
                                }
                              >
                                {voiceLink.voiceBusyMessageId === message.id ? (
                                  <LoaderCircle className="is-spinning" size={13} />
                                ) : voiceLink.playingMessageId === message.id ? (
                                  <Square size={11} />
                                ) : (
                                  <Play size={12} />
                                )}
                                {voiceLink.voiceBusyMessageId === message.id
                                  ? 'Forging voice...'
                                  : voiceLink.playingMessageId === message.id
                                    ? 'Stop'
                                    : hasAiVoiceSummary(message)
                                      ? 'Play briefing'
                                      : 'Play voice'}
                              </button>
                              {hasAiVoiceSummary(message) &&
                                voiceLink.playingMessageId !== message.id && (
                                  <button
                                    className="ai-message__voice"
                                    type="button"
                                    onClick={() =>
                                      voiceLink.playMessages([message], undefined, {
                                        fullText: true,
                                      })
                                    }
                                    disabled={Boolean(voiceLink.voiceBusyMessageId)}
                                  >
                                    <Headphones size={12} /> Play full
                                  </button>
                                )}
                            </div>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}

              {linkMode === 'command' && pendingHandoff && (
                <section className="quick-link__command quick-link__handoff" aria-live="polite">
                  <header>
                    <span>
                      <ArrowUpRight size={15} /> PARTY RELAY
                    </span>
                    <small>ONE-TAP SPECIALIST HANDOFF</small>
                  </header>
                  <strong>{getCompanion(pendingHandoff.companionId).name} owns this lane</strong>
                  <p>{pendingHandoff.summary}</p>
                  <dl>
                    <div>
                      <dt>RELAY BRIEF</dt>
                      <dd>{pendingHandoff.prompt}</dd>
                    </div>
                  </dl>
                  <div className="quick-link__command-actions">
                    <button
                      type="button"
                      className="button button--primary"
                      disabled={sending}
                      onClick={() => {
                        const relay = pendingHandoff;
                        void transmit(
                          `${getCompanion(relay.companionId).name}, ${relay.prompt}`,
                          'confirmed-handoff',
                        );
                      }}
                    >
                      <ArrowUpRight size={15} /> Relay to{' '}
                      {getCompanion(pendingHandoff.companionId).name}
                    </button>
                    <button
                      type="button"
                      className="button button--ghost"
                      onClick={() => setPendingHandoff(undefined)}
                    >
                      Stay here
                    </button>
                  </div>
                </section>
              )}

              {linkMode === 'command' && pendingAction && (
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
                        void dismissPendingPreview(
                          () => setPendingAction(undefined),
                          'Command dismissed. No campaign data changed.',
                        );
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </section>
              )}

              {linkMode === 'command' && pendingMission && (
                <section
                  className="quick-link__command quick-link__mission-command"
                  aria-live="polite"
                >
                  <header>
                    <span>
                      <Sparkles size={15} /> SOVEREIGN MISSION FORGE
                    </span>
                    <small>CONFIRMATION REQUIRED</small>
                  </header>
                  <strong>{pendingMission.title || 'Companion Order'}</strong>
                  <p>
                    {pendingMission.description || `${pendingMission.action} this Companion Order.`}
                  </p>
                  <div className="quick-link__recipe-meta">
                    <span>{pendingMission.action}</span>
                    <span>{getCompanion(pendingMission.companionId).name}</span>
                    <span>{pendingMission.difficulty} threat</span>
                    {pendingMission.dueDate && <span>due {pendingMission.dueDate}</span>}
                    {pendingMission.recurrence !== 'none' && (
                      <span>{pendingMission.recurrence}</span>
                    )}
                  </div>
                  {pendingMission.checklistItems.length > 0 && (
                    <ol className="quick-link__mission-steps">
                      {pendingMission.checklistItems.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ol>
                  )}
                  <dl>
                    <div>
                      <dt>LOCKED FOUNDATION</dt>
                      <dd>
                        This changes only the separate Companion Order layer. Daily Missions and
                        their configured rewards remain untouched.
                      </dd>
                    </div>
                    <div>
                      <dt>COMPANION CHECK</dt>
                      <dd>{pendingMission.confirmation}</dd>
                    </div>
                  </dl>
                  <div className="quick-link__command-actions">
                    <button
                      type="button"
                      className="button button--primary"
                      disabled={executingAction}
                      onClick={() => void executePendingMission()}
                    >
                      {executingAction ? (
                        <LoaderCircle className="is-spinning" size={15} />
                      ) : (
                        <Check size={15} />
                      )}
                      Confirm order
                    </button>
                    <button
                      type="button"
                      className="button button--ghost"
                      disabled={executingAction}
                      onClick={() => {
                        void dismissPendingPreview(
                          () => setPendingMission(undefined),
                          'Mission preview dismissed. No record changed.',
                        );
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </section>
              )}

              {linkMode === 'command' && pendingOperation && (
                <section
                  className="quick-link__command quick-link__operation-command"
                  aria-live="polite"
                >
                  <header>
                    <span>
                      <Users size={15} /> COMPANION OPERATIONS
                    </span>
                    <small>PREPARATION PERMISSION</small>
                  </header>
                  <strong>{pendingOperationTitle}</strong>
                  <p>{pendingOperation.summary}</p>
                  <div className="quick-link__recipe-meta">
                    {pendingOperation.includeTraining && pendingOperation.trainingLocation && (
                      <span>{pendingOperation.trainingLocation} training</span>
                    )}
                    {pendingOperation.includeKitchen && <span>Kitchen included</span>}
                    {pendingOperation.includeSanctuary && (
                      <span>{pendingOperation.sanctuaryMode} Sanctuary</span>
                    )}
                  </div>
                  {pendingOperation.foodConstraints && (
                    <dl>
                      <div>
                        <dt>SAFFRON'S BOUNDARY</dt>
                        <dd>{pendingOperation.foodConstraints}</dd>
                      </div>
                    </dl>
                  )}
                  <dl>
                    <div>
                      <dt>WHAT THIS ALLOWS</dt>
                      <dd>
                        The companions may roll, create, and preload today's real section
                        assignments. They cannot complete work, check boxes, or award XP.
                      </dd>
                    </div>
                    <div>
                      <dt>SNOW'S CHECK</dt>
                      <dd>{pendingOperation.confirmation}</dd>
                    </div>
                  </dl>
                  <div className="quick-link__command-actions">
                    <button
                      type="button"
                      className="button button--primary"
                      disabled={executingAction}
                      onClick={() => void executePendingOperation()}
                    >
                      {executingAction ? (
                        <LoaderCircle className="is-spinning" size={15} />
                      ) : (
                        <Check size={15} />
                      )}
                      {pendingOperation.kind === 'assemble-day'
                        ? 'Wake the party'
                        : 'Prepare assignment'}
                    </button>
                    <button
                      type="button"
                      className="button button--ghost"
                      disabled={executingAction}
                      onClick={() => void dismissPendingOperation()}
                    >
                      Not yet
                    </button>
                  </div>
                </section>
              )}

              {linkMode === 'command' && pendingRecipe && (
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
                        void dismissPendingPreview(
                          () => setPendingRecipe(undefined),
                          'Recipe dismissed. Saffron changed nothing on this device.',
                        );
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </section>
              )}

              {linkMode === 'command' && pendingContent && (
                <section
                  className="quick-link__command quick-link__content-command"
                  aria-live="polite"
                >
                  <header>
                    <span>
                      <Radio size={15} /> VESPER'S CREATOR FORGE
                    </span>
                    <small>PREVIEW BEFORE SAVE</small>
                  </header>
                  <strong>{pendingContent.title}</strong>
                  <p>{pendingContent.audiencePromise}</p>
                  <div className="quick-link__recipe-meta">
                    <span>{pendingContent.platform.replace('-', ' ')}</span>
                    <span>{pendingContent.contentType.replace('-', ' ')}</span>
                    {pendingContent.pillar && <span>{pendingContent.pillar}</span>}
                  </div>
                  <dl>
                    <div>
                      <dt>HOOK</dt>
                      <dd>{pendingContent.hook || 'Still to be sharpened with Vesper.'}</dd>
                    </div>
                    <div>
                      <dt>NEXT ACTION</dt>
                      <dd>{pendingContent.nextAction || 'Define the smallest production move.'}</dd>
                    </div>
                    <div>
                      <dt>COMPANION CHECK</dt>
                      <dd>{pendingContent.confirmation}</dd>
                    </div>
                  </dl>
                  <div className="quick-link__command-actions">
                    <button
                      type="button"
                      className="button button--primary"
                      disabled={executingAction}
                      onClick={() => void savePendingContent()}
                    >
                      {executingAction ? (
                        <LoaderCircle className="is-spinning" size={15} />
                      ) : (
                        <Check size={15} />
                      )}
                      Add to Creator Forge
                    </button>
                    <button
                      type="button"
                      className="button button--ghost"
                      disabled={executingAction}
                      onClick={() => {
                        void dismissPendingPreview(
                          () => setPendingContent(undefined),
                          'Content draft dismissed. Creator Forge was not changed.',
                        );
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </section>
              )}

              {linkMode === 'command' && pendingCreatorUpdate && (
                <section
                  className="quick-link__command quick-link__content-command"
                  aria-live="polite"
                >
                  <header>
                    <span>
                      <Radio size={15} /> VESPER'S BOARD CONTROL
                    </span>
                    <small>EXACT PROJECT · PREVIEW</small>
                  </header>
                  <strong>{pendingCreatorUpdate.projectTitle}</strong>
                  <p>{pendingCreatorUpdate.confirmation}</p>
                  <div className="quick-link__recipe-meta">
                    {pendingCreatorUpdate.status && (
                      <span>stage → {pendingCreatorUpdate.status}</span>
                    )}
                    {pendingCreatorUpdate.nextAction && <span>next action updated</span>}
                    {pendingCreatorUpdate.notesAppend && <span>board note added</span>}
                  </div>
                  <dl>
                    {pendingCreatorUpdate.nextAction && (
                      <div>
                        <dt>NEXT ACTION</dt>
                        <dd>{pendingCreatorUpdate.nextAction}</dd>
                      </div>
                    )}
                    {pendingCreatorUpdate.notesAppend && (
                      <div>
                        <dt>APPENDED NOTE</dt>
                        <dd>{pendingCreatorUpdate.notesAppend}</dd>
                      </div>
                    )}
                  </dl>
                  <div className="quick-link__command-actions">
                    <button
                      type="button"
                      className="button button--primary"
                      disabled={executingAction}
                      onClick={() => void applyPendingCreatorUpdate()}
                    >
                      {executingAction ? (
                        <LoaderCircle className="is-spinning" size={15} />
                      ) : (
                        <Check size={15} />
                      )}
                      Update Creator Forge
                    </button>
                    <button
                      type="button"
                      className="button button--ghost"
                      disabled={executingAction}
                      onClick={() => {
                        void dismissPendingPreview(
                          () => setPendingCreatorUpdate(undefined),
                          'Board update dismissed. Creator Forge was not changed.',
                        );
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </section>
              )}

              {linkMode === 'command' && pendingArcNote && (
                <section className="quick-link__command" aria-live="polite">
                  <header>
                    <span>
                      <BookOpenCheck size={15} /> QUILL'S CANON VAULT
                    </span>
                    <small>NEW SOURCE · PREVIEW</small>
                  </header>
                  <strong>{pendingArcNote.title}</strong>
                  <p>{pendingArcNote.confirmation}</p>
                  <div className="quick-link__recipe-meta">
                    <span>{pendingArcNote.kind.replace('-', ' ')}</span>
                    <span>{pendingArcNote.characterNames.length} linked characters</span>
                    <span>{pendingArcNote.tags.length} tags</span>
                  </div>
                  <details>
                    <summary>Review the canon text</summary>
                    <p>{pendingArcNote.text}</p>
                    {pendingArcNote.characterNames.length > 0 && (
                      <p>
                        <strong>Characters:</strong> {pendingArcNote.characterNames.join(', ')}
                      </p>
                    )}
                    {pendingArcNote.tags.length > 0 && (
                      <p>
                        <strong>Tags:</strong> {pendingArcNote.tags.join(', ')}
                      </p>
                    )}
                  </details>
                  <div className="quick-link__command-actions">
                    <button
                      type="button"
                      className="button button--primary"
                      disabled={executingAction}
                      onClick={() => void savePendingArcNote()}
                    >
                      {executingAction ? (
                        <LoaderCircle className="is-spinning" size={15} />
                      ) : (
                        <Check size={15} />
                      )}
                      File in Canon Vault
                    </button>
                    <button
                      type="button"
                      className="button button--ghost"
                      disabled={executingAction}
                      onClick={() => {
                        void dismissPendingPreview(
                          () => setPendingArcNote(undefined),
                          'Canon note dismissed. Quill filed nothing.',
                        );
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </section>
              )}

              {linkMode === 'command' && pendingCampaign && (
                <section
                  className="quick-link__command quick-link__campaign-command"
                  aria-live="polite"
                >
                  <header>
                    <span>
                      <Sparkles size={15} /> VESPER'S REAWAKENING ARC
                    </span>
                    <small>ONE CONFIRMATION · FULL SEQUENCE</small>
                  </header>
                  <strong>{pendingCampaign.name}</strong>
                  <p>{pendingCampaign.strategy}</p>
                  <div className="quick-link__recipe-meta">
                    <span>{pendingCampaign.weeks} weeks</span>
                    <span>{pendingCampaign.operations.length} operations</span>
                    <span>local board</span>
                  </div>
                  <ol className="quick-link__campaign-list">
                    {pendingCampaign.operations.map((operation, index) => (
                      <li key={`${operation.title}-${index}`}>
                        <span>{index + 1}</span>
                        <div>
                          <strong>{operation.title}</strong>
                          <small>
                            {operation.platform.replace('-', ' ')} ·{' '}
                            {operation.contentType.replace('-', ' ')}
                          </small>
                          <p>{operation.nextAction}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                  <p className="quick-link__recipe-confirmation">{pendingCampaign.confirmation}</p>
                  <div className="quick-link__command-actions">
                    <button
                      type="button"
                      className="button button--primary"
                      disabled={executingAction}
                      onClick={() => void savePendingCampaign()}
                    >
                      {executingAction ? (
                        <LoaderCircle className="is-spinning" size={15} />
                      ) : (
                        <Check size={15} />
                      )}
                      Confirm full campaign
                    </button>
                    <button
                      type="button"
                      className="button button--ghost"
                      disabled={executingAction}
                      onClick={() => {
                        void dismissPendingPreview(
                          () => setPendingCampaign(undefined),
                          'Campaign dismissed. Creator Forge was not changed.',
                        );
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </section>
              )}

              {linkMode === 'command' && pendingCalendar && (
                <section
                  className="quick-link__command quick-link__calendar-command"
                  aria-live="polite"
                >
                  <header>
                    <span>
                      <CalendarCheck2 size={15} />{' '}
                      {pendingCalendarOwner === 'snow'
                        ? "SNOW + KAIRO'S SCHEDULE LINK"
                        : "KAIRO'S CALENDAR COMMAND"}
                    </span>
                    <small>PREVIEW · CONFIRMATION REQUIRED</small>
                  </header>
                  <strong>{pendingCalendar.title}</strong>
                  <p>{pendingCalendar.description || pendingCalendar.confirmation}</p>
                  <div className="quick-link__recipe-meta">
                    <span>{pendingCalendar.action}</span>
                    <span>{pendingCalendar.category}</span>
                    <span>
                      {pendingCalendar.allDay
                        ? new Intl.DateTimeFormat('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            timeZone: settings?.timeZone,
                          }).format(new Date(pendingCalendar.startAt))
                        : new Intl.DateTimeFormat('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                            timeZone: settings?.timeZone,
                          }).format(new Date(pendingCalendar.startAt))}
                    </span>
                    {pendingCalendar.recurrence !== 'none' && (
                      <span>
                        every{' '}
                        {pendingCalendar.recurrenceInterval > 1
                          ? `${pendingCalendar.recurrenceInterval} `
                          : ''}
                        {pendingCalendar.recurrence.replace('ly', '')}
                      </span>
                    )}
                  </div>
                  <dl>
                    <div>
                      <dt>TIME WINDOW</dt>
                      <dd>
                        {pendingCalendar.allDay
                          ? 'Protected for the complete day'
                          : `${new Intl.DateTimeFormat('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                              timeZone: settings?.timeZone,
                            }).format(new Date(pendingCalendar.startAt))}–${new Intl.DateTimeFormat(
                              'en-US',
                              {
                                hour: 'numeric',
                                minute: '2-digit',
                                timeZone: settings?.timeZone,
                              },
                            ).format(new Date(pendingCalendar.endAt))}`}
                      </dd>
                    </div>
                    {pendingCalendar.location && (
                      <div>
                        <dt>LOCATION</dt>
                        <dd>{pendingCalendar.location}</dd>
                      </div>
                    )}
                    <div>
                      <dt>COMPANION CHECK</dt>
                      <dd>{pendingCalendar.confirmation}</dd>
                    </div>
                  </dl>
                  <div className="quick-link__command-actions">
                    <button
                      type="button"
                      className="button button--primary"
                      disabled={executingAction}
                      onClick={() => void savePendingCalendar()}
                    >
                      {executingAction ? (
                        <LoaderCircle className="is-spinning" size={15} />
                      ) : (
                        <Check size={15} />
                      )}
                      {pendingCalendar.action === 'cancel'
                        ? 'Confirm cancellation'
                        : pendingCalendar.action === 'update'
                          ? 'Confirm changes'
                          : 'Add to Calendar'}
                    </button>
                    <button
                      type="button"
                      className="button button--ghost"
                      disabled={executingAction}
                      onClick={() => {
                        void dismissPendingPreview(
                          () => setPendingCalendar(undefined),
                          'Calendar preview dismissed. No schedule record changed.',
                        );
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </section>
              )}

              <p className="quick-link__notice">{notice}</p>

              {linkMode === 'command' && (
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
              )}

              <footer>
                <span>
                  <Users size={14} />{' '}
                  {continuityTurns
                    ? `${continuityTurns} recent messages linked`
                    : linkMode === 'live'
                      ? 'Party Council remains available in Command Link'
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
