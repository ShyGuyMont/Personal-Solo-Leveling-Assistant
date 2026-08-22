import {
  Archive,
  ArrowRight,
  BookHeart,
  BookOpenCheck,
  BrainCircuit,
  CalendarClock,
  Castle,
  ChefHat,
  ChevronDown,
  CircleCheckBig,
  Crown,
  Dumbbell,
  Map as MapIcon,
  MessageCircleMore,
  Radio,
  Send,
  ShieldAlert,
  Sparkles,
  WalletCards,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { getCompanion } from '@/config/companions';
import { listPendingAiProposals, type AiPendingProposal } from '@/game/aiPendingProposals';
import { listPendingAiTransmissions } from '@/game/aiTransmissions';
import { getDailyOperations } from '@/game/dailyOperations';
import { getPartyPulseSignals } from '@/game/partyPulse';
import { getLocalClockTime, getSystemDebrief, isSystemDebriefDue } from '@/game/systemDebrief';
import { Link } from '@/router';
import { useGameStore } from '@/store/useGameStore';
import type {
  CompanionId,
  DailyMissionRecord,
  DailyOperationsRecord,
  MissionDefinition,
} from '@/types/game';

const MISSION_ROUTES: Record<string, string> = {
  workout: '/training-hall',
  bible: '/sanctuary',
  prayer: '/sanctuary',
  'creator-work': '/creator-forge',
};

const PROPOSAL_LABELS: Record<AiPendingProposal['kind'], string> = {
  command: 'protected command',
  operation: 'party operation',
  mission: 'companion mission',
  recipe: 'Kitchen Order',
  content: 'Creator Forge entry',
  campaign: 'Reawakening campaign',
  calendar: 'calendar change',
  'creator-update': 'Creator Forge update',
  'arc-note': 'Canon Vault note',
};

function missionRoute(mission: MissionDefinition | undefined) {
  if (!mission) return '/missions';
  return MISSION_ROUTES[mission.id] ?? '/missions';
}

function realmStateLabel(state: string | undefined) {
  if (state === 'completed') return 'Cleared';
  if (state === 'active') return 'Resume';
  if (state === 'changed') return 'Review';
  return 'Ready';
}

function openQuickLink(companionId: CompanionId, initialDraft?: string) {
  window.dispatchEvent(
    new CustomEvent('system:open-quick-link', { detail: { companionId, initialDraft } }),
  );
}

export function SystemCommandCenter() {
  const { missions, todayRecords, stats, settings, systemDate } = useGameStore();
  const [operations, setOperations] = useState<DailyOperationsRecord>();
  const [pendingProposal, setPendingProposal] = useState<{
    conversationId: string;
    proposal: AiPendingProposal;
  }>();
  const [proposalCount, setProposalCount] = useState(0);
  const [transmissionCount, setTransmissionCount] = useState(0);
  const [debriefDue, setDebriefDue] = useState(false);

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      const [nextOperations, proposals, transmissions] = await Promise.all([
        getDailyOperations(systemDate),
        listPendingAiProposals(),
        listPendingAiTransmissions(),
      ]);
      if (!active) return;
      setOperations(nextOperations);
      setPendingProposal(proposals[0]);
      setProposalCount(proposals.length);
      setTransmissionCount(transmissions.length);
    };
    void refresh().catch(() => undefined);
    const refreshDebrief = async () => {
      const report = await getSystemDebrief(systemDate);
      const localTime = getLocalClockTime(new Date(), settings?.timeZone ?? 'America/New_York');
      if (active)
        setDebriefDue(isSystemDebriefDue(localTime, report?.status === 'council-complete'));
    };
    void refreshDebrief().catch(() => undefined);
    const debriefTimer = window.setInterval(() => void refreshDebrief(), 60_000);
    window.addEventListener('system:daily-operations-changed', refresh);
    window.addEventListener('system:ai-proposal-changed', refresh);
    window.addEventListener('system:debrief-changed', refreshDebrief);
    return () => {
      active = false;
      window.removeEventListener('system:daily-operations-changed', refresh);
      window.removeEventListener('system:ai-proposal-changed', refresh);
      window.removeEventListener('system:debrief-changed', refreshDebrief);
      window.clearInterval(debriefTimer);
    };
  }, [systemDate, todayRecords, settings?.timeZone]);

  const missionMap = useMemo(
    () => new Map(missions.map((mission) => [mission.id, mission])),
    [missions],
  );
  const pendingRecords = todayRecords.filter((record) => record.status === 'pending');
  const completedCount = todayRecords.filter((record) => record.status === 'completed').length;
  const nextRecord: DailyMissionRecord | undefined =
    pendingRecords.find((record) => !missionMap.get(record.missionId)?.optional) ??
    pendingRecords[0];
  const nextMission = nextRecord ? missionMap.get(nextRecord.missionId) : undefined;
  const partySignals =
    settings && !settings.recoveryMode.active
      ? getPartyPulseSignals(stats, settings.enabledCompanionIds).length
      : 0;
  const preparedRealms = [operations?.training, operations?.kitchen, operations?.sanctuary].filter(
    Boolean,
  ).length;
  const proposalOwner = pendingProposal
    ? getCompanion(pendingProposal.proposal.ownerId)
    : undefined;

  return (
    <section className="panel system-command-center" data-depth-surface="panel">
      <header className="system-command-center__header">
        <div>
          <p className="eyebrow">SYSTEM COMMAND CENTER</p>
          <h2>One board. Twelve specialists. Your next move stays clear.</h2>
          <p>
            Snow coordinates the party here without replacing the Training Hall, Kitchen, Sanctuary,
            Creator Forge, or any of their real completion rules.
          </p>
        </div>
        <span className="system-command-center__online">
          <i /> COMMAND NETWORK ONLINE
        </span>
      </header>

      <div className="system-command-center__status">
        <div>
          <CircleCheckBig size={18} />
          <span>Daily directives</span>
          <strong>
            {completedCount}/{todayRecords.length}
          </strong>
        </div>
        <div>
          <Sparkles size={18} />
          <span>Prepared realms</span>
          <strong>{preparedRealms}</strong>
        </div>
        <div className={pendingProposal ? 'has-attention' : ''}>
          <ShieldAlert size={18} />
          <span>Awaiting confirmation</span>
          <strong>{proposalCount}</strong>
        </div>
        <div className={partySignals ? 'has-attention' : ''}>
          <MessageCircleMore size={18} />
          <span>Party signals</span>
          <strong>{partySignals}</strong>
        </div>
      </div>

      <div className="system-command-center__grid">
        <article className="system-command-center__next">
          <span className="system-command-center__designation">NEXT BEST ACTION</span>
          {nextMission ? (
            <>
              <h3>{nextMission.name}</h3>
              <p>{nextMission.customDescription ?? nextMission.description}</p>
              <Link className="button button--primary" to={missionRoute(nextMission)}>
                Open assignment <ArrowRight size={16} />
              </Link>
            </>
          ) : (
            <>
              <h3>Daily board cleared.</h3>
              <p>
                Your available directives are answered. Review the party or continue an optional
                path.
              </p>
              <Link className="button button--primary" to="/headquarters">
                Open Headquarters <ArrowRight size={16} />
              </Link>
            </>
          )}
        </article>

        <article className="system-command-center__snow">
          <span className="system-command-center__designation">SNOW · THE CONSTANT</span>
          <h3>Party coordination on command</h3>
          <p>
            Ask Snow to assemble the remaining day, preserve your preferences, or route a request to
            the specialist who can actually perform it.
          </p>
          <div>
            <button
              className="button button--secondary"
              type="button"
              onClick={() =>
                openQuickLink(
                  'snow',
                  'Snow, review what is still unfinished today and help me assemble the remaining assignments. Ask before waking the party.',
                )
              }
            >
              <Send size={16} /> Assemble today
            </button>
            <button
              className="button button--ghost"
              type="button"
              onClick={() => openQuickLink('snow')}
            >
              Talk to Snow
            </button>
          </div>
        </article>
      </div>

      {(operations || pendingProposal || transmissionCount > 0) && (
        <div className="system-command-center__live-board">
          {operations && operations.status !== 'awaiting-confirmation' && (
            <div className="system-command-center__operations">
              <span>
                <Sparkles size={16} /> PARTY OPERATIONS
              </span>
              {operations.training && (
                <Link to="/training-hall">
                  <Dumbbell size={16} /> {operations.training.label}
                  <b>{realmStateLabel(operations.training.state)}</b>
                </Link>
              )}
              {operations.kitchen && (
                <Link to="/kitchen">
                  <ChefHat size={16} /> {operations.kitchen.label}
                  <b>{realmStateLabel(operations.kitchen.state)}</b>
                </Link>
              )}
              {operations.sanctuary && (
                <Link to="/sanctuary">
                  <BookHeart size={16} /> {operations.sanctuary.label}
                  <b>{realmStateLabel(operations.sanctuary.state)}</b>
                </Link>
              )}
            </div>
          )}
          {pendingProposal && proposalOwner && (
            <button
              type="button"
              className="system-command-center__proposal"
              onClick={() => openQuickLink(pendingProposal.proposal.ownerId)}
            >
              <ShieldAlert size={18} />
              <span>
                <small>CONFIRMATION WAITING · {proposalOwner.name.toUpperCase()}</small>
                <strong>{PROPOSAL_LABELS[pendingProposal.proposal.kind]}</strong>
              </span>
              <ArrowRight size={16} />
            </button>
          )}
          {transmissionCount > 0 && (
            <div className="system-command-center__transmission">
              <Radio size={17} /> {transmissionCount} intelligence link
              {transmissionCount === 1 ? '' : 's'} synchronizing
            </div>
          )}
        </div>
      )}

      {debriefDue && (
        <Link className="system-command-center__debrief" to="/system-debrief">
          <BrainCircuit size={20} />
          <span>
            <small>EVOLUTION COUNCIL READY</small>
            <strong>Snow and Cipher are ready to review The System.</strong>
          </span>
          <ArrowRight size={17} />
        </Link>
      )}

      <details className="system-command-center__realms">
        <summary>
          <span>
            <MapIcon size={18} /> All System realms
          </span>
          <small>Open the complete directory</small>
          <ChevronDown size={18} />
        </summary>
        <div>
          <Link to="/training-hall">
            <Dumbbell size={18} />
            <span>
              Training Hall<small>Rook · Ember · Mira</small>
            </span>
          </Link>
          <Link to="/sanctuary">
            <BookHeart size={18} />
            <span>
              Sanctuary<small>Selah · Snow</small>
            </span>
          </Link>
          <Link to="/kitchen">
            <ChefHat size={18} />
            <span>
              Kitchen<small>Saffron</small>
            </span>
          </Link>
          <Link to="/treasury">
            <WalletCards size={18} />
            <span>
              Treasury<small>Cassian</small>
            </span>
          </Link>
          <Link to="/creator-forge">
            <Radio size={18} />
            <span>
              Creator Forge<small>Vesper · Cipher</small>
            </span>
          </Link>
          <Link to="/arc-archives">
            <BookOpenCheck size={18} />
            <span>
              A.R.C. Archives<small>Quill · Snow</small>
            </span>
          </Link>
          <Link to="/calendar">
            <CalendarClock size={18} />
            <span>
              Calendar Command<small>Kairo</small>
            </span>
          </Link>
          <Link to="/system-debrief">
            <BrainCircuit size={18} />
            <span>
              Evolution Council<small>Snow · Cipher · Daily review</small>
            </span>
          </Link>
          <Link to="/headquarters">
            <Castle size={18} />
            <span>
              Headquarters<small>Full party</small>
            </span>
          </Link>
          <Link to="/campaigns">
            <MapIcon size={18} />
            <span>
              Campaigns<small>Long-range arcs</small>
            </span>
          </Link>
          <Link to="/status">
            <Crown size={18} />
            <span>
              Class Path<small>Ascension record</small>
            </span>
          </Link>
          <Link to="/archive">
            <Archive size={18} />
            <span>
              Archive<small>Private campaign memory</small>
            </span>
          </Link>
        </div>
      </details>
    </section>
  );
}
