import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  BrainCircuit,
  CheckCircle2,
  FlaskConical,
  Gauge,
  GraduationCap,
  MessageSquareCode,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  XCircle,
} from 'lucide-react';
import { quizQuestionsFor, type CipherQuizCategory } from '@/config/cipherStudy';
import {
  emptyCipherStudyProgress,
  getCipherStudyProgress,
  saveCipherQuizAttempt,
  type CipherStudyProgress,
} from '@/game/cipherStudyProgress';
import {
  DEFAULT_PHASE_NOISE_SETTINGS,
  formatEngineeringDuration,
  simulatePhaseNoiseBench,
  type PhaseNoiseBenchSettings,
  type PhaseNoisePoint,
} from '@/game/phaseNoiseSimulator';
import { CipherMeasurementLabs } from '@/components/CipherMeasurementLabs';
import { Link } from '@/router';

const QUIZ_CATEGORIES: CipherQuizCategory[] = [
  'RF',
  'Phase Noise',
  'Test Equipment',
  'Studio Tech',
];

function askCipher(initialDraft: string) {
  window.dispatchEvent(
    new CustomEvent('system:open-quick-link', {
      detail: { companionId: 'cipher', initialDraft },
    }),
  );
}

function graphPath(
  points: PhaseNoisePoint[],
  key: keyof Pick<PhaseNoisePoint, 'dutDbcHz' | 'analyzerFloorDbcHz' | 'measuredDbcHz'>,
) {
  return points
    .map((point, index) => {
      const x = 48 + ((Math.log10(point.offsetHz) - 1) / 6) * 592;
      const y = 18 + ((Math.max(-180, Math.min(-60, point[key])) + 180) / 120) * 238;
      return `${index ? 'L' : 'M'} ${x.toFixed(1)} ${(274 - y).toFixed(1)}`;
    })
    .join(' ');
}

function PhaseNoiseBench() {
  const [settings, setSettings] = useState<PhaseNoiseBenchSettings>(DEFAULT_PHASE_NOISE_SETTINGS);
  const result = useMemo(() => simulatePhaseNoiseBench(settings), [settings]);
  const setNumber = (key: keyof PhaseNoiseBenchSettings, value: number) =>
    setSettings((current) => ({ ...current, [key]: value }));
  const markerX = 48 + ((Math.log10(settings.markerOffsetHz) - 1) / 6) * 592;
  return (
    <section className="cipher-bench panel">
      <header>
        <div>
          <p className="eyebrow">EDUCATIONAL SIGNAL SOURCE ANALYZER</p>
          <h2>FSWP-Style Phase-Noise Bench</h2>
          <p>
            Inject a modeled carrier, change the DUT and analyzer conditions, and watch what is
            actually measurable.
          </p>
        </div>
        <button
          className="button button--ghost"
          type="button"
          onClick={() => setSettings(DEFAULT_PHASE_NOISE_SETTINGS)}
        >
          <RotateCcw size={16} /> Reset bench
        </button>
      </header>

      <div className="cipher-bench__workspace">
        <div className="cipher-bench__controls">
          <label>
            <span>
              Carrier frequency <b>{settings.carrierGHz.toFixed(2)} GHz</b>
            </span>
            <input
              type="range"
              min="0.1"
              max="26"
              step="0.1"
              value={settings.carrierGHz}
              onChange={(event) => setNumber('carrierGHz', Number(event.target.value))}
            />
          </label>
          <label>
            <span>
              Input power <b>{settings.inputPowerDbm} dBm</b>
            </span>
            <input
              type="range"
              min="-30"
              max="18"
              step="1"
              value={settings.inputPowerDbm}
              onChange={(event) => setNumber('inputPowerDbm', Number(event.target.value))}
            />
          </label>
          <label>
            <span>
              DUT noise at 1 kHz <b>{settings.closeInNoiseDbcHz} dBc/Hz</b>
            </span>
            <input
              type="range"
              min="-155"
              max="-80"
              step="1"
              value={settings.closeInNoiseDbcHz}
              onChange={(event) => setNumber('closeInNoiseDbcHz', Number(event.target.value))}
            />
          </label>
          <label>
            <span>
              Noise slope <b>{settings.flickerSlopeDbPerDecade} dB/dec</b>
            </span>
            <input
              type="range"
              min="0"
              max="40"
              step="1"
              value={settings.flickerSlopeDbPerDecade}
              onChange={(event) => setNumber('flickerSlopeDbPerDecade', Number(event.target.value))}
            />
          </label>
          <label>
            <span>
              White floor <b>{settings.whiteFloorDbcHz} dBc/Hz</b>
            </span>
            <input
              type="range"
              min="-175"
              max="-120"
              step="1"
              value={settings.whiteFloorDbcHz}
              onChange={(event) => setNumber('whiteFloorDbcHz', Number(event.target.value))}
            />
          </label>
          <label>
            <span>
              RBW{' '}
              <b>
                {settings.rbwHz >= 1_000 ? `${settings.rbwHz / 1_000} kHz` : `${settings.rbwHz} Hz`}
              </b>
            </span>
            <select
              value={settings.rbwHz}
              onChange={(event) => setNumber('rbwHz', Number(event.target.value))}
            >
              <option value="1">1 Hz</option>
              <option value="10">10 Hz</option>
              <option value="100">100 Hz</option>
              <option value="1000">1 kHz</option>
              <option value="10000">10 kHz</option>
              <option value="100000">100 kHz</option>
            </select>
          </label>
          <label>
            <span>
              Cross correlations <b>{settings.correlations}</b>
            </span>
            <input
              type="range"
              min="1"
              max="200"
              step="1"
              value={settings.correlations}
              onChange={(event) => setNumber('correlations', Number(event.target.value))}
            />
          </label>
          <label>
            <span>
              Spur offset <b>{settings.spurOffsetHz / 1_000} kHz</b>
            </span>
            <input
              type="range"
              min="2"
              max="6000"
              step="2"
              value={settings.spurOffsetHz / 1_000}
              onChange={(event) => setNumber('spurOffsetHz', Number(event.target.value) * 1_000)}
            />
          </label>
          <label>
            <span>
              Spur level <b>{settings.spurLevelDbcHz} dBc/Hz</b>
            </span>
            <input
              type="range"
              min="-170"
              max="-60"
              step="1"
              value={settings.spurLevelDbcHz}
              onChange={(event) => setNumber('spurLevelDbcHz', Number(event.target.value))}
            />
          </label>
          <label>
            <span>
              Marker offset <b>{settings.markerOffsetHz / 1_000} kHz</b>
            </span>
            <input
              type="range"
              min="1"
              max="10000"
              step="1"
              value={settings.markerOffsetHz / 1_000}
              onChange={(event) => setNumber('markerOffsetHz', Number(event.target.value) * 1_000)}
            />
          </label>
        </div>

        <div className="cipher-bench__display">
          <div className="cipher-bench__screen">
            <svg
              viewBox="0 0 680 300"
              role="img"
              aria-label="Modeled phase noise trace from 10 hertz to 10 megahertz offset"
            >
              {[0, 1, 2, 3, 4, 5, 6].map((index) => (
                <line
                  key={`v${index}`}
                  x1={48 + index * 98.7}
                  x2={48 + index * 98.7}
                  y1="18"
                  y2="256"
                />
              ))}
              {['10 Hz', '100 Hz', '1 kHz', '10 kHz', '100 kHz', '1 MHz', '10 MHz'].map(
                (label, index) => (
                  <text key={label} x={48 + index * 98.7} y="282" textAnchor="middle">
                    {label}
                  </text>
                ),
              )}
              {[-60, -80, -100, -120, -140, -160, -180].map((value, index) => (
                <g key={value}>
                  <line x1="48" x2="640" y1={18 + index * 39.7} y2={18 + index * 39.7} />
                  <text x="42" y={22 + index * 39.7} textAnchor="end">
                    {value}
                  </text>
                </g>
              ))}
              <path className="is-dut" d={graphPath(result.points, 'dutDbcHz')} />
              <path className="is-floor" d={graphPath(result.points, 'analyzerFloorDbcHz')} />
              <path className="is-measured" d={graphPath(result.points, 'measuredDbcHz')} />
              <line className="is-marker" x1={markerX} x2={markerX} y1="18" y2="256" />
            </svg>
            <div className="cipher-bench__legend">
              <span className="is-measured">Measured</span>
              <span className="is-dut">True DUT model</span>
              <span className="is-floor">Analyzer floor model</span>
            </div>
          </div>
          <div className="cipher-bench__readouts">
            <article>
              <small>MARKER</small>
              <strong>{result.marker.measuredDbcHz.toFixed(1)} dBc/Hz</strong>
              <span>@ {(settings.markerOffsetHz / 1_000).toFixed(1)} kHz</span>
            </article>
            <article>
              <small>INTEGRATED JITTER</small>
              <strong>{result.integratedJitterFs.toFixed(1)} fs</strong>
              <span>10 Hz–10 MHz model</span>
            </article>
            <article>
              <small>EST. SWEEP</small>
              <strong>{formatEngineeringDuration(result.sweepSeconds)}</strong>
              <span>RBW × correlation tradeoff</span>
            </article>
            <article>
              <small>NOISE IN RBW</small>
              <strong>{result.integratedMarkerNoiseDbc.toFixed(1)} dBc</strong>
              <span>marker density integrated</span>
            </article>
          </div>
          <div className="cipher-bench__verdict">
            <Gauge size={19} />
            <span>
              <strong>Cipher’s read:</strong>
              {result.verdict}
            </span>
          </div>
          {result.warnings.map((warning) => (
            <div className="cipher-bench__warning" key={warning}>
              <ShieldAlert size={17} /> {warning}
            </div>
          ))}
        </div>
      </div>
      <footer>
        Educational model—not R&S software, instrument control, calibration evidence, or a
        substitute for the current FSWP manual and exact option specifications.
        <button
          type="button"
          onClick={() =>
            askCipher(
              `Cipher, review my phase-noise bench setup: ${settings.carrierGHz} GHz carrier at ${settings.inputPowerDbm} dBm, DUT noise ${settings.closeInNoiseDbcHz} dBc/Hz at 1 kHz, ${settings.rbwHz} Hz RBW, and ${settings.correlations} correlations. Explain what is limiting the modeled measurement and what I should verify on a real FSWP.`,
            )
          }
        >
          <MessageSquareCode size={15} /> Ask Cipher about this setup
        </button>
      </footer>
    </section>
  );
}

function CipherQuiz() {
  const [category, setCategory] = useState<CipherQuizCategory>();
  const questions = useMemo(() => quizQuestionsFor(category), [category]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number>();
  const [correct, setCorrect] = useState(0);
  const [complete, setComplete] = useState(false);
  const [progress, setProgress] = useState<CipherStudyProgress>(emptyCipherStudyProgress());
  const question = questions[index];
  useEffect(() => {
    void getCipherStudyProgress().then(setProgress);
  }, []);
  const restart = (nextCategory: CipherQuizCategory | undefined) => {
    setCategory(nextCategory);
    setIndex(0);
    setSelected(undefined);
    setCorrect(0);
    setComplete(false);
  };
  const advance = async () => {
    const nextCorrect = correct + (selected === question.answer ? 1 : 0);
    if (index + 1 >= questions.length) {
      setCorrect(nextCorrect);
      setComplete(true);
      setProgress(await saveCipherQuizAttempt(nextCorrect, questions.length));
      return;
    }
    setCorrect(nextCorrect);
    setIndex((current) => current + 1);
    setSelected(undefined);
  };
  return (
    <section className="cipher-quiz panel">
      <header>
        <div>
          <p className="eyebrow">CIPHER KNOWLEDGE CHECK</p>
          <h2>Technical Trials</h2>
          <p>Answer, commit, then read why. Cipher scores understanding—not lucky taps.</p>
        </div>
        <div className="cipher-quiz__record">
          <strong>{progress.bestPercent}%</strong>
          <span>best · {progress.attempts} attempts</span>
        </div>
      </header>
      <div className="cipher-quiz__categories">
        <button
          className={!category ? 'is-active' : ''}
          type="button"
          onClick={() => restart(undefined)}
        >
          Mixed
        </button>
        {QUIZ_CATEGORIES.map((item) => (
          <button
            className={category === item ? 'is-active' : ''}
            type="button"
            key={item}
            onClick={() => restart(item)}
          >
            {item}
          </button>
        ))}
      </div>
      {complete ? (
        <div className="cipher-quiz__complete">
          <GraduationCap size={42} />
          <h3>
            {correct}/{questions.length} correct
          </h3>
          <p>
            {correct / questions.length >= 0.8
              ? 'Strong run. Cipher considers the foundation operational.'
              : 'The gaps are mapped. Review the explanations, then run it again.'}
          </p>
          <button
            className="button button--primary"
            type="button"
            onClick={() => restart(category)}
          >
            <RotateCcw size={16} /> Run another trial
          </button>
        </div>
      ) : (
        question && (
          <div className="cipher-quiz__question">
            <div className="cipher-quiz__progress">
              <span>{question.category}</span>
              <b>
                {index + 1}/{questions.length}
              </b>
            </div>
            <h3>{question.prompt}</h3>
            <div className="cipher-quiz__options">
              {question.options.map((option, optionIndex) => {
                const revealed = selected !== undefined;
                const className =
                  revealed && optionIndex === question.answer
                    ? 'is-correct'
                    : revealed && optionIndex === selected
                      ? 'is-wrong'
                      : '';
                return (
                  <button
                    className={className}
                    disabled={revealed}
                    type="button"
                    key={option}
                    onClick={() => setSelected(optionIndex)}
                  >
                    {revealed && optionIndex === question.answer ? (
                      <CheckCircle2 size={18} />
                    ) : revealed && optionIndex === selected ? (
                      <XCircle size={18} />
                    ) : (
                      <span>{String.fromCharCode(65 + optionIndex)}</span>
                    )}
                    {option}
                  </button>
                );
              })}
            </div>
            {selected !== undefined && (
              <div className="cipher-quiz__explanation">
                <BrainCircuit size={18} />
                <p>{question.explanation}</p>
              </div>
            )}
            <button
              className="button button--primary"
              type="button"
              disabled={selected === undefined}
              onClick={() => void advance()}
            >
              {index + 1 === questions.length ? 'Finish trial' : 'Next question'}
            </button>
          </div>
        )
      )}
    </section>
  );
}

export function CipherStudyLabPage() {
  return (
    <div className="page cipher-study-page">
      <div className="party-chat__topbar">
        <Link className="text-link" to="/cipher">
          <ArrowLeft size={17} /> Cipher Nexus
        </Link>
        <span className="party-chat__saved">
          <Sparkles size={15} /> Study progress stored locally
        </span>
      </div>
      <section className="cipher-study-hero panel">
        <div>
          <FlaskConical size={36} />
        </div>
        <div>
          <p className="eyebrow">CIPHER STUDY LAB</p>
          <h1>Read less passively. Measure, manipulate, explain.</h1>
          <p>
            Technical trials expose weak spots. Five interactive benches turn instrument settings
            into consequences you can see.
          </p>
        </div>
      </section>
      <CipherQuiz />
      <PhaseNoiseBench />
      <CipherMeasurementLabs />
    </div>
  );
}
