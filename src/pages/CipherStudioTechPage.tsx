import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  BookOpenCheck,
  Camera,
  ExternalLink,
  Lightbulb,
  MessageSquareCode,
  Mic2,
  MonitorPlay,
  Search,
  ShieldCheck,
  Wrench,
} from 'lucide-react';
import {
  buildStudioTechPrompt,
  searchStudioTechLibrary,
  STUDIO_TECH_CATEGORIES,
  STUDIO_TECH_TOPICS,
  type StudioTechCategory,
} from '@/config/studioTechLibrary';
import { Link } from '@/router';

const CATEGORY_ICONS = {
  'Camera & Capture': Camera,
  Audio: Mic2,
  Lighting: Lightbulb,
  Streaming: MonitorPlay,
  Delivery: BookOpenCheck,
  Troubleshooting: Wrench,
} satisfies Record<StudioTechCategory, typeof Camera>;

function askCipher(initialDraft: string) {
  window.dispatchEvent(
    new CustomEvent('system:open-quick-link', {
      detail: { companionId: 'cipher', initialDraft },
    }),
  );
}

export function CipherStudioTechPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<StudioTechCategory>();
  const topics = useMemo(() => searchStudioTechLibrary(query, category), [query, category]);
  return (
    <div className="page cipher-studio-page">
      <div className="party-chat__topbar">
        <Link className="text-link" to="/cipher">
          <ArrowLeft size={17} /> Cipher Nexus
        </Link>
        <span className="party-chat__saved">
          <ShieldCheck size={15} /> Core vault available offline
        </span>
      </div>

      <section className="cipher-studio-hero panel">
        <div className="cipher-studio-hero__mark">
          <MonitorPlay size={34} />
        </div>
        <div>
          <p className="eyebrow">CIPHER STUDIO TECH VAULT</p>
          <h1>Build the creator signal chain on purpose.</h1>
          <p>
            A practical glossary for the complete path from lens and microphone to capture, OBS,
            encoder, upload, and viewer—plus the checks that isolate failures without guessing.
          </p>
          <span>{STUDIO_TECH_TOPICS.length} source-grounded technical dossiers</span>
        </div>
      </section>

      <section className="cipher-library-search panel">
        <label>
          <Search size={18} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search camera, mic, capture card, OBS, bitrate, sync…"
          />
        </label>
        <div className="cipher-library-filters" aria-label="Studio technology categories">
          <button
            className={!category ? 'is-active' : ''}
            type="button"
            onClick={() => setCategory(undefined)}
          >
            All systems
          </button>
          {STUDIO_TECH_CATEGORIES.map((item) => (
            <button
              className={category === item ? 'is-active' : ''}
              type="button"
              key={item}
              onClick={() => setCategory(category === item ? undefined : item)}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      <section className="cipher-studio-grid">
        {topics.map((topic) => {
          const Icon = CATEGORY_ICONS[topic.category];
          return (
            <details className="panel cipher-studio-dossier" key={topic.id}>
              <summary>
                <span>
                  <Icon size={21} />
                </span>
                <div>
                  <small>{topic.category}</small>
                  <strong>{topic.title}</strong>
                  <p>{topic.summary}</p>
                </div>
              </summary>
              <div className="cipher-studio-dossier__body">
                <div>
                  <h3>Signal knowledge</h3>
                  <ul>
                    {topic.concepts.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3>Setup checklist</h3>
                  <ol>
                    {topic.setupChecklist.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ol>
                </div>
                <div>
                  <h3>Fault isolation</h3>
                  <ul>
                    {topic.diagnostics.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <section className="cipher-studio-dossier__sources">
                  <h3>
                    <BookOpenCheck size={17} /> Official source shelf
                  </h3>
                  {topic.sources.map((source) => (
                    <a href={source.url} target="_blank" rel="noreferrer" key={source.url}>
                      <span>
                        <strong>{source.title}</strong>
                        <small>{source.organization}</small>
                      </span>
                      <ExternalLink size={15} />
                    </a>
                  ))}
                </section>
                <button
                  className="button button--secondary"
                  type="button"
                  onClick={() => askCipher(buildStudioTechPrompt(topic))}
                >
                  <MessageSquareCode size={17} /> Apply this with Cipher
                </button>
              </div>
            </details>
          );
        })}
      </section>

      {!topics.length && (
        <section className="empty-state panel">
          <Search size={28} />
          <h2>No stored dossier matched.</h2>
          <p>
            Cipher can still troubleshoot the exact setup and identify what the vault should add
            next.
          </p>
          <button
            className="button button--primary"
            type="button"
            onClick={() =>
              askCipher(
                `Cipher, your Studio Tech Vault does not yet match “${query}.” Help me diagnose or learn it from official current sources, ask for the exact gear and signal path, and propose the missing dossier.`,
              )
            }
          >
            Ask Cipher
          </button>
        </section>
      )}
    </div>
  );
}
