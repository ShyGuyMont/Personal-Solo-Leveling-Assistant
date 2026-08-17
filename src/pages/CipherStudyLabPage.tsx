import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  ArrowLeft,
  BrainCircuit,
  CheckCircle2,
  FlaskConical,
  Gauge,
  GraduationCap,
  MessageSquareCode,
  Play,
  RotateCcw,
  ScanLine,
  ShieldAlert,
  Sparkles,
  Square,
  Target,
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
  PHASE_NOISE_DUT_SCENARIOS,
  PHASE_NOISE_SPEC_PRESETS,
  phaseNoiseSpecLimitAt,
  qualifyPhaseNoiseBench,
  simulatePhaseNoiseBench,
  type PhaseNoiseBenchSettings,
  type PhaseNoisePoint,
  type PhaseNoiseSpecPoint,
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

function graphX(offsetHz: number) {
  return 48 + ((Math.log10(offsetHz) - 1) / 6) * 592;
}

function graphY(valueDbcHz: number) {
  const scaled = 18 + ((Math.max(-180, Math.min(-60, valueDbcHz)) + 180) / 120) * 238;
  return 274 - scaled;
}

function specGraphPath(points: PhaseNoisePoint[], specPoints: PhaseNoiseSpecPoint[]) {
  return points
    .map((point, index) => {
      const x = graphX(point.offsetHz);
      const y = graphY(phaseNoiseSpecLimitAt(specPoints, point.offsetHz));
      return `${index ? 'L' : 'M'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');
}

function formatOffset(offsetHz: number) {
  if (offsetHz >= 1_000_000) return `${offsetHz / 1_000_000} MHz`;
  if (offsetHz >= 1_000) return `${offsetHz / 1_000} kHz`;
  return `${offsetHz} Hz`;
}

function PhaseNoiseBench() {
  const [settings, setSettings] = useState<PhaseNoiseBenchSettings>(DEFAULT_PHASE_NOISE_SETTINGS);
  const [scenarioId, setScenarioId] = useState<string>('control');
  const [specPresetId, setSpecPresetId] = useState<string>('training');
  const [specPoints, setSpecPoints] = useState<PhaseNoiseSpecPoint[]>(() =>
    PHASE_NOISE_SPEC_PRESETS[0].points.map((point) => ({ ...point })),
  );
  const [acquisitionState, setAcquisitionState] = useState<
    'idle' | 'running' | 'stopped' | 'complete'
  >('idle');
  const [visiblePointCount, setVisiblePointCount] = useState(0);
  const result = useMemo(() => simulatePhaseNoiseBench(settings), [settings]);
  const qualification = useMemo(
    () => qualifyPhaseNoiseBench(result, specPoints),
    [result, specPoints],
  );
  const setNumber = (key: keyof PhaseNoiseBenchSettings, value: number) => {
    setScenarioId('custom');
    setAcquisitionState('idle');
    setVisiblePointCount(0);
    setSettings((current) => ({ ...current, [key]: value }));
  };
  const resetAcquisition = () => {
    setAcquisitionState('idle');
    setVisiblePointCount(0);
  };
  const selectScenario = (id: string) => {
    const scenario = PHASE_NOISE_DUT_SCENARIOS.find((candidate) => candidate.id === id);
    if (!scenario) return;
    setScenarioId(id);
    setSettings({ ...scenario.settings });
    resetAcquisition();
  };
  const selectSpecPreset = (id: string) => {
    const preset = PHASE_NOISE_SPEC_PRESETS.find((candidate) => candidate.id === id);
    if (!preset) return;
    setSpecPresetId(id);
    setSpecPoints(preset.points.map((point) => ({ ...point })));
    resetAcquisition();
  };
  const updateSpecPoint = (offsetHz: number, limitDbcHz: number) => {
    setSpecPresetId('custom');
    setSpecPoints((current) =>
      current.map((point) => (point.offsetHz === offsetHz ? { ...point, limitDbcHz } : point)),
    );
    resetAcquisition();
  };
  const resetBench = () => {
    setScenarioId('control');
    setSettings({ ...DEFAULT_PHASE_NOISE_SETTINGS });
    setSpecPresetId('training');
    setSpecPoints(PHASE_NOISE_SPEC_PRESETS[0].points.map((point) => ({ ...point })));
    resetAcquisition();
  };
  useEffect(() => {
    if (acquisitionState !== 'running') return undefined;
    if (visiblePointCount >= result.points.length) {
      setAcquisitionState('complete');
      return undefined;
    }
    const timer = window.setTimeout(
      () => setVisiblePointCount((current) => Math.min(result.points.length, current + 1)),
      document.hidden ? 360 : 78,
    );
    return () => window.clearTimeout(timer);
  }, [acquisitionState, result.points.length, visiblePointCount]);
  const startAcquisition = () => {
    setVisiblePointCount(1);
    setAcquisitionState('running');
  };
  const markerX = 48 + ((Math.log10(settings.markerOffsetHz) - 1) / 6) * 592;
  const visiblePoints = result.points.slice(0, visiblePointCount);
  const livePoint = visiblePoints.at(-1);
  const acquisitionProgress = Math.round((visiblePointCount / result.points.length) * 100);
  const acquiredEvaluations = qualification.evaluations.filter(
    (evaluation) => livePoint && evaluation.offsetHz <= livePoint.offsetHz,
  );
  const currentScenario = PHASE_NOISE_DUT_SCENARIOS.find((scenario) => scenario.id === scenarioId);
  return (
    <section className="cipher-bench panel">
      <header>
        <div>
          <p className="eyebrow">GUIDED DUT QUALIFICATION · LIVE ACQUISITION</p>
          <h2>Phase-Noise Qualification Bench</h2>
          <p>
            Set the requirement, connect a mystery DUT, and watch the modeled measurement arrive
            across offset frequency before Cipher calls the pass, the miss, and the likely cause.
          </p>
        </div>
        <button className="button button--ghost" type="button" onClick={resetBench}>
          <RotateCcw size={16} /> Reset bench
        </button>
      </header>

      <div className="cipher-qualification-guide">
        <Target size={21} />
        <div>
          <strong>What am I looking at?</strong>
          <p>
            Left to right is distance from the carrier. Lower on the graph means cleaner phase
            noise. Your live cyan trace must stay <b>below the red specification line</b> at every
            required offset.
          </p>
        </div>
      </div>

      <div className="cipher-qualification-setup">
        <label>
          <span>1 · Choose the DUT</span>
          <select value={scenarioId} onChange={(event) => selectScenario(event.target.value)}>
            {scenarioId === 'custom' && <option value="custom">Custom DUT settings</option>}
            {PHASE_NOISE_DUT_SCENARIOS.map((scenario) => (
              <option value={scenario.id} key={scenario.id}>
                {scenario.label}
              </option>
            ))}
          </select>
          <small>
            {currentScenario?.description ??
              'You changed the source or analyzer controls. This is now a custom run.'}
          </small>
        </label>
        <label>
          <span>2 · Choose the limit mask</span>
          <select value={specPresetId} onChange={(event) => selectSpecPreset(event.target.value)}>
            {specPresetId === 'custom' && <option value="custom">Custom requirement</option>}
            {PHASE_NOISE_SPEC_PRESETS.map((preset) => (
              <option value={preset.id} key={preset.id}>
                {preset.label}
              </option>
            ))}
          </select>
          <small>
            {PHASE_NOISE_SPEC_PRESETS.find((preset) => preset.id === specPresetId)?.description ??
              'Your edited point limits define the requirement for this run.'}
          </small>
        </label>
      </div>

      <div className="cipher-spec-editor" aria-label="Editable phase noise specification">
        <div>
          <strong>Qualification points</strong>
          <small>Edit any dBc/Hz limit to build your own DUT specification.</small>
        </div>
        <div className="cipher-spec-editor__points">
          {specPoints.map((point) => (
            <label key={point.offsetHz}>
              <span>{formatOffset(point.offsetHz)}</span>
              <input
                type="number"
                min="-180"
                max="-60"
                step="1"
                value={point.limitDbcHz}
                onChange={(event) => updateSpecPoint(point.offsetHz, Number(event.target.value))}
                aria-label={`${formatOffset(point.offsetHz)} phase noise limit in dBc per hertz`}
              />
              <small>dBc/Hz max</small>
            </label>
          ))}
        </div>
      </div>

      <div className="cipher-bench__workspace">
        <details className="cipher-bench__control-drawer">
          <summary>
            Advanced DUT + analyzer controls
            <small>Power, noise shape, RBW, correlation, spur, and marker</small>
          </summary>
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
                onChange={(event) =>
                  setNumber('flickerSlopeDbPerDecade', Number(event.target.value))
                }
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
                  {settings.rbwHz >= 1_000
                    ? `${settings.rbwHz / 1_000} kHz`
                    : `${settings.rbwHz} Hz`}
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
                onChange={(event) =>
                  setNumber('markerOffsetHz', Number(event.target.value) * 1_000)
                }
              />
            </label>
          </div>
        </details>

        <div className="cipher-bench__display">
          <div className={`cipher-acquisition-console is-${acquisitionState}`}>
            <div className="cipher-acquisition-console__status">
              {acquisitionState === 'running' ? (
                <ScanLine size={20} />
              ) : acquisitionState === 'complete' ? (
                qualification.passed ? (
                  <CheckCircle2 size={20} />
                ) : (
                  <XCircle size={20} />
                )
              ) : (
                <Activity size={20} />
              )}
              <span>
                <small>ACQUISITION STATUS</small>
                <strong>
                  {acquisitionState === 'running'
                    ? `Measuring ${livePoint ? formatOffset(livePoint.offsetHz) : 'carrier lock'}`
                    : acquisitionState === 'complete'
                      ? qualification.passed
                        ? 'PASS · DUT QUALIFIED'
                        : 'FAIL · LIMIT EXCEEDED'
                      : acquisitionState === 'stopped'
                        ? 'RUN ABORTED'
                        : 'READY FOR DUT'}
                </strong>
              </span>
            </div>
            <div className="cipher-acquisition-console__live">
              <span>
                <small>LIVE READING</small>
                <strong>{livePoint ? `${livePoint.measuredDbcHz.toFixed(1)} dBc/Hz` : '—'}</strong>
              </span>
              <span>
                <small>POINTS CHECKED</small>
                <strong>
                  {acquiredEvaluations.length}/{qualification.evaluations.length}
                </strong>
              </span>
              <span>
                <small>LIVE FAILURES</small>
                <strong>{acquiredEvaluations.filter((item) => !item.passed).length}</strong>
              </span>
            </div>
            <div className="cipher-acquisition-console__progress" aria-hidden="true">
              <i style={{ width: `${acquisitionProgress}%` }} />
            </div>
            <div className="cipher-acquisition-console__actions">
              <button
                className="button button--primary"
                type="button"
                onClick={startAcquisition}
                disabled={acquisitionState === 'running'}
              >
                <Play size={16} />
                {acquisitionState === 'complete' || acquisitionState === 'stopped'
                  ? 'Run again'
                  : 'Start qualification'}
              </button>
              {acquisitionState === 'running' && (
                <button
                  className="button button--ghost"
                  type="button"
                  onClick={() => setAcquisitionState('stopped')}
                >
                  <Square size={14} /> Abort
                </button>
              )}
            </div>
          </div>
          <div className="cipher-bench__screen">
            <svg
              viewBox="0 0 680 300"
              role="img"
              aria-label="Live modeled phase noise qualification trace from 10 hertz to 10 megahertz offset"
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
              <path className="is-spec" d={specGraphPath(result.points, specPoints)} />
              <path className="is-floor" d={graphPath(result.points, 'analyzerFloorDbcHz')} />
              {acquisitionState === 'complete' && (
                <path className="is-dut" d={graphPath(result.points, 'dutDbcHz')} />
              )}
              {visiblePoints.length > 1 && (
                <path className="is-measured" d={graphPath(visiblePoints, 'measuredDbcHz')} />
              )}
              {acquiredEvaluations.map((evaluation) => (
                <circle
                  className={evaluation.passed ? 'is-pass' : 'is-fail'}
                  cx={graphX(evaluation.offsetHz)}
                  cy={graphY(evaluation.measuredDbcHz)}
                  r="4.5"
                  key={evaluation.offsetHz}
                />
              ))}
              {livePoint && livePoint.offsetHz >= settings.markerOffsetHz && (
                <line className="is-marker" x1={markerX} x2={markerX} y1="18" y2="256" />
              )}
            </svg>
            <div className="cipher-bench__legend">
              <span className="is-measured">Live measured DUT</span>
              <span className="is-spec">Maximum allowed</span>
              <span className="is-floor">Analyzer floor</span>
              {acquisitionState === 'complete' && <span className="is-dut">Underlying DUT</span>}
            </div>
          </div>
          <div className="cipher-bench__readouts">
            <article>
              <small>MARKER</small>
              <strong>
                {acquisitionState === 'complete'
                  ? `${result.marker.measuredDbcHz.toFixed(1)} dBc/Hz`
                  : 'Pending'}
              </strong>
              <span>@ {(settings.markerOffsetHz / 1_000).toFixed(1)} kHz</span>
            </article>
            <article>
              <small>INTEGRATED JITTER</small>
              <strong>
                {acquisitionState === 'complete'
                  ? `${result.integratedJitterFs.toFixed(1)} fs`
                  : 'Pending'}
              </strong>
              <span>10 Hz–10 MHz model</span>
            </article>
            <article>
              <small>EST. SWEEP</small>
              <strong>{formatEngineeringDuration(result.sweepSeconds)}</strong>
              <span>RBW × correlation tradeoff</span>
            </article>
            <article>
              <small>NOISE IN RBW</small>
              <strong>
                {acquisitionState === 'complete'
                  ? `${result.integratedMarkerNoiseDbc.toFixed(1)} dBc`
                  : 'Pending'}
              </strong>
              <span>marker density integrated</span>
            </article>
          </div>
          {acquisitionState === 'complete' && (
            <>
              <div className="cipher-qualification-result">
                <header className={qualification.passed ? 'is-pass' : 'is-fail'}>
                  {qualification.passed ? <CheckCircle2 size={23} /> : <XCircle size={23} />}
                  <div>
                    <small>QUALIFICATION DECISION</small>
                    <strong>{qualification.passed ? 'PASS' : 'FAIL'}</strong>
                    <span>
                      Worst margin {qualification.worstMarginDb >= 0 ? '+' : ''}
                      {qualification.worstMarginDb.toFixed(1)} dB
                    </span>
                  </div>
                </header>
                <div className="cipher-qualification-result__points">
                  {qualification.evaluations.map((evaluation) => (
                    <article
                      className={evaluation.passed ? 'is-pass' : 'is-fail'}
                      key={evaluation.offsetHz}
                    >
                      <span>{formatOffset(evaluation.offsetHz)}</span>
                      <strong>{evaluation.measuredDbcHz.toFixed(1)}</strong>
                      <small>Limit {evaluation.limitDbcHz} dBc/Hz</small>
                      <b>
                        {evaluation.passed ? 'PASS' : 'FAIL'} ·{' '}
                        {evaluation.marginDb >= 0 ? '+' : ''}
                        {evaluation.marginDb.toFixed(1)} dB
                      </b>
                    </article>
                  ))}
                </div>
              </div>
              <div className={`cipher-fault-diagnosis is-${qualification.diagnosis.id}`}>
                <div>
                  <BrainCircuit size={23} />
                  <span>
                    <small>CIPHER · FAILURE ANALYSIS</small>
                    <strong>{qualification.diagnosis.title}</strong>
                  </span>
                </div>
                <p>{qualification.diagnosis.summary}</p>
                <ol>
                  {qualification.diagnosis.checks.map((check) => (
                    <li key={check}>{check}</li>
                  ))}
                </ol>
                <small>
                  A trace signature suggests likely causes; it does not prove root cause without
                  controlled bench checks.
                </small>
              </div>
              <div className="cipher-bench__verdict">
                <Gauge size={19} />
                <span>
                  <strong>Measurement confidence:</strong>
                  {result.verdict}
                </span>
              </div>
              {result.warnings.map((warning) => (
                <div className="cipher-bench__warning" key={warning}>
                  <ShieldAlert size={17} /> {warning}
                </div>
              ))}
            </>
          )}
        </div>
      </div>
      <footer>
        Educational model—not R&S software, instrument control, calibration evidence, or a
        substitute for the current FSWP manual and exact option specifications.
        <button
          type="button"
          onClick={() =>
            askCipher(
              `Cipher, debrief my completed phase-noise qualification. The result was ${qualification.passed ? 'PASS' : 'FAIL'} with a worst margin of ${qualification.worstMarginDb.toFixed(1)} dB. The spot results were ${qualification.evaluations.map((item) => `${formatOffset(item.offsetHz)}: measured ${item.measuredDbcHz.toFixed(1)} dBc/Hz against ${item.limitDbcHz} dBc/Hz (${item.marginDb.toFixed(1)} dB margin)`).join('; ')}. The simulator classified the signature as “${qualification.diagnosis.title}.” Setup: ${settings.carrierGHz} GHz carrier at ${settings.inputPowerDbm} dBm, ${settings.rbwHz} Hz RBW, and ${settings.correlations} correlations. Teach me why that signature suggests this diagnosis, what alternative causes remain, and what I should verify next on a real phase-noise analyzer.`,
            )
          }
        >
          <MessageSquareCode size={15} /> Ask Cipher to debrief this run
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
