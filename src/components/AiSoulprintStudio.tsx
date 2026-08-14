import { ChevronDown, RotateCcw, Save, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { COMPANIONS, getCompanion, getCompanionImage } from '@/config/companions';
import { db } from '@/db/database';
import type { AiSoulprintNotes, CompanionId, Settings } from '@/types/game';

const EMPTY_NOTES: AiSoulprintNotes = {
  humor: '',
  challenge: '',
  care: '',
  casual: '',
  conflict: '',
  bonds: '',
  never: '',
};

const FIELDS: Array<{
  key: keyof AiSoulprintNotes;
  label: string;
  prompt: string;
  placeholder: string;
}> = [
  {
    key: 'humor',
    label: 'Humor',
    prompt: 'How do they joke, tease, or make a moment lighter?',
    placeholder: 'Example: dry sisterly teasing; never forced jokes or constant sarcasm.',
  },
  {
    key: 'challenge',
    label: 'How they push me',
    prompt: 'What does their accountability feel like when you are avoiding the work?',
    placeholder: 'Example: call out the excuse directly, then give me one immediate move.',
  },
  {
    key: 'care',
    label: 'How they care',
    prompt: 'How should concern, encouragement, and affection show up?',
    placeholder: 'Example: protect my dignity, stay close, and do not smother me with praise.',
  },
  {
    key: 'casual',
    label: 'Off-duty personality',
    prompt: 'What are they like when you are simply talking as friends?',
    placeholder: 'Example: relaxed, curious, playful, and comfortable changing the subject.',
  },
  {
    key: 'conflict',
    label: 'Disagreement style',
    prompt: 'How do they disagree with you or another companion?',
    placeholder: 'Example: honest but calm; explain why and never become cold or superior.',
  },
  {
    key: 'bonds',
    label: 'Party relationships',
    prompt: 'What chemistry, loyalties, or running dynamics should they have with the party?',
    placeholder: 'Example: respects Cipher but loves puncturing his smug moments.',
  },
  {
    key: 'never',
    label: 'Never break character by…',
    prompt: 'Which habits would make this companion feel fake or wrong?',
    placeholder: 'Example: never sound corporate, preachy, possessive, or endlessly agreeable.',
  },
];

function normalizedNotes(notes?: AiSoulprintNotes): AiSoulprintNotes {
  return Object.fromEntries(
    Object.keys(EMPTY_NOTES).map((key) => [key, notes?.[key as keyof AiSoulprintNotes] ?? '']),
  ) as unknown as AiSoulprintNotes;
}

export function AiSoulprintStudio({
  settings,
  refresh,
  onNotice,
}: {
  settings: Settings;
  refresh: () => Promise<void>;
  onNotice: (message: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<CompanionId>('snow');
  const [draft, setDraft] = useState<AiSoulprintNotes>(() =>
    normalizedNotes(settings.aiSoulprintNotes.snow),
  );
  const [saving, setSaving] = useState(false);
  const companion = getCompanion(selectedId);
  const saved = useMemo(
    () => normalizedNotes(settings.aiSoulprintNotes[selectedId]),
    [selectedId, settings.aiSoulprintNotes],
  );
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
  const authoredCount = Object.values(settings.aiSoulprintNotes).filter((notes) =>
    notes ? Object.values(notes).some((value) => value.trim()) : false,
  ).length;

  useEffect(() => {
    setDraft(normalizedNotes(settings.aiSoulprintNotes[selectedId]));
  }, [selectedId, settings.aiSoulprintNotes]);

  async function save() {
    setSaving(true);
    try {
      const next = Object.fromEntries(
        Object.entries(draft).map(([key, value]) => [key, value.trim().slice(0, 420)]),
      ) as unknown as AiSoulprintNotes;
      await db.settings.update('primary', {
        aiSoulprintNotes: { ...settings.aiSoulprintNotes, [selectedId]: next },
      });
      await refresh();
      onNotice(`${companion.name}'s Director's Notes are saved on this device.`);
    } catch (error) {
      onNotice(
        error instanceof Error ? error.message : 'Those Director’s Notes could not be saved.',
      );
    } finally {
      setSaving(false);
    }
  }

  function selectCompanion(companionId: CompanionId) {
    if (
      dirty &&
      !window.confirm(`Discard the unsaved changes to ${companion.name}'s Director's Notes?`)
    ) {
      return;
    }
    setSelectedId(companionId);
  }

  async function clear() {
    if (
      !window.confirm(
        `Clear your custom Director's Notes for ${companion.name}? Their canon Soulprint will remain intact.`,
      )
    ) {
      return;
    }
    const next = { ...settings.aiSoulprintNotes };
    delete next[selectedId];
    await db.settings.update('primary', { aiSoulprintNotes: next });
    await refresh();
    setDraft({ ...EMPTY_NOTES });
    onNotice(`${companion.name}'s custom notes were cleared. Their canon Soulprint is unchanged.`);
  }

  return (
    <section className={`ai-soulprint-studio ${open ? 'is-open' : ''}`}>
      <button
        type="button"
        className="ai-soulprint-studio__summary"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
      >
        <span className="ai-soulprint-studio__sigil">
          <Sparkles size={18} />
        </span>
        <span>
          <strong>Soulprint Studio</strong>
          <small>
            Your Director's Notes · {authoredCount}/{COMPANIONS.length} companion
            {authoredCount === 1 ? '' : 's'}
          </small>
        </span>
        <ChevronDown size={17} />
      </button>

      {open && (
        <div className="ai-soulprint-studio__body">
          <p>
            Add the little details that make each companion feel real to you. These notes guide
            performance and chemistry; their established identity, factual grounding, and safety
            boundaries always remain intact.
          </p>
          <div className="ai-soulprint-studio__roster" aria-label="Choose a companion to direct">
            {COMPANIONS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={item.id === selectedId ? 'is-active' : ''}
                onClick={() => selectCompanion(item.id)}
                title={item.name}
              >
                <img src={getCompanionImage(item.image)} alt="" />
                <span>{item.name}</span>
              </button>
            ))}
          </div>
          <header className="ai-soulprint-studio__identity">
            <img src={getCompanionImage(companion.image)} alt="" />
            <span>
              <strong>{companion.name}</strong>
              <small>{companion.title} · canon Soulprint + your direction</small>
            </span>
          </header>
          <div className="ai-soulprint-studio__fields">
            {FIELDS.map((field) => (
              <label key={field.key}>
                <span>
                  <strong>{field.label}</strong>
                  <small>{field.prompt}</small>
                </span>
                <textarea
                  value={draft[field.key]}
                  maxLength={420}
                  rows={3}
                  placeholder={field.placeholder}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, [field.key]: event.target.value }))
                  }
                />
                <small>{draft[field.key].length}/420</small>
              </label>
            ))}
          </div>
          <div className="ai-soulprint-studio__actions">
            <button
              type="button"
              className="button button--primary"
              onClick={save}
              disabled={!dirty || saving}
            >
              <Save size={16} /> {saving ? 'Saving…' : `Save ${companion.name}`}
            </button>
            <button
              type="button"
              className="button button--secondary"
              onClick={clear}
              disabled={!Object.values(saved).some(Boolean)}
            >
              <RotateCcw size={16} /> Clear custom notes
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
