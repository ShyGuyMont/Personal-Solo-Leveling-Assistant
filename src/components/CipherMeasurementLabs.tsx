import { useMemo, useState } from 'react';
import {
  Activity,
  AudioWaveform,
  Cable,
  MessageSquareCode,
  RadioTower,
  ThermometerSun,
} from 'lucide-react';
import {
  simulateNoiseFigureYFactor,
  simulateScopeSampling,
  simulateSpectrumMeasurement,
  simulateVnaMeasurement,
} from '@/game/measurementSimulators';

type LabId = 'vna' | 'spectrum' | 'scope' | 'noise-figure';

const LABS: Array<{ id: LabId; label: string; icon: typeof Cable }> = [
  { id: 'vna', label: 'VNA / S-Parameters', icon: Cable },
  { id: 'spectrum', label: 'Spectrum / IM3', icon: RadioTower },
  { id: 'scope', label: 'Scope Sampling', icon: Activity },
  { id: 'noise-figure', label: 'Noise Figure', icon: ThermometerSun },
];

function askCipher(initialDraft: string) {
  window.dispatchEvent(
    new CustomEvent('system:open-quick-link', {
      detail: { companionId: 'cipher', initialDraft },
    }),
  );
}

function Warnings({ values }: { values: string[] }) {
  if (!values.length)
    return (
      <p className="cipher-measurement-ok">
        Measurement conditions are internally consistent in this educational model.
      </p>
    );
  return (
    <div className="cipher-measurement-warnings">
      {values.map((warning) => (
        <p key={warning}>{warning}</p>
      ))}
    </div>
  );
}

function VnaLab() {
  const [frequencyGHz, setFrequencyGHz] = useState(2.4);
  const [resistanceOhm, setResistanceOhm] = useState(42);
  const [reactanceOhm, setReactanceOhm] = useState(-18);
  const [thruLossDb, setThruLossDb] = useState(1.2);
  const [electricalDelayNs, setElectricalDelayNs] = useState(0.8);
  const [calibrationQuality, setCalibrationQuality] = useState(95);
  const result = useMemo(
    () =>
      simulateVnaMeasurement({
        frequencyGHz,
        resistanceOhm,
        reactanceOhm,
        thruLossDb,
        electricalDelayNs,
        calibrationQuality,
      }),
    [frequencyGHz, resistanceOhm, reactanceOhm, thruLossDb, electricalDelayNs, calibrationQuality],
  );
  return (
    <div className="cipher-measurement">
      <div className="cipher-measurement__controls">
        <label>
          <span>
            Frequency <b>{frequencyGHz.toFixed(2)} GHz</b>
          </span>
          <input
            type="range"
            min="0.1"
            max="26"
            step="0.1"
            value={frequencyGHz}
            onChange={(event) => setFrequencyGHz(Number(event.target.value))}
          />
        </label>
        <label>
          <span>
            DUT resistance <b>{resistanceOhm} ohms</b>
          </span>
          <input
            type="range"
            min="1"
            max="200"
            value={resistanceOhm}
            onChange={(event) => setResistanceOhm(Number(event.target.value))}
          />
        </label>
        <label>
          <span>
            DUT reactance{' '}
            <b>
              {reactanceOhm > 0 ? '+' : ''}
              {reactanceOhm} ohms
            </b>
          </span>
          <input
            type="range"
            min="-150"
            max="150"
            value={reactanceOhm}
            onChange={(event) => setReactanceOhm(Number(event.target.value))}
          />
        </label>
        <label>
          <span>
            Path loss <b>{thruLossDb.toFixed(1)} dB</b>
          </span>
          <input
            type="range"
            min="0"
            max="20"
            step="0.1"
            value={thruLossDb}
            onChange={(event) => setThruLossDb(Number(event.target.value))}
          />
        </label>
        <label>
          <span>
            Electrical delay <b>{electricalDelayNs.toFixed(1)} ns</b>
          </span>
          <input
            type="range"
            min="0"
            max="20"
            step="0.1"
            value={electricalDelayNs}
            onChange={(event) => setElectricalDelayNs(Number(event.target.value))}
          />
        </label>
        <label>
          <span>
            Calibration quality <b>{calibrationQuality}%</b>
          </span>
          <input
            type="range"
            min="0"
            max="100"
            value={calibrationQuality}
            onChange={(event) => setCalibrationQuality(Number(event.target.value))}
          />
        </label>
      </div>
      <div className="cipher-measurement__visual">
        <div className="cipher-smith">
          <svg
            viewBox="0 0 200 200"
            role="img"
            aria-label="Simplified Smith chart showing modeled reflection coefficient"
          >
            <circle cx="100" cy="100" r="82" />
            <circle cx="141" cy="100" r="41" />
            <circle cx="120" cy="100" r="61" />
            <path d="M18 100 H182 M100 18 A82 82 0 0 0 100 182 M100 18 A82 82 0 0 1 100 182" />
            <circle
              className="is-marker"
              cx={100 + result.gammaReal * 82}
              cy={100 - result.gammaImag * 82}
              r="6"
            />
          </svg>
          <span>Gamma = {result.gammaMagnitude.toFixed(3)}</span>
        </div>
        <div className="cipher-measurement__readouts">
          <article>
            <small>S11 RETURN LOSS</small>
            <strong>{result.returnLossDb.toFixed(2)} dB</strong>
          </article>
          <article>
            <small>VSWR</small>
            <strong>{result.vswr.toFixed(2)}:1</strong>
          </article>
          <article>
            <small>S21</small>
            <strong>{result.s21Db.toFixed(2)} dB</strong>
          </article>
          <article>
            <small>PHASE</small>
            <strong>{result.phaseDegrees.toFixed(1)} deg</strong>
          </article>
        </div>
        <Warnings values={result.warnings} />
        <button
          type="button"
          onClick={() =>
            askCipher(
              `Cipher, explain this VNA model: ${frequencyGHz} GHz, DUT impedance ${resistanceOhm} ${reactanceOhm >= 0 ? '+' : ''} j${reactanceOhm} ohms, return loss ${result.returnLossDb.toFixed(2)} dB, VSWR ${result.vswr.toFixed(2)}, and calibration quality ${calibrationQuality}%. What would I verify on a real bench?`,
            )
          }
        >
          <MessageSquareCode size={15} /> Ask Cipher to debrief this VNA trace
        </button>
      </div>
    </div>
  );
}

function SpectrumLab() {
  const [centerMHz, setCenterMHz] = useState(1_000);
  const [toneSpacingKHz, setToneSpacingKHz] = useState(100);
  const [tonePowerDbm, setTonePowerDbm] = useState(-15);
  const [iip3Dbm, setIip3Dbm] = useState(18);
  const [rbwHz, setRbwHz] = useState(1_000);
  const [attenuationDb, setAttenuationDb] = useState(10);
  const [preampEnabled, setPreampEnabled] = useState(false);
  const result = useMemo(
    () =>
      simulateSpectrumMeasurement({
        centerMHz,
        toneSpacingKHz,
        tonePowerDbm,
        iip3Dbm,
        rbwHz,
        attenuationDb,
        preampEnabled,
      }),
    [centerMHz, toneSpacingKHz, tonePowerDbm, iip3Dbm, rbwHz, attenuationDb, preampEnabled],
  );
  const y = (dbm: number) => 20 + ((20 - Math.max(-170, Math.min(20, dbm))) / 190) * 210;
  return (
    <div className="cipher-measurement">
      <div className="cipher-measurement__controls">
        <label>
          <span>
            Center <b>{centerMHz} MHz</b>
          </span>
          <input
            type="range"
            min="10"
            max="6000"
            step="10"
            value={centerMHz}
            onChange={(event) => setCenterMHz(Number(event.target.value))}
          />
        </label>
        <label>
          <span>
            Tone spacing <b>{toneSpacingKHz} kHz</b>
          </span>
          <input
            type="range"
            min="10"
            max="1000"
            step="10"
            value={toneSpacingKHz}
            onChange={(event) => setToneSpacingKHz(Number(event.target.value))}
          />
        </label>
        <label>
          <span>
            Tone power <b>{tonePowerDbm} dBm</b>
          </span>
          <input
            type="range"
            min="-80"
            max="10"
            value={tonePowerDbm}
            onChange={(event) => setTonePowerDbm(Number(event.target.value))}
          />
        </label>
        <label>
          <span>
            Modeled IIP3 <b>{iip3Dbm} dBm</b>
          </span>
          <input
            type="range"
            min="-10"
            max="50"
            value={iip3Dbm}
            onChange={(event) => setIip3Dbm(Number(event.target.value))}
          />
        </label>
        <label>
          <span>
            RBW <b>{rbwHz >= 1_000 ? `${rbwHz / 1_000} kHz` : `${rbwHz} Hz`}</b>
          </span>
          <select value={rbwHz} onChange={(event) => setRbwHz(Number(event.target.value))}>
            <option value="10">10 Hz</option>
            <option value="100">100 Hz</option>
            <option value="1000">1 kHz</option>
            <option value="10000">10 kHz</option>
            <option value="100000">100 kHz</option>
            <option value="1000000">1 MHz</option>
          </select>
        </label>
        <label>
          <span>
            Input attenuation <b>{attenuationDb} dB</b>
          </span>
          <input
            type="range"
            min="0"
            max="40"
            step="5"
            value={attenuationDb}
            onChange={(event) => setAttenuationDb(Number(event.target.value))}
          />
        </label>
        <label className="cipher-measurement__toggle">
          <span>
            Preamp <b>{preampEnabled ? 'ON' : 'OFF'}</b>
          </span>
          <input
            type="checkbox"
            checked={preampEnabled}
            onChange={(event) => setPreampEnabled(event.target.checked)}
          />
        </label>
      </div>
      <div className="cipher-measurement__visual">
        <div className="cipher-spectrum">
          <svg
            viewBox="0 0 680 260"
            role="img"
            aria-label="Modeled two-tone spectrum with third-order products and noise floor"
          >
            <line
              x1="40"
              x2="650"
              y1={y(result.displayedFloorDbm)}
              y2={y(result.displayedFloorDbm)}
            />
            <path
              d={`M40 ${y(result.displayedFloorDbm)} ${Array.from({ length: 28 }, (_, index) => `L ${40 + index * 22} ${y(result.displayedFloorDbm) + Math.sin(index * 1.7) * 3}`).join(' ')}`}
            />
            {[240, 440].map((x) => (
              <line
                className="is-tone"
                key={x}
                x1={x}
                x2={x}
                y1={y(tonePowerDbm)}
                y2={y(result.displayedFloorDbm)}
              />
            ))}
            {[140, 540].map((x) => (
              <line
                className="is-im3"
                key={x}
                x1={x}
                x2={x}
                y1={y(result.displayedIm3Dbm)}
                y2={y(result.displayedFloorDbm)}
              />
            ))}
            <text x="240" y={Math.max(16, y(tonePowerDbm) - 7)} textAnchor="middle">
              F1
            </text>
            <text x="440" y={Math.max(16, y(tonePowerDbm) - 7)} textAnchor="middle">
              F2
            </text>
            <text x="140" y={Math.max(16, y(result.displayedIm3Dbm) - 7)} textAnchor="middle">
              IM3
            </text>
            <text x="540" y={Math.max(16, y(result.displayedIm3Dbm) - 7)} textAnchor="middle">
              IM3
            </text>
          </svg>
        </div>
        <div className="cipher-measurement__readouts">
          <article>
            <small>TRUE IM3</small>
            <strong>{result.im3Dbm.toFixed(1)} dBm</strong>
          </article>
          <article>
            <small>DISPLAYED IM3</small>
            <strong>{result.displayedIm3Dbm.toFixed(1)} dBm</strong>
          </article>
          <article>
            <small>NOISE FLOOR</small>
            <strong>{result.displayedFloorDbm.toFixed(1)} dBm</strong>
          </article>
          <article>
            <small>FRONT-END LEVEL</small>
            <strong>{result.analyzerInputDbm.toFixed(1)} dBm</strong>
          </article>
        </div>
        <Warnings values={result.warnings} />
        <button
          type="button"
          onClick={() =>
            askCipher(
              `Cipher, debrief this two-tone spectrum model: ${centerMHz} MHz center, ${toneSpacingKHz} kHz spacing, ${tonePowerDbm} dBm per tone, modeled IIP3 ${iip3Dbm} dBm, ${rbwHz} Hz RBW, ${attenuationDb} dB attenuation, preamp ${preampEnabled ? 'on' : 'off'}. Explain analyzer-generated distortion and how I would verify real IM3.`,
            )
          }
        >
          <MessageSquareCode size={15} /> Ask Cipher about dynamic range
        </button>
      </div>
    </div>
  );
}

function ScopeLab() {
  const [signalMHz, setSignalMHz] = useState(45);
  const [sampleRateMSps, setSampleRateMSps] = useState(250);
  const [bandwidthMHz, setBandwidthMHz] = useState(100);
  const [recordLength, setRecordLength] = useState(10_000);
  const result = useMemo(
    () => simulateScopeSampling({ signalMHz, sampleRateMSps, bandwidthMHz, recordLength }),
    [signalMHz, sampleRateMSps, bandwidthMHz, recordLength],
  );
  const path = result.samples
    .map(
      (point, index) => `${index ? 'L' : 'M'} ${20 + index * 10} ${125 - point.sampledValue * 90}`,
    )
    .join(' ');
  return (
    <div className="cipher-measurement">
      <div className="cipher-measurement__controls">
        <label>
          <span>
            Signal <b>{signalMHz} MHz</b>
          </span>
          <input
            type="range"
            min="1"
            max="500"
            value={signalMHz}
            onChange={(event) => setSignalMHz(Number(event.target.value))}
          />
        </label>
        <label>
          <span>
            Sample rate <b>{sampleRateMSps} MS/s</b>
          </span>
          <input
            type="range"
            min="20"
            max="2000"
            step="10"
            value={sampleRateMSps}
            onChange={(event) => setSampleRateMSps(Number(event.target.value))}
          />
        </label>
        <label>
          <span>
            Analog bandwidth <b>{bandwidthMHz} MHz</b>
          </span>
          <input
            type="range"
            min="10"
            max="1000"
            step="10"
            value={bandwidthMHz}
            onChange={(event) => setBandwidthMHz(Number(event.target.value))}
          />
        </label>
        <label>
          <span>
            Record length <b>{recordLength.toLocaleString()} pts</b>
          </span>
          <select
            value={recordLength}
            onChange={(event) => setRecordLength(Number(event.target.value))}
          >
            <option value="1000">1 kpts</option>
            <option value="10000">10 kpts</option>
            <option value="100000">100 kpts</option>
            <option value="1000000">1 Mpts</option>
          </select>
        </label>
      </div>
      <div className="cipher-measurement__visual">
        <div className="cipher-scope">
          <svg viewBox="0 0 680 250" role="img" aria-label="Modeled oscilloscope sampled waveform">
            {[0, 1, 2, 3, 4, 5, 6].map((index) => (
              <line key={index} x1={20 + index * 105} x2={20 + index * 105} y1="15" y2="235" />
            ))}
            {[0, 1, 2, 3, 4].map((index) => (
              <line key={`h${index}`} x1="20" x2="650" y1={15 + index * 55} y2={15 + index * 55} />
            ))}
            <path d={path} />
            {result.samples
              .filter((_, index) => index % 3 === 0)
              .map((point, index) => (
                <circle key={index} cx={20 + index * 30} cy={125 - point.sampledValue * 90} r="3" />
              ))}
          </svg>
        </div>
        <div className="cipher-measurement__readouts">
          <article>
            <small>SAMPLES / CYCLE</small>
            <strong>{result.pointsPerCycle.toFixed(2)}</strong>
          </article>
          <article>
            <small>APPARENT FREQUENCY</small>
            <strong>{result.aliasMHz.toFixed(2)} MHz</strong>
          </article>
          <article>
            <small>AMPLITUDE</small>
            <strong>{(result.amplitudeRatio * 100).toFixed(1)}%</strong>
          </article>
          <article>
            <small>TIME CAPTURE</small>
            <strong>{result.timeWindowUs.toFixed(1)} us</strong>
          </article>
        </div>
        <Warnings values={result.warnings} />
        <button
          type="button"
          onClick={() =>
            askCipher(
              `Cipher, explain this oscilloscope model: ${signalMHz} MHz input, ${sampleRateMSps} MS/s, ${bandwidthMHz} MHz analog bandwidth, ${recordLength} points, ${result.pointsPerCycle.toFixed(2)} samples per cycle, and apparent frequency ${result.aliasMHz.toFixed(2)} MHz. Teach me how to avoid a believable but false waveform.`,
            )
          }
        >
          <MessageSquareCode size={15} /> Ask Cipher about aliasing
        </button>
      </div>
    </div>
  );
}

function NoiseFigureLab() {
  const [enrDb, setEnrDb] = useState(15);
  const [hotPowerDbm, setHotPowerDbm] = useState(-72);
  const [coldPowerDbm, setColdPowerDbm] = useState(-78);
  const [preDutLossDb, setPreDutLossDb] = useState(0.8);
  const result = useMemo(
    () => simulateNoiseFigureYFactor({ enrDb, hotPowerDbm, coldPowerDbm, preDutLossDb }),
    [enrDb, hotPowerDbm, coldPowerDbm, preDutLossDb],
  );
  return (
    <div className="cipher-measurement">
      <div className="cipher-measurement__controls">
        <label>
          <span>
            Noise-source ENR <b>{enrDb.toFixed(1)} dB</b>
          </span>
          <input
            type="range"
            min="2"
            max="30"
            step="0.1"
            value={enrDb}
            onChange={(event) => setEnrDb(Number(event.target.value))}
          />
        </label>
        <label>
          <span>
            Hot reading <b>{hotPowerDbm} dBm</b>
          </span>
          <input
            type="range"
            min="-110"
            max="-30"
            value={hotPowerDbm}
            onChange={(event) => setHotPowerDbm(Number(event.target.value))}
          />
        </label>
        <label>
          <span>
            Cold reading <b>{coldPowerDbm} dBm</b>
          </span>
          <input
            type="range"
            min="-115"
            max="-35"
            value={coldPowerDbm}
            onChange={(event) => setColdPowerDbm(Number(event.target.value))}
          />
        </label>
        <label>
          <span>
            Loss before DUT <b>{preDutLossDb.toFixed(1)} dB</b>
          </span>
          <input
            type="range"
            min="0"
            max="10"
            step="0.1"
            value={preDutLossDb}
            onChange={(event) => setPreDutLossDb(Number(event.target.value))}
          />
        </label>
      </div>
      <div className="cipher-measurement__visual">
        <div className="cipher-yfactor">
          <div>
            <AudioWaveform size={30} />
            <span>
              CALIBRATED
              <br />
              NOISE SOURCE
            </span>
          </div>
          <i>HOT / COLD</i>
          <div>
            <strong>DUT</strong>
            <span>loss {preDutLossDb.toFixed(1)} dB before input</span>
          </div>
          <i>Y</i>
          <div>
            <ThermometerSun size={30} />
            <span>
              POWER
              <br />
              RECEIVER
            </span>
          </div>
        </div>
        <div className="cipher-measurement__readouts">
          <article>
            <small>Y-FACTOR</small>
            <strong>{result.yFactorDb.toFixed(2)} dB</strong>
          </article>
          <article>
            <small>RAW SYSTEM NF</small>
            <strong>{result.rawNoiseFigureDb.toFixed(2)} dB</strong>
          </article>
          <article>
            <small>CORRECTED DUT NF</small>
            <strong>{result.correctedDutNoiseFigureDb.toFixed(2)} dB</strong>
          </article>
          <article>
            <small>EQUIV. NOISE TEMP</small>
            <strong>{result.effectiveTemperatureK.toFixed(0)} K</strong>
          </article>
        </div>
        <Warnings values={result.warnings} />
        <button
          type="button"
          onClick={() =>
            askCipher(
              `Cipher, teach me this Y-factor noise-figure model: ${enrDb} dB ENR, hot reading ${hotPowerDbm} dBm, cold reading ${coldPowerDbm} dBm, and ${preDutLossDb} dB pre-DUT loss. The model reports ${result.correctedDutNoiseFigureDb.toFixed(2)} dB corrected DUT NF. Explain calibration, loss correction, uncertainty, and what could make this answer wrong.`,
            )
          }
        >
          <MessageSquareCode size={15} /> Ask Cipher to audit the Y-factor
        </button>
      </div>
    </div>
  );
}

export function CipherMeasurementLabs() {
  const [active, setActive] = useState<LabId>('vna');
  return (
    <section className="cipher-measurement-labs panel">
      <header>
        <div>
          <p className="eyebrow">MEASUREMENT ACADEMY</p>
          <h2>Four more benches. Four different ways to be fooled.</h2>
          <p>
            Manipulate the setup, watch the consequence, then ask Cipher why the measurement
            changed.
          </p>
        </div>
      </header>
      <div
        className="cipher-measurement-labs__tabs"
        role="tablist"
        aria-label="Measurement simulators"
      >
        {LABS.map(({ id, label, icon: Icon }) => (
          <button
            className={active === id ? 'is-active' : ''}
            type="button"
            role="tab"
            aria-selected={active === id}
            key={id}
            onClick={() => setActive(id)}
          >
            <Icon size={18} /> {label}
          </button>
        ))}
      </div>
      {active === 'vna' && <VnaLab />}
      {active === 'spectrum' && <SpectrumLab />}
      {active === 'scope' && <ScopeLab />}
      {active === 'noise-figure' && <NoiseFigureLab />}
      <footer>
        These are deterministic teaching models, not vendor emulators or calibration evidence. Real
        limits, uncertainty, options, and procedures come from the exact instrument and DUT
        documentation.
      </footer>
    </section>
  );
}
