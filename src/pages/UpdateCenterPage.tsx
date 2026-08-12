import {
  ArrowLeft,
  CheckCircle2,
  CloudDownload,
  Download,
  HardDrive,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  WifiOff,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import {
  APP_VERSION,
  DATABASE_SCHEMA_VERSION,
  RELEASE_SECTIONS,
  SAVE_FORMAT_VERSION,
} from '@/config/release';
import {
  createLocalSnapshot,
  downloadSave,
  getStorageSummary,
  MAX_IMPORT_BYTES,
} from '@/db/backup';
import { db } from '@/db/database';
import { Link } from '@/router';
import {
  checkForPwaUpdate,
  getPwaUpdateState,
  installPwaUpdate,
  subscribeToPwaUpdate,
} from '@/services/pwaUpdate';

function size(bytes?: number) {
  if (bytes === undefined) return 'Not reported';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function time(value?: string) {
  if (!value) return 'Not yet';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

export function UpdateCenterPage() {
  const [pwa, setPwa] = useState(getPwaUpdateState());
  const [online, setOnline] = useState(navigator.onLine);
  const [storage, setStorage] = useState<Awaited<ReturnType<typeof getStorageSummary>>>();
  const [lastExport, setLastExport] = useState<string>();
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState('');

  const loadShield = useCallback(async () => {
    const [nextStorage, metadata] = await Promise.all([
      getStorageSummary(),
      db.appMetadata.get('last-manual-export'),
    ]);
    setStorage(nextStorage);
    setLastExport(typeof metadata?.value === 'string' ? metadata.value : undefined);
  }, []);

  useEffect(() => {
    void loadShield();
    const unsubscribe = subscribeToPwaUpdate(() => setPwa(getPwaUpdateState()));
    const updateConnection = () => setOnline(navigator.onLine);
    window.addEventListener('online', updateConnection);
    window.addEventListener('offline', updateConnection);
    return () => {
      unsubscribe();
      window.removeEventListener('online', updateConnection);
      window.removeEventListener('offline', updateConnection);
    };
  }, [loadShield]);

  async function run(key: string, action: () => Promise<unknown>, success: string) {
    setBusy(key);
    setMessage('');
    try {
      await action();
      await loadShield();
      setMessage(success);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : 'The System could not complete that action.',
      );
    } finally {
      setBusy('');
    }
  }

  return (
    <div className="page update-center-page">
      <div className="party-chat__topbar">
        <Link className="text-link" to="/">
          <ArrowLeft size={17} /> Back to System
        </Link>
        <span className="party-chat__saved">
          <ShieldCheck size={15} /> Local data remains on device
        </span>
      </div>
      <section className="update-center-hero panel">
        <div className="update-center-hero__icon">
          <CloudDownload size={32} />
        </div>
        <div>
          <p className="eyebrow">SYSTEM RELEASE CHANNEL</p>
          <h1>Update Center</h1>
          <p>
            Check what is installed, safely export your campaign, and install a waiting release
            without deleting the home-screen app.
          </p>
        </div>
        <div className="update-version">
          <span>INSTALLED</span>
          <strong>v{APP_VERSION}</strong>
          <small>
            Schema {DATABASE_SCHEMA_VERSION} · Save {SAVE_FORMAT_VERSION}
          </small>
        </div>
      </section>

      {message && (
        <div className="campaign-message" role="status">
          {message}
        </div>
      )}

      <section className="update-status panel">
        <header className="section-header">
          <div>
            <p className="eyebrow">RELEASE STATUS</p>
            <h2>{pwa.updateAvailable ? 'A new release is ready' : 'Installed release status'}</h2>
          </div>
          {online ? (
            <span className="update-online">
              <CheckCircle2 size={16} /> Online
            </span>
          ) : (
            <span className="update-offline">
              <WifiOff size={16} /> Offline
            </span>
          )}
        </header>
        <div className="update-status__body">
          <Smartphone size={28} />
          <div>
            <strong>
              {pwa.updateAvailable
                ? 'The update downloaded and is waiting.'
                : pwa.checkMessage || 'The current app remains fully available offline.'}
            </strong>
            <p>
              {pwa.updateAvailable
                ? 'Export first if you want an extra portable copy, then install. The app reloads once; on-device campaign data remains in place.'
                : 'Checking contacts The System’s private Sites release channel. It does not upload your personal campaign data.'}
            </p>
            {pwa.lastCheckedAt && <small>Last checked {time(pwa.lastCheckedAt)}</small>}
          </div>
        </div>
        <div className="update-status__actions">
          <button
            className="button button--ghost"
            disabled={pwa.checking || !online}
            onClick={() => void checkForPwaUpdate()}
          >
            <RefreshCw size={16} className={pwa.checking ? 'is-spinning' : ''} />{' '}
            {pwa.checking ? 'Checking…' : 'Check for update'}
          </button>
          {pwa.updateAvailable && (
            <button
              className="button button--primary"
              disabled={busy === 'install'}
              onClick={() => void run('install', () => installPwaUpdate(), 'Installing update…')}
            >
              <Download size={16} /> Install update
            </button>
          )}
        </div>
      </section>

      <section className="archive-shield panel">
        <header className="section-header">
          <div>
            <p className="eyebrow">ARCHIVE SHIELD</p>
            <h2>Your portable campaign protection</h2>
          </div>
          <ShieldCheck size={25} />
        </header>
        <p>
          Every export includes missions, progression, companions, chats, campfires, briefings,
          Campaign Arcs, quest chapters, Monthly Councils, the full Treasury, settings, and their
          integrity checksum.
        </p>
        <div className="archive-shield__metrics">
          <div>
            <HardDrive size={18} />
            <span>Current save</span>
            <strong>{size(storage?.saveBytes)}</strong>
          </div>
          <div>
            <ShieldCheck size={18} />
            <span>Recovery snapshots</span>
            <strong>{size(storage?.backupBytes)}</strong>
          </div>
          <div>
            <Download size={18} />
            <span>Last portable export</span>
            <strong>{time(lastExport)}</strong>
          </div>
          <div>
            <CloudDownload size={18} />
            <span>Import ceiling</span>
            <strong>{size(MAX_IMPORT_BYTES)}</strong>
          </div>
        </div>
        <div className="archive-shield__actions">
          <button
            className="button button--primary"
            disabled={busy === 'export'}
            onClick={() =>
              void run(
                'export',
                () => downloadSave(),
                'Integrity-checked save exported. Keep the downloaded file somewhere safe.',
              )
            }
          >
            <Download size={16} /> {busy === 'export' ? 'Exporting…' : 'Export full save'}
          </button>
          <button
            className="button button--ghost"
            disabled={busy === 'snapshot'}
            onClick={() =>
              void run(
                'snapshot',
                () => createLocalSnapshot('archive-shield'),
                'On-device Archive Shield snapshot created.',
              )
            }
          >
            <ShieldCheck size={16} /> Create local snapshot
          </button>
          <Link to="/settings" className="button button--ghost">
            Import or restore
          </Link>
        </div>
        <small>
          Exports are the safest protection against browser data loss. Local snapshots help with
          mistakes on this device but do not replace a downloaded copy.
        </small>
      </section>

      <section className="release-notes">
        <div className="section-header">
          <div>
            <p className="eyebrow">SYSTEM RELEASE ARCHIVE</p>
            <h2>What changed</h2>
          </div>
        </div>
        <div className="release-notes__grid">
          {RELEASE_SECTIONS.map((section) => (
            <article key={section.title} className="panel">
              <h3>{section.title}</h3>
              <p>{section.detail}</p>
              <ul>
                {section.points.map((point) => (
                  <li key={point}>
                    <CheckCircle2 size={15} /> <span>{point}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
