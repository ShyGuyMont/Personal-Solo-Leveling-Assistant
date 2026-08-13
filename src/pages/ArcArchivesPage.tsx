import {
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  Download,
  FileJson,
  FilePlus2,
  LibraryBig,
  MessageCircleMore,
  Save,
  Search,
  ShieldCheck,
  Snowflake,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { getCompanion, getCompanionImage } from '@/config/companions';
import { db } from '@/db/database';
import {
  downloadArcDossier,
  importArcCanonFile,
  importArcDossierFile,
  saveArcCanonSource,
  saveArcCharacter,
  scanArcContinuity,
} from '@/game/arcArchives';
import type { ArcCanonSource, ArcCanonSourceKind, ArcCharacterRecord } from '@/types/game';

type ArchiveView = 'library' | 'forge' | 'vault' | 'continuity';

const SOURCE_KINDS: Array<{ value: ArcCanonSourceKind; label: string }> = [
  { value: 'world-lore', label: 'World lore' },
  { value: 'faction', label: 'Faction' },
  { value: 'location', label: 'Location' },
  { value: 'timeline', label: 'Timeline' },
  { value: 'plot', label: 'Plot' },
  { value: 'reference', label: 'Reference' },
];

export function ArcArchivesPage() {
  const quill = getCompanion('quill');
  const frameRef = useRef<HTMLIFrameElement>(null);
  const pendingForgeRecordRef = useRef<ArcCharacterRecord>();
  const [view, setView] = useState<ArchiveView>('library');
  const [characters, setCharacters] = useState<ArcCharacterRecord[]>([]);
  const [sources, setSources] = useState<ArcCanonSource[]>([]);
  const [query, setQuery] = useState('');
  const [notice, setNotice] = useState('A.R.C. Records Division standing by.');
  const [sourceTitle, setSourceTitle] = useState('');
  const [sourceKind, setSourceKind] = useState<ArcCanonSourceKind>('world-lore');
  const [sourceTags, setSourceTags] = useState('');
  const [sourceCharacters, setSourceCharacters] = useState('');
  const [sourceText, setSourceText] = useState('');

  async function refresh() {
    const [nextCharacters, nextSources] = await Promise.all([
      db.arcCharacters.orderBy('updatedAt').reverse().toArray(),
      db.arcCanonSources.orderBy('updatedAt').reverse().toArray(),
    ]);
    setCharacters(nextCharacters);
    setSources(nextSources);
  }

  useEffect(() => {
    void refresh();
    const onChanged = () => void refresh();
    window.addEventListener('system:arc-archives-changed', onChanged);
    return () => window.removeEventListener('system:arc-archives-changed', onChanged);
  }, []);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.data?.source !== 'arc-character-archives') {
        return;
      }
      if (event.data.type === 'arc:dossier-saved' || event.data.type === 'arc:dossier-snapshot') {
        void saveArcCharacter(event.data.payload)
          .then((record) => {
            setNotice(`${record.name} synchronized with the private A.R.C. Library.`);
            void refresh();
          })
          .catch((error: unknown) =>
            setNotice(error instanceof Error ? error.message : 'That dossier could not be saved.'),
          );
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  const filteredCharacters = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return characters;
    return characters.filter((record) =>
      [record.name, record.alias, record.style, record.faction, record.overallClass]
        .join(' ')
        .toLowerCase()
        .includes(normalized),
    );
  }, [characters, query]);

  const filteredSources = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return sources;
    return sources.filter((source) =>
      [source.title, source.kind, source.tags.join(' '), source.characterNames.join(' '), source.text]
        .join(' ')
        .toLowerCase()
        .includes(normalized),
    );
  }, [sources, query]);

  const findings = useMemo(() => scanArcContinuity(characters, sources), [characters, sources]);

  function openQuickLink(companionId: 'quill' | 'snow', initialDraft: string) {
    window.dispatchEvent(
      new CustomEvent('system:open-quick-link', { detail: { companionId, initialDraft } }),
    );
  }

  function loadInForge(record: ArcCharacterRecord) {
    pendingForgeRecordRef.current = record;
    setView('forge');
    setNotice(`${record.name} sent to the Dossier Forge.`);
  }

  function synchronizePendingDossier() {
    const record = pendingForgeRecordRef.current;
    if (!record) return;
    frameRef.current?.contentWindow?.postMessage(
      {
        type: 'arc:load-dossier',
        payload: {
          schema: 'ARC_Profile_Template',
          version: record.schemaVersion,
          data: record.data,
        },
      },
      window.location.origin,
    );
    pendingForgeRecordRef.current = undefined;
  }

  async function importDossiers(event: ChangeEvent<HTMLInputElement>) {
    const files = [...(event.target.files ?? [])];
    event.target.value = '';
    if (!files.length) return;
    let imported = 0;
    for (const file of files) {
      try {
        await importArcDossierFile(file);
        imported += 1;
      } catch (error) {
        setNotice(error instanceof Error ? error.message : `${file.name} could not be imported.`);
        return;
      }
    }
    await refresh();
    setNotice(`${imported} character dossier${imported === 1 ? '' : 's'} secured locally.`);
  }

  async function importCanon(event: ChangeEvent<HTMLInputElement>) {
    const files = [...(event.target.files ?? [])];
    event.target.value = '';
    if (!files.length) return;
    let imported = 0;
    for (const file of files) {
      try {
        if (file.name.toLowerCase().endsWith('.json')) {
          try {
            await importArcDossierFile(file);
          } catch {
            await importArcCanonFile(file, 'reference');
          }
        } else {
          await importArcCanonFile(file, 'reference');
        }
        imported += 1;
      } catch (error) {
        setNotice(error instanceof Error ? error.message : `${file.name} could not be imported.`);
        return;
      }
    }
    await refresh();
    setNotice(`${imported} archive source${imported === 1 ? '' : 's'} indexed locally.`);
  }

  async function addManualSource() {
    try {
      await saveArcCanonSource({
        title: sourceTitle,
        kind: sourceKind,
        tags: sourceTags.split(',').map((tag) => tag.trim()),
        characterNames: sourceCharacters.split(',').map((name) => name.trim()),
        text: sourceText,
      });
      setSourceTitle('');
      setSourceTags('');
      setSourceCharacters('');
      setSourceText('');
      await refresh();
      setNotice('Canon source secured. Quill can retrieve it by subject, tag, or character.');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'That source could not be saved.');
    }
  }

  async function removeCharacter(record: ArcCharacterRecord) {
    if (!window.confirm(`Remove ${record.name} from this device's A.R.C. Library?`)) return;
    await db.arcCharacters.delete(record.id);
    await refresh();
    setNotice(`${record.name} removed from this device. Exported JSON copies are unaffected.`);
  }

  async function removeSource(source: ArcCanonSource) {
    if (!window.confirm(`Remove ${source.title} from this device's Canon Vault?`)) return;
    await db.arcCanonSources.delete(source.id);
    await refresh();
    setNotice(`${source.title} removed from this device.`);
  }

  return (
    <div className="page arc-archives-page">
      <section className="arc-hero">
        <div className="arc-hero__portrait" aria-hidden="true">
          <img src={getCompanionImage(quill.image)} alt="" />
          <i />
          <i />
        </div>
        <div className="arc-hero__copy">
          <span className="section-kicker">A.R.C. RECORDS DIVISION · VERSION 8.0</span>
          <h1>A.R.C. Archives</h1>
          <p>
            Your original Character Archives now live inside The System—complete with the 152-Art
            Codex, 0–1000 Graced stat engine, printable dossiers, a private canon vault, and Quill's
            source-grounded story counsel.
          </p>
          <div className="arc-hero__actions">
            <button
              className="button"
              onClick={() =>
                openQuickLink(
                  'quill',
                  `Quill, open the story room. I have ${characters.length} character dossiers and ${sources.length} canon sources loaded. `,
                )
              }
            >
              <MessageCircleMore size={17} /> Talk to Quill
            </button>
            <button
              className="button button--ghost"
              onClick={() =>
                openQuickLink('snow', 'Snow, I want to talk A.R.C. spoilers with you and Quill. ')
              }
            >
              <Snowflake size={17} /> Spoiler link with Snow
            </button>
          </div>
        </div>
        <div className="arc-hero__telemetry">
          <span><strong>{characters.length}</strong> Characters</span>
          <span><strong>{sources.length}</strong> Canon sources</span>
          <span><strong>152</strong> Recorded Arts</span>
        </div>
      </section>

      <nav className="arc-command-nav" aria-label="A.R.C. Archives views">
        {([
          ['library', LibraryBig, 'Character Library'],
          ['forge', FileJson, 'Dossier Forge'],
          ['vault', BookOpen, 'Canon Vault'],
          ['continuity', BrainCircuit, 'Continuity Scan'],
        ] as const).map(([id, Icon, label]) => (
          <button key={id} className={view === id ? 'is-active' : ''} onClick={() => setView(id)}>
            <Icon size={17} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="arc-notice" aria-live="polite">
        <Sparkles size={15} /> {notice}
      </div>

      {view === 'library' && (
        <section className="arc-section">
          <header className="arc-section__header">
            <div>
              <span className="section-kicker">PRIVATE · ON-DEVICE</span>
              <h2>Character Library</h2>
              <p>Import any v4 or legacy A.R.C. JSON. Existing names update instead of multiplying.</p>
            </div>
            <label className="button">
              <Upload size={17} /> Import dossiers
              <input type="file" accept=".json,application/json" multiple hidden onChange={importDossiers} />
            </label>
          </header>
          <label className="arc-search">
            <Search size={17} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, alias, Style, faction, or Class…" />
          </label>
          {filteredCharacters.length ? (
            <div className="arc-character-grid">
              {filteredCharacters.map((record) => (
                <article className="arc-character-card" key={record.id}>
                  <header>
                    <span>{record.style || 'STYLE UNFILED'}</span>
                    <strong>{record.completion}%</strong>
                  </header>
                  <h3>{record.name}</h3>
                  <p>{record.alias || 'Alias not recorded'}</p>
                  <dl>
                    <div><dt>Overall</dt><dd>{record.overallClass}</dd></div>
                    <div><dt>Story path</dt><dd>{record.startingClass || '—'} → {record.endingClass || '—'}</dd></div>
                    <div><dt>Faction</dt><dd>{record.faction || 'Unfiled'}</dd></div>
                  </dl>
                  <footer>
                    <button onClick={() => loadInForge(record)}><FileJson size={15} /> Open</button>
                    <button onClick={() => downloadArcDossier(record)}><Download size={15} /> JSON</button>
                    <button className="is-danger" onClick={() => void removeCharacter(record)} aria-label={`Remove ${record.name}`}><Trash2 size={15} /></button>
                  </footer>
                </article>
              ))}
            </div>
          ) : (
            <div className="arc-empty">
              <LibraryBig size={34} />
              <h3>{characters.length ? 'No records match that signal.' : 'The shelves are ready.'}</h3>
              <p>Import your existing character JSON files or create the first dossier in the Forge.</p>
              <button className="button button--ghost" onClick={() => setView('forge')}>Open Dossier Forge</button>
            </div>
          )}
        </section>
      )}

      {view === 'forge' && (
        <section className="arc-section arc-forge-section">
          <header className="arc-section__header">
            <div>
              <span className="section-kicker">ORIGINAL A.R.C. ENGINE · SYSTEM LINKED</span>
              <h2>Dossier Forge + Arts Codex</h2>
              <p>Build, preview, print to PDF, and save JSON exactly as before. Saving also updates the private Library.</p>
            </div>
            <div className="arc-forge-actions">
              <button className="button button--ghost" onClick={() => frameRef.current?.contentWindow?.postMessage({ type: 'arc:open-codex' }, window.location.origin)}>
                <BookOpen size={17} /> 152-Art Codex
              </button>
              <button className="button" onClick={() => frameRef.current?.contentWindow?.postMessage({ type: 'arc:request-dossier' }, window.location.origin)}>
                <Save size={17} /> Save to System Library
              </button>
            </div>
          </header>
          <div className="arc-forge-frame">
            <iframe
              ref={frameRef}
              title="A.R.C. Character Dossier Forge"
              src={`${import.meta.env.BASE_URL}arc-archives/index.html?embedded=1`}
              onLoad={synchronizePendingDossier}
            />
          </div>
        </section>
      )}

      {view === 'vault' && (
        <section className="arc-section">
          <header className="arc-section__header">
            <div>
              <span className="section-kicker">LOCAL RETRIEVAL · SOURCE-AWARE</span>
              <h2>Canon Vault</h2>
              <p>Quill retrieves only the records relevant to your question and labels established canon, inference, and new ideas separately.</p>
            </div>
            <label className="button">
              <FilePlus2 size={17} /> Import text records
              <input type="file" accept=".txt,.md,.json,text/plain,text/markdown,application/json" multiple hidden onChange={importCanon} />
            </label>
          </header>
          <div className="arc-vault-layout">
            <div className="arc-source-form">
              <h3>File a canon source</h3>
              <label>Title<input value={sourceTitle} onChange={(event) => setSourceTitle(event.target.value)} placeholder="The Origin of Nature Energy" /></label>
              <label>Record type<select value={sourceKind} onChange={(event) => setSourceKind(event.target.value as ArcCanonSourceKind)}>{SOURCE_KINDS.map((kind) => <option key={kind.value} value={kind.value}>{kind.label}</option>)}</select></label>
              <label>Tags<input value={sourceTags} onChange={(event) => setSourceTags(event.target.value)} placeholder="Brigade, Nature Energy, Volume 1" /></label>
              <label>Characters named<input value={sourceCharacters} onChange={(event) => setSourceCharacters(event.target.value)} placeholder="Laz, Lucius, Fleur" /></label>
              <label>Canon text<textarea value={sourceText} onChange={(event) => setSourceText(event.target.value)} rows={10} placeholder="Paste the authoritative record here…" /></label>
              <button className="button" onClick={() => void addManualSource()}><ShieldCheck size={17} /> Secure source</button>
            </div>
            <div className="arc-source-list">
              <label className="arc-search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search the Canon Vault…" /></label>
              {filteredSources.map((source) => (
                <article key={source.id}>
                  <header><span>{source.kind.replace('-', ' ')}</span><button onClick={() => void removeSource(source)} aria-label={`Remove ${source.title}`}><Trash2 size={14} /></button></header>
                  <h3>{source.title}</h3>
                  <p>{source.text.slice(0, 260)}{source.text.length > 260 ? '…' : ''}</p>
                  <small>{[...source.tags, ...source.characterNames].slice(0, 8).join(' · ') || 'No index tags yet'}</small>
                </article>
              ))}
              {!filteredSources.length && <div className="arc-empty arc-empty--compact"><BookOpen size={28} /><h3>No canon sources filed yet.</h3><p>Text, Markdown, and JSON are supported in this first secure intake.</p></div>}
            </div>
          </div>
        </section>
      )}

      {view === 'continuity' && (
        <section className="arc-section">
          <header className="arc-section__header">
            <div>
              <span className="section-kicker">ARCHIVE INTEGRITY · NON-DESTRUCTIVE</span>
              <h2>Continuity Scanner</h2>
              <p>The scanner flags gaps and collisions. It never rewrites canon; Quill proposes and you decide.</p>
            </div>
            <button className="button" onClick={() => openQuickLink('quill', `Quill, run a deep continuity review of the ${characters.length} dossiers and ${sources.length} canon sources in my Archives. Cite each record you rely on, distinguish contradictions from open questions, and do not change canon. `)}>
              <BrainCircuit size={17} /> Deep review with Quill
            </button>
          </header>
          <div className="arc-findings">
            {findings.map((finding, index) => (
              <article key={`${finding.title}-${index}`} data-level={finding.level}>
                <span>{finding.level === 'clear' ? <CheckCircle2 size={19} /> : <Sparkles size={19} />}</span>
                <div><small>{finding.level}</small><h3>{finding.title}</h3><p>{finding.detail}</p></div>
              </article>
            ))}
          </div>
          <aside className="arc-truth-protocol">
            <ShieldCheck size={24} />
            <div><h3>Canon Truth Protocol</h3><p>Established facts require a named local source. Inferences are labeled. New ideas remain proposals until you approve and file them. No companion silently edits A.R.C.</p></div>
          </aside>
        </section>
      )}
    </div>
  );
}
