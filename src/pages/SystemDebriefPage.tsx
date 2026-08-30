import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';
import {
  ArrowLeft,
  BrainCircuit,
  ClipboardCopy,
  CheckCircle2,
  Download,
  ListTodo,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  Users,
} from 'lucide-react';
import { getCompanion, getCompanionImage } from '@/config/companions';
import { buildAiProgressContext } from '@/game/aiContext';
import { estimateTextCostUsd, recordAiUsage } from '@/game/aiVoice';
import {
  buildLocalSystemDebrief,
  getRecentSystemSignals,
  getSystemDebriefHistory,
  mergeCouncilIntoDebrief,
  saveSystemDebrief,
  setSystemDebriefActionStatus,
  systemDebriefToMarkdown,
  type SystemDebriefReport,
} from '@/game/systemDebrief';
import { Link } from '@/router';
import { requestAiHeadquartersReply } from '@/services/aiHeadquarters';
import { useGameStore } from '@/store/useGameStore';
import type { CompanionId } from '@/types/game';

function downloadText(name: string, text: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

export function SystemDebriefPage() {
  const snapshot = useGameStore();
  const [report, setReport] = useState<SystemDebriefReport>();
  const [history, setHistory] = useState<SystemDebriefReport[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const refresh = useCallback(async () => {
    const reports = await getSystemDebriefHistory(20);
    setHistory(reports);
    setReport(reports.find((item) => item.date === snapshot.systemDate));
  }, [snapshot.systemDate]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const participants = useMemo(
    () => (report?.participants ?? ['snow', 'cipher']).map((id) => getCompanion(id)),
    [report],
  );

  const scan = async () => {
    setBusy(true);
    setError('');
    try {
      const signals = await getRecentSystemSignals();
      const next = buildLocalSystemDebrief({
        date: snapshot.systemDate,
        records: snapshot.todayRecords,
        missions: snapshot.missions,
        signals,
      });
      await saveSystemDebrief(next);
      setReport(next);
      await refresh();
    } catch {
      setError('The private scan could not be saved. Your existing campaign was not changed.');
    } finally {
      setBusy(false);
    }
  };

  const convene = async () => {
    if (!snapshot.profile || !snapshot.settings || !snapshot.progression) return;
    setBusy(true);
    setError('');
    try {
      let base = report;
      if (!base) {
        const signals = await getRecentSystemSignals();
        base = buildLocalSystemDebrief({
          date: snapshot.systemDate,
          records: snapshot.todayRecords,
          missions: snapshot.missions,
          signals,
        });
        await saveSystemDebrief(base);
      }
      const participantIds = base.participants;
      const context = await buildAiProgressContext({
        audience: 'party',
        participantIds,
        profile: snapshot.profile,
        settings: snapshot.settings,
        progression: snapshot.progression,
        missions: snapshot.missions,
        todayRecords: snapshot.todayRecords,
        stats: snapshot.stats,
        challenges: snapshot.challenges,
        systemDate: snapshot.systemDate,
        enabledCompanionIds: snapshot.settings.enabledCompanionIds,
        query: base.codexBrief,
      });
      const result = await requestAiHeadquartersReply({
        audience: 'party',
        participantIds,
        roomKind: 'party-council',
        leadCompanionId: 'snow',
        message: `Nightly System Evolution Council. Review the private local scan below as evidence about THE APP and your own capabilities—not as a judgment of Jay. Be specific and detailed. Snow chairs. Cipher audits technical truth. Each present companion should name: what worked, a crack or friction point, one behavior/personality/intelligence improvement, and one thing they genuinely wish they could do in a future app version. Each request must name an owner, relevant collaborators, concrete evidence, one bounded proposed action, and a verification test. Separate something the current app can already prepare behind confirmation from something that requires a future build. Distinguish observed evidence from inference. Do not claim you changed anything, do not award XP, and do not expose photos, voice, secrets, private document contents, or itemized finances. Finish with Snow ranking one development priority and Cipher translating it into a testable Codex brief.\n\nLOCAL SCAN\n${systemDebriefToMarkdown(base).slice(0, 12_000)}`,
        history: [],
        context,
        commandMode: 'none',
      });
      const completed = mergeCouncilIntoDebrief(base, result);
      await saveSystemDebrief(completed);
      setReport(completed);
      if (result.usage)
        await recordAiUsage({
          kind: 'text',
          sessionId: `system-debrief:${snapshot.systemDate}`,
          companionId: 'snow',
          model: result.model,
          inputTokens: result.usage.inputTokens,
          outputTokens: result.usage.outputTokens,
          cachedInputTokens: result.usage.cachedInputTokens,
          reasoningTokens: result.usage.reasoningTokens,
          totalTokens: result.usage.totalTokens,
          characters: 0,
          audioSeconds: 0,
          estimatedCostUsd: estimateTextCostUsd(
            result.model,
            result.usage.inputTokens,
            result.usage.outputTokens,
            result.usage.cachedInputTokens,
          ),
          exactUsage: true,
        });
      await refresh();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'The council link failed. The local scan remains safe.',
      );
    } finally {
      setBusy(false);
    }
  };

  const reviewAction = async (actionId: string, status: 'proposed' | 'queued' | 'dismissed') => {
    if (!report) return;
    try {
      const next = await setSystemDebriefActionStatus(report.date, actionId, status);
      setReport(next);
      await refresh();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : 'That improvement request could not be updated.',
      );
    }
  };

  return (
    <div className="page system-debrief-page">
      <div className="party-chat__topbar">
        <Link className="text-link" to="/">
          <ArrowLeft size={17} /> Back to System
        </Link>
        <span className="party-chat__saved">
          <ShieldCheck size={15} /> Reports stay on this device
        </span>
      </div>

      <section className="system-debrief-hero panel">
        <div className="system-debrief-hero__mark">
          <BrainCircuit size={34} />
        </div>
        <div>
          <p className="eyebrow">DAILY SYSTEM DEBRIEF · SELF-IMPROVEMENT COUNCIL</p>
          <h1>The family studies its own work.</h1>
          <p>
            After 8:30 PM, Snow can gather the companions who actually touched the day. They review
            friction, personality misses, broken flows, and capabilities they wish they had—then
            turn those findings into owned, testable work orders for your review. They can prepare
            the thinking themselves; nothing changes your campaign or the app without approval.
          </p>
        </div>
      </section>

      <section className="system-debrief-controls panel">
        <div className="system-debrief-roster">
          {participants.map((companion) => (
            <span
              key={companion.id}
              style={{ '--debrief-accent': companion.accent } as CSSProperties}
            >
              <img src={getCompanionImage(companion.image)} alt="" /> {companion.name}
            </span>
          ))}
        </div>
        <div>
          <button
            className="button button--secondary"
            type="button"
            onClick={() => void scan()}
            disabled={busy}
          >
            <RefreshCw size={17} /> {report ? 'Refresh private scan' : 'Run private scan'}
          </button>
          <button
            className="button button--primary"
            type="button"
            onClick={() => void convene()}
            disabled={busy || snapshot.settings?.aiLinkMode !== 'online'}
          >
            <Users size={17} /> {busy ? 'Council thinking…' : 'Convene Evolution Council'}
          </button>
        </div>
        <small>
          The scan is offline. The council uses one normal online AI exchange only when you press
          the button; it never speaks automatically or consumes Cartesia time.
        </small>
      </section>

      {error && (
        <div className="notice notice--warning">
          <TriangleAlert size={18} /> {error}
        </div>
      )}

      {report ? (
        <>
          <section className="system-debrief-report panel">
            <header>
              <div>
                <p className="eyebrow">{report.status.replace('-', ' ').toUpperCase()}</p>
                <h2>{report.title}</h2>
                <p>{report.summary}</p>
              </div>
              <div>
                <button
                  className="icon-button"
                  type="button"
                  aria-label="Copy Codex development brief"
                  onClick={() => {
                    void navigator.clipboard.writeText(systemDebriefToMarkdown(report));
                    setCopied(true);
                    window.setTimeout(() => setCopied(false), 1600);
                  }}
                >
                  <ClipboardCopy size={18} />
                </button>
                <button
                  className="icon-button"
                  type="button"
                  aria-label="Download Markdown report"
                  onClick={() =>
                    downloadText(
                      `system-debrief-${report.date}.md`,
                      systemDebriefToMarkdown(report),
                      'text/markdown',
                    )
                  }
                >
                  <Download size={18} />
                </button>
              </div>
            </header>
            {copied && <p className="system-debrief-report__copied">Codex brief copied.</p>}
            <div className="system-debrief-report__grid">
              <article>
                <h3>What worked</h3>
                <ul>
                  {report.wins.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
              <article>
                <h3>Cracks and friction</h3>
                {report.issues.map((issue) => (
                  <div key={issue.id} className={`system-debrief-issue is-${issue.severity}`}>
                    <span>{issue.severity}</span>
                    <strong>{issue.title}</strong>
                    <p>{issue.evidence}</p>
                    <small>{issue.recommendation}</small>
                  </div>
                ))}
              </article>
            </div>
            <div className="system-debrief-council">
              <h3>
                <Sparkles size={18} /> Council testimony
              </h3>
              {report.councilReplies.length ? (
                report.councilReplies.map((reply) => {
                  const companion = getCompanion(reply.companionId as CompanionId);
                  return (
                    <article
                      key={`${reply.companionId}-${reply.message.slice(0, 20)}`}
                      style={{ '--debrief-accent': companion.accent } as CSSProperties}
                    >
                      <img src={getCompanionImage(companion.image)} alt="" />
                      <div>
                        <strong>{companion.name}</strong>
                        <p>{reply.message}</p>
                      </div>
                    </article>
                  );
                })
              ) : (
                <p className="muted">
                  The private scan is ready. Convene the online council when you want the family’s
                  complete read.
                </p>
              )}
            </div>
            <div className="system-debrief-priority">
              <span>SNOW’S PRIORITY</span>
              <p>{report.snowPriority}</p>
            </div>
            <section className="system-debrief-actions">
              <h3>
                <ListTodo size={18} /> Family improvement queue
              </h3>
              <p>
                The family can identify, assign, and refine the work. Queue only what deserves a
                future build; dismissed requests stay in the report instead of disappearing.
              </p>
              <div>
                {(report.actions ?? []).map((action) => {
                  const owner = getCompanion(action.ownerId);
                  return (
                    <article key={action.id} className={`is-${action.status}`}>
                      <header>
                        <img src={getCompanionImage(owner.image)} alt="" />
                        <div>
                          <span>{action.status.replace('-', ' ')}</span>
                          <strong>{action.title}</strong>
                          <small>
                            {owner.name} owns · {action.execution.replace('-', ' ')}
                          </small>
                        </div>
                      </header>
                      <p>{action.rationale}</p>
                      <dl>
                        <div>
                          <dt>Proposed action</dt>
                          <dd>{action.proposedAction}</dd>
                        </div>
                        <div>
                          <dt>Proof required</dt>
                          <dd>{action.verification}</dd>
                        </div>
                      </dl>
                      <footer>
                        <button
                          className="button button--secondary"
                          type="button"
                          disabled={action.status === 'queued'}
                          onClick={() => void reviewAction(action.id, 'queued')}
                        >
                          <CheckCircle2 size={16} /> Queue for next build
                        </button>
                        <button
                          className="button button--ghost"
                          type="button"
                          disabled={action.status === 'dismissed'}
                          onClick={() => void reviewAction(action.id, 'dismissed')}
                        >
                          Dismiss
                        </button>
                        {action.status !== 'proposed' && (
                          <button
                            className="text-button"
                            type="button"
                            onClick={() => void reviewAction(action.id, 'proposed')}
                          >
                            Return to review
                          </button>
                        )}
                      </footer>
                    </article>
                  );
                })}
              </div>
            </section>
            <details className="system-debrief-codex">
              <summary>Codex development brief</summary>
              <pre>{report.codexBrief}</pre>
            </details>
          </section>
        </>
      ) : (
        <section className="empty-state panel">
          <BrainCircuit size={30} />
          <h2>No debrief has been opened tonight.</h2>
          <p>
            Start with the private scan. It reads only safe structural signals and today’s
            completion state.
          </p>
        </section>
      )}

      {history.length > 1 && (
        <section className="system-debrief-history panel">
          <h2>Debrief archive</h2>
          {history
            .filter((item) => item.date !== report?.date)
            .map((item) => (
              <button type="button" key={item.id} onClick={() => setReport(item)}>
                <span>{item.date}</span>
                <strong>{item.title}</strong>
                <small>{item.status.replace('-', ' ')}</small>
              </button>
            ))}
        </section>
      )}

      <section className="system-debrief-privacy panel">
        <ShieldCheck size={22} />
        <div>
          <h2>Private by design</h2>
          <p>
            Debriefs exclude physique photos, audio, API secrets, full A.R.C. documents, and
            itemized Treasury records. They diagnose The System—not your worth. The family may
            prepare and prioritize work, but only your visible confirmation can mutate supported app
            data, and code changes still require a reviewed build.
          </p>
        </div>
      </section>
    </div>
  );
}
