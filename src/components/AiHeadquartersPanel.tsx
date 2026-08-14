import {
  ArrowUpRight,
  BookmarkCheck,
  BrainCircuit,
  Check,
  ChevronDown,
  Headphones,
  LoaderCircle,
  LockKeyhole,
  MessageCircleMore,
  Mic,
  Pause,
  Play,
  Plus,
  Radio,
  Send,
  ShieldCheck,
  SkipForward,
  Sparkles,
  Square,
  Trash2,
  Users,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { AiVoiceLinkPanel } from '@/components/AiVoiceLinkPanel';
import { AiSoulprintStudio } from '@/components/AiSoulprintStudio';
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
import { hasAiVoiceSummary } from '@/game/aiVoice';
import { buildAiProgressContext } from '@/game/aiContext';
import {
  clearPendingAiProposal,
  extractAiPendingProposal,
  getPendingAiProposal,
  savePendingAiProposal,
  type AiPendingProposal,
} from '@/game/aiPendingProposals';
import { buildQuickLinkActionCatalog, commandSuccessAcknowledgement } from '@/game/aiQuickLink';
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
  prepareCompanionOperation,
  stageCompanionOperation,
  synchronizeKitchenOperation,
} from '@/game/dailyOperations';
import { assignSpecificKitchenOrder } from '@/game/kitchen';
import { deleteCustomKitchenRecipe, saveCustomKitchenRecipe } from '@/game/kitchenGrimoire';
import {
  getAiLinkStatus,
  requestAiHeadquartersReply,
  type AiLinkStatus,
} from '@/services/aiHeadquarters';
import { useGameStore } from '@/store/useGameStore';
import { useAiVoiceLink } from '@/hooks/useAiVoiceLink';
import { formatClassName } from '@/utils/format';
import { sanitizeSensitiveDisplayText } from '@/utils/privacy';
import { scrollChatViewportToBottom } from '@/utils/scroll';
import type { AiConversation, AiConversationAudience, AiRelationshipMemory } from '@/types/game';

export function AiHeadquartersPanel() {
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
  const [pendingProposal, setPendingProposal] = useState<AiPendingProposal>();
  const [pendingHandoff, setPendingHandoff] =
    useState<
      NonNullable<Awaited<ReturnType<typeof requestAiHeadquartersReply>>['handoffProposal']>
    >();
  const [executingProposal, setExecutingProposal] = useState(false);
  const messageListRef = useRef<HTMLDivElement>(null);
  const voiceLink = useAiVoiceLink({
    settings,
    refresh,
    onTranscript: (text) =>
      setDraft((current) => `${current.trim()}${current.trim() ? ' ' : ''}${text}`.slice(0, 4_000)),
    onNotice: setNotice,
  });

  const activeConversation = conversations.find((item) => item.id === activeId);
  const enabledCompanions = useMemo(() => {
    const enabled = new Set(settings?.enabledCompanionIds ?? []);
    return COMPANIONS.filter((companion) => enabled.has(companion.id));
  }, [settings?.enabledCompanionIds]);
  const actionCatalog = useMemo(
    () => buildQuickLinkActionCatalog(missions, todayRecords),
    [missions, todayRecords],
  );

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
    const update = (event: Event) => {
      const conversationId = (event as CustomEvent<{ id?: string }>).detail?.id;
      void getRecentAiConversations().then((items) => {
        setConversations(items);
        if (conversationId && items.some((item) => item.id === conversationId)) {
          setActiveId(conversationId);
        }
      });
    };
    window.addEventListener('system:ai-conversations-changed', update);
    return () => window.removeEventListener('system:ai-conversations-changed', update);
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

  useEffect(() => {
    let active = true;
    setPendingHandoff(undefined);
    if (!activeId) {
      setPendingProposal(undefined);
      return () => {
        active = false;
      };
    }
    setPendingProposal(undefined);
    void getPendingAiProposal(activeId).then((proposal) => {
      if (active) setPendingProposal(proposal);
    });
    return () => {
      active = false;
    };
  }, [activeId]);

  if (!profile || !settings || !progression || !activeConversation) return null;

  const currentProfile = profile;
  const currentProgression = progression;
  const currentConversation = activeConversation;
  const currentSettings = settings;
  let latestHunterIndex = -1;
  for (let index = currentConversation.messages.length - 1; index >= 0; index -= 1) {
    if (currentConversation.messages[index].role === 'hunter') {
      latestHunterIndex = index;
      break;
    }
  }
  const latestCompanionMessages = currentConversation.messages
    .slice(latestHunterIndex + 1)
    .filter((message) => message.role === 'companion' && message.companionId);

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

  async function setTreasurySharingEnabled(enabled: boolean) {
    await db.settings.update('primary', { aiTreasurySharingEnabled: enabled });
    await refresh();
    setNotice(
      enabled
        ? 'Cassian Ledger Counsel enabled. Only calculated totals and targets may enter his context.'
        : 'Cassian Ledger Counsel paused. No Treasury figures will be included online.',
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
    setPendingHandoff(undefined);
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

  async function sendMessage() {
    const message = draft.trim();
    if (!message || sending || !linkReady) return;
    if (
      pendingProposal &&
      /^(?:yes[, ]*)?(?:i\s+)?(?:confirm|approve|do it|apply it|save it)[.! ]*$/i.test(message)
    ) {
      const hunterMessage = createHunterMessage(message);
      const confirmationConversation: AiConversation = {
        ...currentConversation,
        updatedAt: hunterMessage.createdAt,
        messages: [...currentConversation.messages, hunterMessage],
      };
      setDraft('');
      await updateConversation(confirmationConversation);
      await executePendingProposal(confirmationConversation);
      return;
    }
    if (pendingProposal) {
      if (pendingProposal.kind === 'operation') {
        await cancelStagedCompanionOperation(systemDate);
      }
      await clearPendingAiProposal(currentConversation.id);
      setPendingProposal(undefined);
    }
    setSending(true);
    setNotice('');
    setPendingHandoff(undefined);
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
        context: await buildAiProgressContext({
          audience: currentConversation.audience,
          profile: currentProfile,
          settings: currentSettings,
          progression: currentProgression,
          missions,
          todayRecords,
          stats,
          challenges,
          systemDate,
          enabledCompanionIds: enabledCompanions.map((companion) => companion.id),
          query: message,
          history: currentConversation.messages,
        }),
        commandMode: 'propose',
      });
      void voiceLink.trackTextUsage(result).catch(() => undefined);
      const memoryAdditions = currentSettings.aiRelationshipMemoryEnabled
        ? await saveAiMemoryCandidates(
            result.memoryCandidates,
            currentConversation.audience,
            currentConversation.id,
          )
        : [];
      const replyTime = new Date().toISOString();
      const replyMessages = result.replies.map((reply) =>
        createCompanionMessage(reply.companionId, reply.message, replyTime, reply.voiceSummary),
      );
      const completedConversation: AiConversation = {
        ...pendingConversation,
        title: result.title,
        updatedAt: replyTime,
        messages: [...pendingConversation.messages, ...replyMessages],
      };
      await updateConversation(completedConversation);
      const proposal = extractAiPendingProposal(
        result,
        actionCatalog,
        currentConversation.audience,
      );
      if (proposal) {
        if (proposal.kind === 'operation') {
          await stageCompanionOperation(systemDate, proposal.payload, completedConversation.id);
        }
        await savePendingAiProposal(completedConversation.id, proposal);
        setPendingProposal(proposal);
        setNotice('Action preview prepared. Nothing changes until you confirm it below.');
      } else if (result.handoffProposal) {
        setPendingHandoff(result.handoffProposal);
        setNotice(
          `${getCompanion(result.handoffProposal.companionId).name} is ready to receive the specialist brief.`,
        );
      }
      if (currentSettings.aiVoiceOutputEnabled && currentSettings.aiVoiceAutoPlay) {
        void voiceLink.playMessages(replyMessages);
      }
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

  async function appendVerifiedAcknowledgement(
    conversation: AiConversation,
    companionId: AiPendingProposal['ownerId'],
    message: string,
  ) {
    const acknowledgement = createCompanionMessage(companionId, message);
    const updated: AiConversation = {
      ...conversation,
      updatedAt: acknowledgement.createdAt,
      messages: [...conversation.messages, acknowledgement],
    };
    await updateConversation(updated);
    if (currentSettings.aiVoiceOutputEnabled && currentSettings.aiVoiceAutoPlay) {
      void voiceLink.playMessages([acknowledgement]);
    }
  }

  async function executePendingProposal(conversation = currentConversation) {
    if (!pendingProposal || executingProposal) return;
    setExecutingProposal(true);
    let applied = false;
    try {
      let acknowledgement = '';
      if (pendingProposal.kind === 'command') {
        const { action } = pendingProposal.payload;
        if (action.kind === 'complete_mission') await complete(action.missionId);
        else if (action.kind === 'skip_mission') await updateStatus(action.missionId, 'skipped');
        else if (action.kind === 'fail_mission') await updateStatus(action.missionId, 'failed');
        else if (action.kind === 'reopen_mission') await undo(action.missionId);
        else await updateStatus(action.missionId, 'pending');
        acknowledgement = commandSuccessAcknowledgement(pendingProposal.ownerId, action);
      } else if (pendingProposal.kind === 'operation') {
        const record = await prepareCompanionOperation(
          systemDate,
          pendingProposal.payload,
          conversation.id,
        );
        const prepared = [
          record.training?.label,
          record.kitchen?.label,
          record.sanctuary?.label,
        ].filter(Boolean);
        let kitchenBoundary = '';
        const constraint = pendingProposal.payload.foodConstraints?.trim();
        const meaningfulConstraint =
          constraint &&
          !['none', 'no', 'no restrictions', 'nothing', 'anything is fine'].includes(
            constraint.toLowerCase(),
          );
        const includesKitchen =
          pendingProposal.payload.kind === 'prepare-kitchen' ||
          (pendingProposal.payload.kind === 'assemble-day' &&
            pendingProposal.payload.includeKitchen);
        if (meaningfulConstraint && includesKitchen && record.kitchen?.state !== 'completed') {
          try {
            const review = await requestAiHeadquartersReply({
              audience: 'saffron',
              message: `The Hunter confirmed today's preparation. Review the current Kitchen Order against this exact boundary: "${constraint}". If the order satisfies it, return no recipe. If it conflicts, prepare one complete practical replacement recipe that satisfies the boundary. Do not return another Companion Operation.`,
              history: conversation.messages,
              context: await buildAiProgressContext({
                audience: 'saffron',
                profile: currentProfile,
                settings: currentSettings,
                progression: currentProgression,
                missions,
                todayRecords,
                stats,
                challenges,
                systemDate,
                enabledCompanionIds: enabledCompanions.map((companion) => companion.id),
                query: constraint,
                history: conversation.messages,
              }),
              commandMode: 'propose',
            });
            void voiceLink.trackTextUsage(review).catch(() => undefined);
            if (review.recipeProposal) {
              let replacementId: string | undefined;
              try {
                const replacement = await saveCustomKitchenRecipe(review.recipeProposal);
                replacementId = replacement.id;
                await assignSpecificKitchenOrder(systemDate, replacement.id);
                await synchronizeKitchenOperation(systemDate, constraint);
                kitchenBoundary = ` Saffron replaced the conflicting roll with ${replacement.name}, which preserves “${constraint}.”`;
              } catch (error) {
                if (replacementId) {
                  await deleteCustomKitchenRecipe(replacementId).catch(() => undefined);
                }
                throw error;
              }
            } else {
              kitchenBoundary = ` Saffron checked the rolled order against “${constraint}” and kept it.`;
            }
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Boundary review failed.';
            await addDailyOperationNote(systemDate, `Kitchen constraint review: ${message}`);
            kitchenBoundary = ` The “${constraint}” Kitchen boundary is visibly flagged because Saffron could not safely finish the replacement check; no conflicting recipe was forced.`;
          }
        }
        acknowledgement = record.preparationNotes.length
          ? `The preparation is saved with ${record.preparationNotes.length} visible flag${record.preparationNotes.length === 1 ? '' : 's'}. I preserved every existing assignment instead of forcing a replacement.${kitchenBoundary}`
          : `${prepared.join(', ')} ${prepared.length === 1 ? 'is' : 'are'} loaded in the proper section${prepared.length === 1 ? '' : 's'}. Nothing was completed and no XP was awarded.${kitchenBoundary}`;
      } else if (pendingProposal.kind === 'recipe') {
        const recipe = await saveCustomKitchenRecipe(pendingProposal.payload);
        acknowledgement = `${recipe.name} is now in the Private Grimoire and Daily Rotation. Open Kitchen whenever you want Saffron's full cooking checklist.`;
      } else if (pendingProposal.kind === 'content') {
        const content = await saveCreatorProject({
          ...pendingProposal.payload,
          status: 'idea',
        });
        acknowledgement = `“${content.title}” is now on the Creator Forge board. The recorded next move is ${content.nextAction || 'one honest production step'}.`;
      } else if (pendingProposal.kind === 'campaign') {
        const projects = await saveCreatorCampaign(pendingProposal.payload.operations);
        acknowledgement = `${pendingProposal.payload.name} is now on Creator Forge: ${projects.length} real operations in one sequence. Start with ${projects[0]?.nextAction || 'the first physical move'}.`;
      } else if (pendingProposal.kind === 'creator-update') {
        const project = await applyCreatorProjectUpdate({
          projectId: pendingProposal.payload.projectId,
          status: pendingProposal.payload.status || undefined,
          nextAction: pendingProposal.payload.nextAction || undefined,
          notesAppend: pendingProposal.payload.notesAppend || undefined,
        });
        acknowledgement = `“${project.title}” is actually updated on Creator Forge now. Stage: ${project.status}. Next move: ${project.nextAction || 'define the next physical production step'}.`;
      } else if (pendingProposal.kind === 'arc-note') {
        const source = await saveArcCanonSource(pendingProposal.payload);
        acknowledgement = `“${source.title}” is now a real Canon Vault source. Quill can retrieve it in future Story Room sessions because the Hunter confirmed the local filing.`;
      } else {
        const event = await applyCalendarProposal(pendingProposal.payload, pendingProposal.ownerId);
        const linked = event.linkedCompanionId ? getCompanion(event.linkedCompanionId) : undefined;
        acknowledgement = `${event.title} is now ${event.status === 'canceled' ? 'canceled' : 'secured'} in Calendar Command.${linked ? ` ${linked.name} is linked to the time block; the actual ${event.linkedRealm ?? 'realm'} assignment still begins in its own section.` : ''}`;
      }
      applied = true;
      await clearPendingAiProposal(conversation.id);
      const completed = pendingProposal;
      setPendingProposal(undefined);
      await appendVerifiedAcknowledgement(conversation, completed.ownerId, acknowledgement);
      await refresh();
      setNotice(
        'Confirmed locally. The acknowledgement was written only after the save succeeded.',
      );
    } catch (error) {
      setNotice(
        applied
          ? 'The action was saved locally, but its companion acknowledgement could not be written.'
          : error instanceof Error
            ? error.message
            : 'That action could not be applied.',
      );
    } finally {
      setExecutingProposal(false);
    }
  }

  async function dismissPendingProposal() {
    if (!pendingProposal || executingProposal) return;
    try {
      if (pendingProposal.kind === 'operation') {
        await cancelStagedCompanionOperation(systemDate);
      }
      await clearPendingAiProposal(currentConversation.id);
      setPendingProposal(undefined);
      setNotice('Preview dismissed. Existing records remain untouched.');
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : 'That preview could not be safely dismissed.',
      );
    }
  }

  function pendingProposalCopy(proposal: AiPendingProposal) {
    if (proposal.kind === 'command') {
      return {
        eyebrow: 'SYSTEM COMMAND',
        title: proposal.payload.action.label,
        summary: proposal.payload.proposal.summary,
        confirmation: proposal.payload.proposal.confirmation,
      };
    }
    if (proposal.kind === 'operation') {
      return {
        eyebrow: 'PARTY OPERATION',
        title: proposal.payload.kind.replaceAll('-', ' '),
        summary: proposal.payload.summary,
        confirmation: proposal.payload.confirmation,
      };
    }
    if (proposal.kind === 'recipe') {
      return {
        eyebrow: 'PRIVATE GRIMOIRE',
        title: proposal.payload.name,
        summary: `${proposal.payload.servings} servings · ${proposal.payload.prepMinutes + proposal.payload.cookMinutes} minutes · ${proposal.payload.ingredients.length} ingredients`,
        confirmation: proposal.payload.confirmation,
      };
    }
    if (proposal.kind === 'content') {
      return {
        eyebrow: 'CREATOR FORGE',
        title: proposal.payload.title,
        summary: `${proposal.payload.contentType} · Next: ${proposal.payload.nextAction}`,
        confirmation: proposal.payload.confirmation,
      };
    }
    if (proposal.kind === 'campaign') {
      return {
        eyebrow: 'REAWAKENING CAMPAIGN',
        title: proposal.payload.name,
        summary: `${proposal.payload.weeks} weeks · ${proposal.payload.operations.length} operations · ${proposal.payload.strategy}`,
        confirmation: proposal.payload.confirmation,
      };
    }
    if (proposal.kind === 'creator-update') {
      return {
        eyebrow: 'CREATOR BOARD CONTROL',
        title: proposal.payload.projectTitle,
        summary: [
          proposal.payload.status && `Stage → ${proposal.payload.status}`,
          proposal.payload.nextAction && `Next: ${proposal.payload.nextAction}`,
          proposal.payload.notesAppend && 'Append one board note',
        ]
          .filter(Boolean)
          .join(' · '),
        confirmation: proposal.payload.confirmation,
      };
    }
    if (proposal.kind === 'arc-note') {
      return {
        eyebrow: 'CANON VAULT FILING',
        title: proposal.payload.title,
        summary: `${proposal.payload.kind.replace('-', ' ')} · ${proposal.payload.characterNames.length} linked characters · ${proposal.payload.tags.length} tags`,
        confirmation: proposal.payload.confirmation,
      };
    }
    return {
      eyebrow: 'CALENDAR COMMAND',
      title: proposal.payload.title,
      summary: `${proposal.payload.action} · ${new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: proposal.payload.allDay ? undefined : 'short',
        timeZone: currentSettings.timeZone,
      }).format(new Date(proposal.payload.startAt))}`,
      confirmation: proposal.payload.confirmation,
    };
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
    <section
      id="ai-headquarters"
      className="ai-headquarters panel"
      aria-labelledby="ai-headquarters-title"
    >
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
                When you press Send, only your first name, message, up to 16 recent chat messages, a
                compact Class roadmap, recent progress counters, mission and stat signals, and the
                Director's Notes for the companions you called go to OpenAI. Journals, Kitchen
                notes, itemized Treasury records, and your save file stay local. Bond Memory and
                Cassian Ledger Counsel remain off until you enable them separately.
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

      {onlineMode && (
        <section
          className={`ai-ledger-counsel ${currentSettings.aiTreasurySharingEnabled ? 'is-enabled' : ''}`}
        >
          <span className="ai-ledger-counsel__icon">
            <ShieldCheck size={19} />
          </span>
          <span>
            <strong>Cassian Ledger Counsel</strong>
            <small>
              {currentSettings.aiTreasurySharingEnabled
                ? 'Enabled · calculated totals and targets only'
                : 'Private by default · no Treasury figures leave this device'}
            </small>
            <p>
              When enabled, Cassian can reason from 30-day income and spending totals, current
              targets, debt totals, and savings progress. Labels, notes, merchants, bill names, debt
              names, and individual transactions are never included.
            </p>
          </span>
          <button
            className="button button--secondary"
            type="button"
            onClick={() => setTreasurySharingEnabled(!currentSettings.aiTreasurySharingEnabled)}
          >
            {currentSettings.aiTreasurySharingEnabled ? 'Pause counsel' : 'Enable counsel'}
          </button>
        </section>
      )}

      <AiSoulprintStudio settings={currentSettings} refresh={refresh} onNotice={setNotice} />

      {onlineMode && (
        <AiVoiceLinkPanel
          settings={currentSettings}
          profiles={voiceLink.profiles}
          usage={voiceLink.usage}
          status={status}
          cartesiaVoices={voiceLink.cartesiaVoices}
          cartesiaCatalogLoading={voiceLink.cartesiaCatalogLoading}
          cartesiaCatalogError={voiceLink.cartesiaCatalogError}
          voiceBusyMessageId={voiceLink.voiceBusyMessageId}
          onEnable={voiceLink.enableVoiceOutput}
          onToggleOutput={voiceLink.setVoiceOutputEnabled}
          onToggleAutoPlay={voiceLink.setAutoPlay}
          onSetWarning={voiceLink.setUsageWarning}
          onSetProvider={voiceLink.setVoiceProvider}
          onSetCartesiaPlan={voiceLink.setCartesiaPlan}
          onLoadCartesiaVoices={voiceLink.loadCartesiaVoices}
          onSaveProfile={voiceLink.saveProfile}
          onResetProfile={voiceLink.resetProfile}
          onPreview={voiceLink.previewProfile}
          onTestSpeaker={voiceLink.testSpeakerOutput}
        />
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
              <div className="ai-message-stage__identity">
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
              <div className="ai-message-stage__signals">
                <span>
                  <MessageCircleMore size={14} /> LIVING BOND ACTIVE
                </span>
                {latestCompanionMessages.length > 0 && currentSettings.aiVoiceOutputEnabled && (
                  <div className="ai-roundtable-controls">
                    {voiceLink.roundtableActive ? (
                      <>
                        <button type="button" onClick={voiceLink.togglePause}>
                          {voiceLink.playbackPaused ? <Play size={14} /> : <Pause size={14} />}
                          {voiceLink.playbackPaused ? 'Resume' : 'Pause'}
                        </button>
                        <button type="button" onClick={voiceLink.skipCurrent}>
                          <SkipForward size={14} /> Skip
                        </button>
                        <button type="button" onClick={voiceLink.stopPlayback}>
                          <Square size={13} /> Stop
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => voiceLink.playMessages(latestCompanionMessages)}
                      >
                        <Headphones size={14} />
                        {latestCompanionMessages.length > 1
                          ? 'Play briefings'
                          : hasAiVoiceSummary(latestCompanionMessages[0])
                            ? 'Play briefing'
                            : 'Play reply'}
                      </button>
                    )}
                  </div>
                )}
              </div>
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
                      <p>{sanitizeSensitiveDisplayText(message.message)}</p>
                      {companion && currentSettings.aiVoiceOutputEnabled && (
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
                              <LoaderCircle className="is-spinning" size={14} />
                            ) : voiceLink.playingMessageId === message.id ? (
                              <Square size={12} />
                            ) : (
                              <Play size={13} />
                            )}
                            {voiceLink.voiceBusyMessageId === message.id
                              ? 'Forging voice…'
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
                                  voiceLink.playMessages([message], undefined, { fullText: true })
                                }
                                disabled={Boolean(voiceLink.voiceBusyMessageId)}
                              >
                                <Headphones size={13} /> Play full
                              </button>
                            )}
                        </div>
                      )}
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

            {pendingHandoff && (
              <section className="ai-proposal-card" aria-live="polite">
                <header>
                  <span>
                    <ArrowUpRight size={16} /> PARTY RELAY
                  </span>
                  <small>ONE-TAP SPECIALIST HANDOFF</small>
                </header>
                <div className="ai-proposal-card__identity">
                  <img
                    src={getCompanionImage(getCompanion(pendingHandoff.companionId).image)}
                    alt=""
                  />
                  <div>
                    <strong>{getCompanion(pendingHandoff.companionId).name}</strong>
                    <small>Receives the exact brief · no hidden action</small>
                  </div>
                </div>
                <p>{pendingHandoff.summary}</p>
                <blockquote>{pendingHandoff.prompt}</blockquote>
                <div>
                  <button
                    className="button button--primary"
                    type="button"
                    onClick={() => {
                      const relay = pendingHandoff;
                      void startConversation(relay.companionId).then(() => {
                        setDraft(relay.prompt);
                        setPendingHandoff(undefined);
                        setNotice(
                          `${getCompanion(relay.companionId).name}'s direct link has the full brief.`,
                        );
                      });
                    }}
                  >
                    <ArrowUpRight size={16} /> Open specialist brief
                  </button>
                  <button
                    className="button button--ghost"
                    type="button"
                    onClick={() => setPendingHandoff(undefined)}
                  >
                    Stay here
                  </button>
                </div>
              </section>
            )}

            {pendingProposal &&
              (() => {
                const copy = pendingProposalCopy(pendingProposal);
                const owner = getCompanion(pendingProposal.ownerId);
                return (
                  <section
                    className="ai-proposal-card"
                    style={{ '--companion-accent': owner.accent } as CSSProperties}
                    aria-live="polite"
                  >
                    <header>
                      <span>
                        <ShieldCheck size={16} /> {copy.eyebrow}
                      </span>
                      <small>CONFIRMATION REQUIRED</small>
                    </header>
                    <div className="ai-proposal-card__identity">
                      <img src={getCompanionImage(owner.image)} alt="" />
                      <div>
                        <strong>{copy.title}</strong>
                        <small>Prepared by {owner.name} · still only a preview</small>
                      </div>
                    </div>
                    <p>{copy.summary}</p>
                    {pendingProposal.kind === 'campaign' && (
                      <ol>
                        {pendingProposal.payload.operations.map((operation) => (
                          <li key={`${operation.title}-${operation.contentType}`}>
                            <strong>{operation.title}</strong>
                            <span>{operation.nextAction}</span>
                          </li>
                        ))}
                      </ol>
                    )}
                    <blockquote>{copy.confirmation}</blockquote>
                    <div>
                      <button
                        className="button button--primary"
                        type="button"
                        disabled={executingProposal}
                        onClick={() => void executePendingProposal()}
                      >
                        {executingProposal ? (
                          <LoaderCircle className="is-spinning" size={16} />
                        ) : (
                          <Check size={16} />
                        )}
                        Confirm and apply
                      </button>
                      <button
                        className="button button--ghost"
                        type="button"
                        disabled={executingProposal}
                        onClick={() => void dismissPendingProposal()}
                      >
                        Dismiss preview
                      </button>
                    </div>
                    <small>
                      A companion reply cannot save this. Only this verified local confirmation can.
                    </small>
                  </section>
                );
              })()}

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
                <small>
                  {voiceLink.recording
                    ? `Listening · ${voiceLink.recordingSeconds.toFixed(1)}s / 60s`
                    : voiceLink.transcribing
                      ? 'Transcribing voice…'
                      : `${draft.length.toLocaleString()} / 4,000 · Stored locally`}
                </small>
                <button
                  className={`ai-composer__mic ${voiceLink.recording ? 'is-recording' : ''}`}
                  type="button"
                  onClick={voiceLink.recording ? voiceLink.stopRecording : voiceLink.startRecording}
                  disabled={!linkReady || sending || voiceLink.transcribing}
                  aria-label={voiceLink.recording ? 'Stop recording' : 'Speak message'}
                >
                  {voiceLink.transcribing ? (
                    <LoaderCircle className="is-spinning" size={17} />
                  ) : voiceLink.recording ? (
                    <Square size={14} />
                  ) : (
                    <Mic size={17} />
                  )}
                  {voiceLink.recording ? 'Stop' : 'Speak'}
                </button>
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
