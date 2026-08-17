import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  BookOpenCheck,
  Braces,
  ExternalLink,
  LibraryBig,
  MessageSquareCode,
  RadioTower,
  Search,
  ShieldCheck,
  Sigma,
  Sparkles,
  Trash2,
} from 'lucide-react';
import {
  buildCipherTopicPrompt,
  ENGINEERING_LIBRARY_CATEGORIES,
  ENGINEERING_LIBRARY_TOPICS,
  searchEngineeringLibrary,
  type EngineeringLibraryCategory,
} from '@/config/engineeringLibrary';
import { getCompanion, getCompanionImage } from '@/config/companions';
import { Link } from '@/router';
import {
  deleteEngineeringResearch,
  getEngineeringResearchHistory,
  saveEngineeringResearch,
  type EngineeringResearchNote,
} from '@/game/engineeringResearch';
import { estimateTextCostUsd, recordAiUsage } from '@/game/aiVoice';
import { requestEngineeringResearch } from '@/services/aiHeadquarters';
import { useGameStore } from '@/store/useGameStore';

const CATEGORY_ICONS = {
  'RF Foundations': RadioTower,
  'Network Analysis': Sigma,
  'Spectrum & Noise': RadioTower,
  'Test Equipment': ShieldCheck,
  'Data & Automation': Braces,
  'Software Systems': MessageSquareCode,
} satisfies Record<EngineeringLibraryCategory, typeof RadioTower>;

function askCipher(prompt: string) {
  window.dispatchEvent(
    new CustomEvent('system:open-quick-link', {
      detail: { companionId: 'cipher', initialDraft: prompt },
    }),
  );
}

export function CipherLibraryPage() {
  const cipher = getCompanion('cipher');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<EngineeringLibraryCategory>();
  const [researchQuery, setResearchQuery] = useState('');
  const [researching, setResearching] = useState(false);
  const [researchError, setResearchError] = useState('');
  const [researchNotes, setResearchNotes] = useState<EngineeringResearchNote[]>([]);
  const settings = useGameStore((state) => state.settings);
  const topics = useMemo(() => searchEngineeringLibrary(query, category), [query, category]);

  const refreshResearch = () => void getEngineeringResearchHistory().then(setResearchNotes);
  useEffect(refreshResearch, []);

  const researchLive = async () => {
    const nextQuery = researchQuery.trim();
    if (!nextQuery) return;
    setResearching(true);
    setResearchError('');
    try {
      const result = await requestEngineeringResearch(nextQuery);
      const note = await saveEngineeringResearch(nextQuery, result);
      setResearchNotes((current) => [note, ...current.filter((item) => item.id !== note.id)]);
      setResearchQuery('');
      if (result.usage) {
        await recordAiUsage({
          kind: 'text',
          sessionId: 'cipher-engineering-research',
          companionId: 'cipher',
          model: result.model,
          inputTokens: result.usage.inputTokens,
          cachedInputTokens: result.usage.cachedInputTokens,
          outputTokens: result.usage.outputTokens,
          reasoningTokens: result.usage.reasoningTokens,
          totalTokens: result.usage.totalTokens,
          characters: 0,
          audioSeconds: 0,
          estimatedCostUsd:
            estimateTextCostUsd(
              result.model,
              result.usage.inputTokens,
              result.usage.outputTokens,
              result.usage.cachedInputTokens,
            ) + result.estimatedSearchCostUsd,
          exactUsage: true,
        });
      }
    } catch (cause) {
      setResearchError(
        cause instanceof Error ? cause.message : 'Cipher could not complete that research.',
      );
    } finally {
      setResearching(false);
    }
  };

  return (
    <div className="page cipher-library-page">
      <div className="party-chat__topbar">
        <Link className="text-link" to="/cipher">
          <ArrowLeft size={17} /> Cipher Nexus
        </Link>
        <span className="party-chat__saved">
          <ShieldCheck size={15} /> Core library available offline
        </span>
      </div>

      <section className="cipher-library-hero panel">
        <img src={getCompanionImage(cipher.image)} alt="Cipher" />
        <div>
          <p className="eyebrow">CIPHER ENGINEERING LIBRARY · VERIFIED FOUNDATIONS</p>
          <h1>The technical mind of The System.</h1>
          <p>
            RF, S-parameters, phase noise, test equipment, Excel, data automation, coding, and
            debugging—organized into practical dossiers grounded in official technical sources.
          </p>
          <div className="cipher-library-hero__actions">
            <button
              className="button button--primary"
              type="button"
              onClick={() =>
                askCipher(
                  'Cipher, open the Engineering Library. Help me identify what I should study next based on the engineering work I am doing right now. Ask me only the questions you actually need.',
                )
              }
            >
              <MessageSquareCode size={17} /> Consult Cipher
            </button>
            <span>
              <LibraryBig size={16} /> {ENGINEERING_LIBRARY_TOPICS.length} field dossiers
            </span>
          </div>
        </div>
      </section>

      <section className="cipher-library-search panel">
        <label>
          <Search size={18} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search S21, phase noise, VNA calibration, Excel, Python…"
          />
        </label>
        <div className="cipher-library-filters" aria-label="Engineering library categories">
          <button
            className={!category ? 'is-active' : ''}
            type="button"
            onClick={() => setCategory(undefined)}
          >
            All systems
          </button>
          {ENGINEERING_LIBRARY_CATEGORIES.map((item) => (
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

      <section className="cipher-research panel">
        <div className="cipher-research__heading">
          <span>
            <Sparkles size={20} />
          </span>
          <div>
            <p className="eyebrow">LIVE RESEARCH DESK</p>
            <h2>Send Cipher beyond the built-in shelves.</h2>
            <p>
              One deliberate web-grounded AI request. Cipher prioritizes standards, manufacturer
              manuals, official documentation, and research papers, then saves the finished note
              locally for offline return.
            </p>
          </div>
        </div>
        <div className="cipher-research__input">
          <textarea
            value={researchQuery}
            onChange={(event) => setResearchQuery(event.target.value)}
            maxLength={1200}
            placeholder="Example: Explain how to choose RBW and averaging for a phase-noise spot measurement, and tell me what I must verify in my analyzer manual."
          />
          <button
            className="button button--primary"
            type="button"
            disabled={researching || !researchQuery.trim() || settings?.aiLinkMode !== 'online'}
            onClick={() => void researchLive()}
          >
            <Sparkles size={17} /> {researching ? 'Cipher is researching…' : 'Research live'}
          </button>
        </div>
        <small>
          Uses your OpenAI API balance and never runs automatically. The System meter records the
          returned model tokens plus $0.01 for each web-search call actually used.
        </small>
        {researchError && <p className="cipher-research__error">{researchError}</p>}
        {researchNotes.map((note) => (
          <details
            className="cipher-research-note"
            key={note.id}
            open={researchNotes[0]?.id === note.id}
          >
            <summary>
              <span>
                <strong>{note.query}</strong>
                <small>
                  {new Date(note.createdAt).toLocaleString()} · {note.model} ·{' '}
                  {note.webSearchCalls ?? 0} web search{' '}
                  {(note.webSearchCalls ?? 0) === 1 ? 'call' : 'calls'}
                </small>
              </span>
            </summary>
            <div>
              <p>{note.answer}</p>
              {note.sources.length > 0 && (
                <section>
                  <h3>Sources</h3>
                  {note.sources.map((source) => (
                    <a href={source.url} target="_blank" rel="noreferrer" key={source.url}>
                      {source.title}
                      <ExternalLink size={14} />
                    </a>
                  ))}
                </section>
              )}
              <button
                className="button button--ghost"
                type="button"
                onClick={() => void deleteEngineeringResearch(note.id).then(refreshResearch)}
              >
                <Trash2 size={16} /> Delete saved note
              </button>
            </div>
          </details>
        ))}
      </section>

      <section className="cipher-library-grid">
        {topics.map((topic) => {
          const Icon = CATEGORY_ICONS[topic.category];
          return (
            <details className="panel cipher-dossier" key={topic.id}>
              <summary>
                <span>
                  <Icon size={20} />
                </span>
                <div>
                  <small>
                    {topic.category} · {topic.level}
                  </small>
                  <strong>{topic.title}</strong>
                  <p>{topic.summary}</p>
                </div>
              </summary>
              <div className="cipher-dossier__body">
                <div className="cipher-dossier__why">
                  <span>WHY CIPHER CARES</span>
                  <p>{topic.whyItMatters}</p>
                </div>
                <div className="cipher-dossier__columns">
                  <div>
                    <h3>Core concepts</h3>
                    <ul>
                      {topic.keyConcepts.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3>Bench checklist</h3>
                    <ol>
                      {topic.fieldChecklist.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ol>
                  </div>
                  <div>
                    <h3>Common traps</h3>
                    <ul>
                      {topic.commonTraps.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="cipher-dossier__sources">
                  <h3>
                    <BookOpenCheck size={17} /> Official grounding
                  </h3>
                  {topic.sources.map((source) => (
                    <a key={source.url} href={source.url} target="_blank" rel="noreferrer">
                      <span>
                        <strong>{source.title}</strong>
                        <small>{source.organization}</small>
                      </span>
                      <ExternalLink size={15} />
                    </a>
                  ))}
                </div>
                <button
                  className="button button--secondary"
                  type="button"
                  onClick={() => askCipher(buildCipherTopicPrompt(topic))}
                >
                  <MessageSquareCode size={17} /> Ask Cipher about this dossier
                </button>
              </div>
            </details>
          );
        })}
      </section>

      {!topics.length && (
        <section className="empty-state panel">
          <Search size={28} />
          <h2>No dossier matched that exact signal.</h2>
          <p>Cipher can still reason through it and tell you where the library needs to grow.</p>
          <button
            className="button button--primary"
            type="button"
            onClick={() =>
              askCipher(
                `Cipher, your Engineering Library does not yet have a dossier matching “${query}.” Teach me the reliable foundation, state what you are uncertain about, tell me which primary sources or equipment manuals we should verify, and propose a new library dossier.`,
              )
            }
          >
            Ask Cipher and propose expansion
          </button>
        </section>
      )}

      <section className="cipher-library-boundary panel">
        <ShieldCheck size={22} />
        <div>
          <h2>Engineering truth boundary</h2>
          <p>
            Cipher never invents measured values, calibration state, instrument options, or safety
            limits. Built-in dossiers work offline. Questions use your existing online AI link;
            primary manuals and lab procedures remain authoritative for real hardware.
          </p>
        </div>
      </section>
    </div>
  );
}
