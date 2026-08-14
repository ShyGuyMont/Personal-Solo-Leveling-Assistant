import {
  ArrowLeft,
  BarChart3,
  BookOpenCheck,
  ChevronRight,
  CirclePlay,
  FileUp,
  Flame,
  Link2,
  MessageCircle,
  Plus,
  Radio,
  RefreshCw,
  Save,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Unplug,
  Users,
  Video,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { getCompanion, getCompanionImage } from '@/config/companions';
import {
  getCreatorForgeSummary,
  parseYouTubeStudioCsv,
  saveCreatorProject,
  saveCreatorSettings,
  saveCreatorSnapshot,
  saveCreatorStudioIntelligence,
  updateCreatorProjectStatus,
  type CreatorForgeSummary,
} from '@/game/creatorForge';
import { Link } from '@/router';
import {
  beginYouTubeStudioConnection,
  disconnectYouTubeStudio,
  getYouTubeStudioStatus,
  syncYouTubeStudio,
  type YouTubeStudioStatus,
} from '@/services/youtubeStudio';
import type {
  CreatorContentType,
  CreatorPlatform,
  CreatorProjectStatus,
  CreatorSnapshotSource,
} from '@/types/game';

const PIPELINE: Array<{ id: CreatorProjectStatus; label: string }> = [
  { id: 'idea', label: 'Idea' },
  { id: 'script', label: 'Script' },
  { id: 'record', label: 'Record' },
  { id: 'edit', label: 'Edit' },
  { id: 'thumbnail', label: 'Thumbnail' },
  { id: 'scheduled', label: 'Scheduled' },
  { id: 'published', label: 'Published' },
  { id: 'paused', label: 'Paused' },
];

function formatMetric(value: number | undefined, suffix = '') {
  if (value === undefined) return '—';
  return `${new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 }).format(value)}${suffix}`;
}

function formatDuration(seconds: number | undefined) {
  if (seconds === undefined) return '—';
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.round(seconds % 60);
  return `${minutes}:${remainder.toString().padStart(2, '0')}`;
}

function formatSnapshotSource(source: CreatorSnapshotSource) {
  if (source === 'youtube-api') return 'secure Studio link';
  return source.replace('-', ' ');
}

export function CreatorForgePage() {
  const vesper = getCompanion('haven');
  const cipher = getCompanion('cipher');
  const [summary, setSummary] = useState<CreatorForgeSummary>();
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [studioAction, setStudioAction] = useState(false);
  const [studioLink, setStudioLink] = useState<YouTubeStudioStatus>();
  const [showSnapshotForm, setShowSnapshotForm] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [historyPeriod, setHistoryPeriod] = useState<28 | 90 | 365>(28);
  const [snapshot, setSnapshot] = useState({
    subscribers: '',
    views: '',
    watchHours: '',
    impressions: '',
    clickThroughRate: '',
    averageViewDurationSeconds: '',
    uploads: '',
    note: '',
  });
  const [project, setProject] = useState<{
    title: string;
    platform: CreatorPlatform;
    contentType: CreatorContentType;
    pillar: string;
    hook: string;
    audiencePromise: string;
    nextAction: string;
    notes: string;
  }>({
    title: '',
    platform: 'youtube',
    contentType: 'long-form',
    pillar: '',
    hook: '',
    audiencePromise: '',
    nextAction: '',
    notes: '',
  });

  const refresh = useCallback(async () => {
    setSummary(await getCreatorForgeSummary());
  }, []);

  const refreshStudioLink = useCallback(async () => {
    try {
      setStudioLink(await getYouTubeStudioStatus());
    } catch {
      setStudioLink({ configured: false, connected: false, redirectUri: '', scopes: [] });
    }
  }, []);

  useEffect(() => {
    void refresh();
    void refreshStudioLink();
    const onChange = () => void refresh();
    window.addEventListener('system:creator-forge-changed', onChange);
    return () => window.removeEventListener('system:creator-forge-changed', onChange);
  }, [refresh, refreshStudioLink]);

  useEffect(() => {
    const query = window.location.hash.split('?')[1];
    const result = query ? new URLSearchParams(query).get('youtube') : null;
    if (!result) return;
    const messages: Record<string, string> = {
      connected: 'YouTube Studio authorized. Run the first secure sync when you are ready.',
      cancelled: 'Google authorization was cancelled. Nothing was connected.',
      'channel-missing': 'That Google account does not have a YouTube channel to connect.',
      'youtube-channel-missing': 'That Google account does not have a YouTube channel to connect.',
      'state-invalid': 'That Google authorization window expired. Start the connection again.',
      'setup-required': 'The private Google authorization settings still need to be completed.',
      'refresh-token-missing':
        'Google did not grant a lasting connection. Start the connection again.',
      'youtube-reconnect-required': 'Google authorization expired. Reconnect YouTube Studio.',
      'youtube-google-error':
        'Google could not complete authorization. Please try the connection again.',
      'authorization-failed': 'YouTube Studio authorization could not be completed.',
    };
    setNotice(messages[result] ?? 'YouTube Studio authorization could not be completed.');
    window.history.replaceState(
      null,
      '',
      `${window.location.pathname}${window.location.search}#/creator-forge`,
    );
    void refreshStudioLink();
  }, [refreshStudioLink]);

  const projectColumns = useMemo(
    () =>
      PIPELINE.filter((stage) => stage.id !== 'paused').map((stage) => ({
        ...stage,
        projects: summary?.projects.filter((item) => item.status === stage.id) ?? [],
      })),
    [summary?.projects],
  );

  async function handleSettingsSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!summary) return;
    const data = new FormData(event.currentTarget);
    setBusy(true);
    try {
      await saveCreatorSettings({
        channelName: String(data.get('channelName') ?? ''),
        channelHandle: String(data.get('channelHandle') ?? ''),
        channelUrl: String(data.get('channelUrl') ?? ''),
        weeklyUploadTarget: Number(data.get('weeklyUploadTarget') ?? 1),
        currentArcFocus: String(data.get('currentArcFocus') ?? ''),
        accountabilityMode: String(
          data.get('accountabilityMode'),
        ) as CreatorForgeSummary['settings']['accountabilityMode'],
      });
      setNotice('Creator identity and accountability protocol saved on this device.');
      await refresh();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Creator settings could not be saved.');
    } finally {
      setBusy(false);
    }
  }

  async function handleSnapshotSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    try {
      await saveCreatorSnapshot({
        source: 'manual',
        periodDays: 28,
        subscribers: snapshot.subscribers ? Number(snapshot.subscribers) : undefined,
        views: snapshot.views ? Number(snapshot.views) : undefined,
        watchHours: snapshot.watchHours ? Number(snapshot.watchHours) : undefined,
        impressions: snapshot.impressions ? Number(snapshot.impressions) : undefined,
        clickThroughRate: snapshot.clickThroughRate ? Number(snapshot.clickThroughRate) : undefined,
        averageViewDurationSeconds: snapshot.averageViewDurationSeconds
          ? Number(snapshot.averageViewDurationSeconds)
          : undefined,
        uploads: snapshot.uploads ? Number(snapshot.uploads) : undefined,
        note: snapshot.note,
      });
      setSnapshot({
        subscribers: '',
        views: '',
        watchHours: '',
        impressions: '',
        clickThroughRate: '',
        averageViewDurationSeconds: '',
        uploads: '',
        note: '',
      });
      setShowSnapshotForm(false);
      setNotice('Fresh 28-day Studio signal captured. Vesper can use it online immediately.');
      await refresh();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'The Studio snapshot could not be saved.');
    } finally {
      setBusy(false);
    }
  }

  async function handleCsv(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    try {
      const parsed = parseYouTubeStudioCsv(await file.text());
      await saveCreatorSnapshot(parsed);
      setNotice('YouTube Studio CSV synchronized. No Google password or access token was stored.');
      await refresh();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'That Studio CSV could not be read.');
    } finally {
      setBusy(false);
    }
  }

  async function handleStudioSync() {
    if (!summary || studioAction) return;
    setStudioAction(true);
    try {
      const result = await syncYouTubeStudio();
      await saveCreatorStudioIntelligence({
        snapshots: result.snapshots?.length ? result.snapshots : [result.snapshot],
        topVideos: result.topVideos ?? [],
      });
      if (!summary.settings.channelName || !summary.settings.channelUrl) {
        await saveCreatorSettings({
          ...summary.settings,
          channelName: summary.settings.channelName || result.channelTitle,
          channelUrl: summary.settings.channelUrl || result.channelUrl,
        });
      }
      setNotice(
        `${result.channelTitle} synchronized securely. History Lens, the Content Vault, and Vesper's evidence map are current.`,
      );
      await Promise.all([refresh(), refreshStudioLink()]);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'YouTube Studio could not synchronize.');
    } finally {
      setStudioAction(false);
    }
  }

  async function handleStudioDisconnect() {
    if (studioAction) return;
    const confirmed = window.confirm(
      'Disconnect YouTube Studio? Existing Creator Forge snapshots stay on this device, but automatic refresh access will be revoked.',
    );
    if (!confirmed) return;
    setStudioAction(true);
    try {
      await disconnectYouTubeStudio();
      setNotice(
        'YouTube Studio disconnected. Existing local snapshots remain available to Creator Forge.',
      );
      await refreshStudioLink();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'YouTube Studio could not disconnect.');
    } finally {
      setStudioAction(false);
    }
  }

  async function handleProjectSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    try {
      await saveCreatorProject({ ...project, status: 'idea' });
      setProject({
        title: '',
        platform: 'youtube',
        contentType: 'long-form',
        pillar: '',
        hook: '',
        audiencePromise: '',
        nextAction: '',
        notes: '',
      });
      setShowProjectForm(false);
      setNotice('New content operation captured. The idea now has a next move.');
      await refresh();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'That operation could not be saved.');
    } finally {
      setBusy(false);
    }
  }

  function openVesperLink(initialDraft?: string) {
    window.dispatchEvent(
      new CustomEvent('system:open-quick-link', {
        detail: { companionId: 'haven', initialDraft },
      }),
    );
  }

  if (!summary) {
    return <div className="loading-card">Synchronizing Creator Forge…</div>;
  }

  const latest = summary.latestSnapshot;
  const historySnapshot = summary.snapshotsByPeriod[historyPeriod] ?? latest;
  return (
    <div className="page creator-forge-page">
      <Link to="/" className="back-link">
        <ArrowLeft size={17} /> Back to System
      </Link>

      <section className="creator-hero panel" data-depth-surface="hero">
        <div className="creator-hero__portrait">
          <img src={getCompanionImage(vesper.image)} alt="Vesper, The Spotlight" />
          <span>
            <Radio size={16} /> LIVE CREATOR LINK
          </span>
        </div>
        <div className="creator-hero__copy">
          <p className="eyebrow">CREATOR FORGE · THE GREENROOM</p>
          <h1>Turn ideas into releases people remember.</h1>
          <p>
            Vesper owns the audience, the hook, the camera, and the courage to publish. Cipher owns
            the sequence. Together they keep YouTube and ARC work from becoming decorative plans.
          </p>
          <div className="creator-hero__actions">
            <button type="button" className="primary-button" onClick={() => openVesperLink()}>
              <MessageCircle size={18} /> Talk to Vesper
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={() => setShowProjectForm(true)}
            >
              <Plus size={18} /> Capture an idea
            </button>
            <Link to="/arc-archives" className="secondary-button">
              <BookOpenCheck size={18} /> Enter A.R.C. Archives
            </Link>
          </div>
        </div>
        <div className={`creator-signal creator-signal--${summary.momentum}`}>
          <span>CREATOR SIGNAL</span>
          <strong>{summary.momentum.toUpperCase()}</strong>
          <small>
            {summary.daysSinceLastCreatorAction === undefined
              ? 'No local signal yet'
              : `${summary.daysSinceLastCreatorAction} day${summary.daysSinceLastCreatorAction === 1 ? '' : 's'} since movement`}
          </small>
        </div>
      </section>

      <section className="creator-duo-grid">
        <article className="creator-voice-card panel creator-voice-card--vesper">
          <img src={getCompanionImage(vesper.image)} alt="" />
          <div>
            <p className="eyebrow">VESPER · THE SPOTLIGHT</p>
            <blockquote>“{summary.vesperCallout}”</blockquote>
          </div>
        </article>
        <article className="creator-voice-card panel creator-voice-card--cipher">
          <img src={getCompanionImage(cipher.image)} alt="" />
          <div>
            <p className="eyebrow">CIPHER · THE STRATEGIST</p>
            <blockquote>“{summary.cipherReadout}”</blockquote>
          </div>
        </article>
      </section>

      <section
        className={`panel creator-reawakening creator-reawakening--${summary.reawakening.state}`}
        data-depth-surface="hero"
      >
        <header className="section-header">
          <div>
            <p className="eyebrow">VESPER'S REAWAKENING BRIEFING</p>
            <h2>{summary.reawakening.headline}</h2>
            <p>{summary.reawakening.diagnosis}</p>
          </div>
          <span className="creator-reawakening__state">{summary.reawakening.state}</span>
        </header>
        <div className="creator-reawakening__grid">
          <article>
            <small>STRATEGIC FOCUS</small>
            <strong>{summary.reawakening.focus}</strong>
          </article>
          <article>
            <small>FIRST PHYSICAL MOVE</small>
            <strong>{summary.reawakening.nextAction}</strong>
          </article>
        </div>
        {summary.reawakening.proof.length > 0 && (
          <div className="creator-reawakening__proof">
            {summary.reawakening.proof.map((signal) => (
              <span key={signal}>{signal}</span>
            ))}
          </div>
        )}
        <div className="creator-reawakening__actions">
          <button
            type="button"
            className="primary-button"
            onClick={() =>
              openVesperLink(
                'Vesper, build me a realistic four-week Creator Reawakening campaign from my Studio history, proven videos, active pipeline, and current focus. Ask one necessary question if my direction is missing; otherwise prepare the complete campaign for one confirmation.',
              )
            }
          >
            <Sparkles size={18} /> Enter Reawakening Council
          </button>
          <small>Vesper can advise freely. Nothing reaches the board until you confirm it.</small>
        </div>
      </section>

      <section className="panel creator-analytics" data-depth-surface="panel">
        <header className="section-header">
          <div>
            <p className="eyebrow">HISTORY LENS · LAST {historySnapshot?.periodDays ?? 28} DAYS</p>
            <h2>{summary.settings.channelName || 'Channel command board'}</h2>
            <p>
              {historySnapshot
                ? `Last synchronized ${new Date(historySnapshot.capturedAt).toLocaleString()}.`
                : 'Add a manual snapshot or import a YouTube Studio CSV to establish a baseline.'}
            </p>
          </div>
          <span className="creator-source-badge">
            {historySnapshot ? formatSnapshotSource(historySnapshot.source) : 'awaiting sync'}
          </span>
        </header>
        <div className="creator-history-tabs" role="group" aria-label="Channel history period">
          {([28, 90, 365] as const).map((period) => (
            <button
              key={period}
              type="button"
              className={historyPeriod === period ? 'is-active' : undefined}
              disabled={!summary.snapshotsByPeriod[period]}
              onClick={() => setHistoryPeriod(period)}
            >
              <strong>{period}</strong>
              <span>DAYS</span>
            </button>
          ))}
        </div>
        <div className="creator-metric-grid">
          <article>
            <Users size={18} />
            <span>Subscribers</span>
            <strong>{formatMetric(historySnapshot?.subscribers)}</strong>
          </article>
          <article>
            <CirclePlay size={18} />
            <span>Views</span>
            <strong>{formatMetric(historySnapshot?.views)}</strong>
          </article>
          <article>
            <TrendingUp size={18} />
            <span>Watch hours</span>
            <strong>{formatMetric(historySnapshot?.watchHours)}</strong>
          </article>
          <article>
            <BarChart3 size={18} />
            <span>Impressions</span>
            <strong>{formatMetric(historySnapshot?.impressions)}</strong>
          </article>
          <article>
            <Target size={18} />
            <span>CTR</span>
            <strong>{formatMetric(historySnapshot?.clickThroughRate, '%')}</strong>
          </article>
          <article>
            <Video size={18} />
            <span>Avg. view</span>
            <strong>{formatDuration(historySnapshot?.averageViewDurationSeconds)}</strong>
          </article>
        </div>
        <section
          className={`creator-studio-link ${studioLink?.connected ? 'is-connected' : ''}`}
          aria-label="YouTube Studio read-only connection"
        >
          <div className="creator-studio-link__identity">
            <span className="creator-studio-link__icon">
              {studioLink?.connected ? <ShieldCheck size={22} /> : <Link2 size={22} />}
            </span>
            <div>
              <small>SECURE STUDIO LINK · READ ONLY</small>
              <strong>
                {studioLink?.connected
                  ? studioLink.channelTitle || 'YouTube Studio connected'
                  : studioLink?.configured
                    ? 'Connect your YouTube channel'
                    : 'Google authorization setup required'}
              </strong>
              <p>
                {studioLink?.connected
                  ? studioLink.lastSyncAt
                    ? `Last refreshed ${new Date(studioLink.lastSyncAt).toLocaleString()}.`
                    : 'Connection secured. Your first analytics refresh is ready.'
                  : studioLink?.configured
                    ? 'Google will show the exact analytics permissions before anything is connected.'
                    : 'The private bridge is built. Complete the one-time Google credential step to activate it.'}
              </p>
            </div>
          </div>
          <div className="creator-studio-link__actions">
            {studioLink?.connected ? (
              <>
                <button
                  type="button"
                  className="primary-button"
                  onClick={() => void handleStudioSync()}
                  disabled={studioAction}
                >
                  <RefreshCw size={18} className={studioAction ? 'is-spinning' : ''} />
                  {studioAction ? 'Synchronizing…' : 'Sync Studio now'}
                </button>
                <button
                  type="button"
                  className="secondary-button creator-disconnect-button"
                  onClick={() => void handleStudioDisconnect()}
                  disabled={studioAction}
                >
                  <Unplug size={17} /> Disconnect
                </button>
              </>
            ) : (
              <button
                type="button"
                className="primary-button"
                onClick={beginYouTubeStudioConnection}
                disabled={!studioLink?.configured || studioAction}
              >
                <Link2 size={18} /> Connect YouTube Studio
              </button>
            )}
          </div>
        </section>
        <div className="creator-sync-actions">
          <button
            type="button"
            className="primary-button"
            onClick={() => setShowSnapshotForm((value) => !value)}
          >
            <BarChart3 size={18} /> Enter Studio snapshot
          </button>
          <label className={`secondary-button creator-file-button ${busy ? 'is-disabled' : ''}`}>
            <FileUp size={18} /> Import Studio CSV
            <input
              type="file"
              accept=".csv,text/csv"
              disabled={busy}
              onChange={(event) => void handleCsv(event.target.files?.[0])}
            />
          </label>
          <a
            className="text-link"
            href="https://studio.youtube.com/"
            target="_blank"
            rel="noreferrer"
          >
            Open YouTube Studio <ChevronRight size={16} />
          </a>
        </div>
        <p className="creator-privacy-note">
          Direct synchronization requests analytics-only access. The System never receives your
          Google password, cannot modify your channel, and never sends Google authorization tokens
          to Vesper or OpenAI. CSV and manual snapshots remain available and fully local.
        </p>

        {showSnapshotForm && (
          <form className="creator-form creator-snapshot-form" onSubmit={handleSnapshotSubmit}>
            <label>
              Subscribers
              <input
                inputMode="numeric"
                value={snapshot.subscribers}
                onChange={(event) => setSnapshot({ ...snapshot, subscribers: event.target.value })}
              />
            </label>
            <label>
              Views · 28 days
              <input
                inputMode="numeric"
                value={snapshot.views}
                onChange={(event) => setSnapshot({ ...snapshot, views: event.target.value })}
              />
            </label>
            <label>
              Watch hours
              <input
                inputMode="decimal"
                value={snapshot.watchHours}
                onChange={(event) => setSnapshot({ ...snapshot, watchHours: event.target.value })}
              />
            </label>
            <label>
              Impressions
              <input
                inputMode="numeric"
                value={snapshot.impressions}
                onChange={(event) => setSnapshot({ ...snapshot, impressions: event.target.value })}
              />
            </label>
            <label>
              Click-through rate %
              <input
                inputMode="decimal"
                value={snapshot.clickThroughRate}
                onChange={(event) =>
                  setSnapshot({ ...snapshot, clickThroughRate: event.target.value })
                }
              />
            </label>
            <label>
              Average view seconds
              <input
                inputMode="numeric"
                value={snapshot.averageViewDurationSeconds}
                onChange={(event) =>
                  setSnapshot({ ...snapshot, averageViewDurationSeconds: event.target.value })
                }
              />
            </label>
            <label>
              Uploads · 28 days
              <input
                inputMode="numeric"
                value={snapshot.uploads}
                onChange={(event) => setSnapshot({ ...snapshot, uploads: event.target.value })}
              />
            </label>
            <label className="creator-form__wide">
              Snapshot note
              <input
                value={snapshot.note}
                onChange={(event) => setSnapshot({ ...snapshot, note: event.target.value })}
                placeholder="What changed, what worked, or what you noticed"
              />
            </label>
            <button className="primary-button creator-form__wide" disabled={busy}>
              <Save size={18} /> Synchronize signal
            </button>
          </form>
        )}
      </section>

      <section className="panel creator-vault" data-depth-surface="panel">
        <header className="section-header">
          <div>
            <p className="eyebrow">CONTENT VAULT · PROVEN SIGNALS</p>
            <h2>Your strongest videos from the last 365 days.</h2>
            <p>
              These are evidence, not orders. Vesper can study what earned attention without
              pretending the next release must copy the past.
            </p>
          </div>
          <span className="creator-source-badge">READ ONLY</span>
        </header>
        {summary.videoInsights.length ? (
          <div className="creator-vault__list">
            {summary.videoInsights.map((video, index) => (
              <article key={video.id} className="creator-vault__item">
                <span className="creator-vault__rank">#{index + 1}</span>
                <div className="creator-vault__copy">
                  <h3>{video.title}</h3>
                  <p>
                    {formatMetric(video.views)} views · {formatMetric(video.watchHours)} watch hours
                    {video.averageViewPercentage !== undefined
                      ? ` · ${formatMetric(video.averageViewPercentage, '%')} viewed`
                      : ''}
                  </p>
                  <small>
                    {video.publishedAt
                      ? `Published ${new Date(video.publishedAt).toLocaleDateString()}`
                      : 'Publication date unavailable'}
                  </small>
                </div>
                <div className="creator-vault__actions">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() =>
                      openVesperLink(
                        `Vesper, open the Idea Lab on “${video.title}.” Use its real one-year signal as evidence, tell me what audience promise may have worked, and help me design a fresh successor without copying it.`,
                      )
                    }
                  >
                    <Sparkles size={16} /> Idea Lab
                  </button>
                  <a
                    className="text-link"
                    href={`https://www.youtube.com/watch?v=${encodeURIComponent(video.videoId)}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View <ChevronRight size={15} />
                  </a>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="creator-vault__empty">
            <CirclePlay size={26} />
            <div>
              <strong>The Content Vault is waiting for a secure Studio sync.</strong>
              <p>
                If the last year has no eligible video activity, the empty vault is still an honest
                signal—and Vesper will build the comeback from your current focus instead.
              </p>
            </div>
          </div>
        )}
      </section>

      <section className="panel creator-pipeline" data-depth-surface="panel">
        <header className="section-header">
          <div>
            <p className="eyebrow">PRODUCTION PIPELINE</p>
            <h2>{summary.activeProjects.length} active content operations</h2>
            <p>Every card needs a next action. Move the stage when the work actually moves.</p>
          </div>
          <button
            type="button"
            className="primary-button"
            onClick={() => setShowProjectForm((value) => !value)}
          >
            <Plus size={18} /> New operation
          </button>
        </header>

        {showProjectForm && (
          <form className="creator-form creator-project-form" onSubmit={handleProjectSubmit}>
            <label className="creator-form__wide">
              Working title
              <input
                required
                value={project.title}
                onChange={(event) => setProject({ ...project, title: event.target.value })}
                placeholder="The idea the audience will click"
              />
            </label>
            <label>
              Platform
              <select
                value={project.platform}
                onChange={(event) =>
                  setProject({ ...project, platform: event.target.value as CreatorPlatform })
                }
              >
                <option value="youtube">YouTube</option>
                <option value="youtube-shorts">YouTube Shorts</option>
                <option value="arc">ARC</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label>
              Format
              <select
                value={project.contentType}
                onChange={(event) =>
                  setProject({ ...project, contentType: event.target.value as CreatorContentType })
                }
              >
                <option value="long-form">Long form</option>
                <option value="short-form">Short form</option>
                <option value="livestream">Livestream</option>
                <option value="community-post">Community post</option>
                <option value="arc-project">ARC project</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label>
              Content pillar
              <input
                value={project.pillar}
                onChange={(event) => setProject({ ...project, pillar: event.target.value })}
                placeholder="Series or topic"
              />
            </label>
            <label>
              Next action
              <input
                value={project.nextAction}
                onChange={(event) => setProject({ ...project, nextAction: event.target.value })}
                placeholder="Small, physical, finishable"
              />
            </label>
            <label className="creator-form__wide">
              Hook
              <textarea
                value={project.hook}
                onChange={(event) => setProject({ ...project, hook: event.target.value })}
                placeholder="Why should somebody stop scrolling?"
              />
            </label>
            <label className="creator-form__wide">
              Audience promise
              <textarea
                value={project.audiencePromise}
                onChange={(event) =>
                  setProject({ ...project, audiencePromise: event.target.value })
                }
                placeholder="What does the viewer walk away with?"
              />
            </label>
            <button className="primary-button creator-form__wide" disabled={busy}>
              <Sparkles size={18} /> Put it on the board
            </button>
          </form>
        )}

        <div className="creator-pipeline__scroll">
          {projectColumns.map((column) => (
            <section key={column.id} className="creator-pipeline__column">
              <header>
                <span>{column.label}</span>
                <strong>{column.projects.length}</strong>
              </header>
              <div>
                {column.projects.map((item) => (
                  <article key={item.id} className="creator-project-card">
                    <span>{item.platform.replace('-', ' ')}</span>
                    <h3>{item.title}</h3>
                    {item.hook && <p>“{item.hook}”</p>}
                    <small>{item.nextAction || 'Vesper requires a next action.'}</small>
                    <select
                      aria-label={`Move ${item.title}`}
                      value={item.status}
                      onChange={(event) =>
                        void updateCreatorProjectStatus(
                          item.id,
                          event.target.value as CreatorProjectStatus,
                        ).then(refresh)
                      }
                    >
                      {PIPELINE.map((stage) => (
                        <option key={stage.id} value={stage.id}>
                          {stage.label}
                        </option>
                        ))}
                      </select>
                    <button
                      type="button"
                      className="creator-project-card__vesper"
                      onClick={() =>
                        openVesperLink(
                          `Vesper, workshop the exact active Creator Forge operation titled “${item.title}.” Treat that project as the primary board record, assess its current ${item.status} stage, hook, audience promise, and recorded next action, then help me choose the strongest honest move from here. Do not create a duplicate or claim its stage changed; this is a focused review.`,
                        )
                      }
                    >
                      <MessageCircle size={15} /> Workshop with Vesper
                    </button>
                  </article>
                ))}
                {!column.projects.length && <p className="creator-pipeline__empty">No signal</p>}
              </div>
            </section>
          ))}
        </div>
      </section>

      <section className="panel creator-identity" data-depth-surface="panel">
        <header className="section-header">
          <div>
            <p className="eyebrow">CREATOR IDENTITY</p>
            <h2>Tell Vesper what she is guarding.</h2>
            <p>
              This context remains on-device offline and becomes her real progress map in Online
              Mode.
            </p>
          </div>
          <Flame size={24} />
        </header>
        <form
          className="creator-form"
          onSubmit={handleSettingsSubmit}
          key={summary.settings.updatedAt}
        >
          <label>
            Channel name
            <input name="channelName" defaultValue={summary.settings.channelName} />
          </label>
          <label>
            Handle
            <input
              name="channelHandle"
              defaultValue={summary.settings.channelHandle}
              placeholder="@yourhandle"
            />
          </label>
          <label className="creator-form__wide">
            Channel URL
            <input name="channelUrl" defaultValue={summary.settings.channelUrl} inputMode="url" />
          </label>
          <label>
            Weekly upload target
            <input
              name="weeklyUploadTarget"
              type="number"
              min="0"
              max="21"
              defaultValue={summary.settings.weeklyUploadTarget}
            />
          </label>
          <label>
            Accountability
            <select name="accountabilityMode" defaultValue={summary.settings.accountabilityMode}>
              <option value="supportive">Supportive</option>
              <option value="direct">Direct</option>
              <option value="relentless">Relentless</option>
            </select>
          </label>
          <label className="creator-form__wide">
            Current ARC / creator focus
            <textarea
              name="currentArcFocus"
              defaultValue={summary.settings.currentArcFocus}
              placeholder="What are you building and why does it matter right now?"
            />
          </label>
          <button className="primary-button creator-form__wide" disabled={busy}>
            <Save size={18} /> Save creator identity
          </button>
        </form>
      </section>

      {notice && (
        <p className="creator-notice" role="status">
          {notice}
        </p>
      )}
    </div>
  );
}
