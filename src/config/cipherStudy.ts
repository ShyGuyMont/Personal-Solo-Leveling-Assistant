export type CipherQuizCategory = 'RF' | 'Phase Noise' | 'Test Equipment' | 'Studio Tech';

export interface CipherQuizQuestion {
  id: string;
  category: CipherQuizCategory;
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
}

export const CIPHER_QUIZ_QUESTIONS: CipherQuizQuestion[] = [
  {
    id: 's21',
    category: 'RF',
    prompt: 'What does S21 normally describe in a two-port network?',
    options: [
      'Input reflection',
      'Forward transmission',
      'Reverse transmission',
      'Output reflection',
    ],
    answer: 1,
    explanation:
      'S21 is the wave leaving port 2 relative to the wave incident on port 1, with the other port under the defined reference condition.',
  },
  {
    id: 'return-loss',
    category: 'RF',
    prompt: 'A more negative S11 magnitude in dB usually indicates what?',
    options: [
      'Worse input match',
      'Better input match',
      'More output power',
      'Higher noise figure',
    ],
    answer: 1,
    explanation:
      'A more negative S11 means less incident power is reflected at the input reference plane.',
  },
  {
    id: 'reference-plane',
    category: 'RF',
    prompt: 'Why does a VNA calibration move the reference plane?',
    options: [
      'To increase DUT gain',
      'To mathematically remove systematic fixture errors up to the calibration plane',
      'To change connector impedance',
      'To remove DUT noise',
    ],
    answer: 1,
    explanation:
      'Calibration characterizes systematic errors so the measurement is referenced at the chosen standards or fixture plane.',
  },
  {
    id: 'dbc-hz',
    category: 'Phase Noise',
    prompt: 'What does dBc/Hz express in a phase-noise plot?',
    options: [
      'Absolute carrier power',
      'Noise power relative to carrier, normalized to 1 Hz bandwidth',
      'Integrated jitter in seconds',
      'Analyzer sweep time',
    ],
    answer: 1,
    explanation:
      'Single-sideband phase noise is reported relative to the carrier and normalized to a one-hertz measurement bandwidth.',
  },
  {
    id: 'correlation',
    category: 'Phase Noise',
    prompt: 'What is the main purpose of cross-correlation in a phase-noise analyzer?',
    options: [
      'Increase DUT power',
      'Suppress uncorrelated analyzer noise',
      'Move the carrier frequency',
      'Eliminate every spur',
    ],
    answer: 1,
    explanation:
      'Repeated cross-correlation averages down noise that is uncorrelated between the analyzer channels while retaining common DUT noise.',
  },
  {
    id: 'rbw',
    category: 'Phase Noise',
    prompt: 'What tradeoff normally follows a narrower resolution bandwidth?',
    options: [
      'Faster sweep and rougher trace',
      'Slower measurement and better selectivity',
      'Higher carrier power',
      'Lower sample rate only',
    ],
    answer: 1,
    explanation:
      'Narrower RBW separates nearby energy more selectively but requires more settling and measurement time.',
  },
  {
    id: 'floor',
    category: 'Phase Noise',
    prompt: 'If the analyzer floor is above the DUT noise, what are you actually seeing?',
    options: [
      'A guaranteed DUT result',
      'An analyzer-limited measurement',
      'Only AM noise',
      'A calibrated cable delay',
    ],
    answer: 1,
    explanation:
      'A measurement cannot resolve a cleaner DUT when its own residual noise dominates the displayed trace.',
  },
  {
    id: 'attenuation',
    category: 'Test Equipment',
    prompt: 'Before injecting a signal into unfamiliar equipment, what should you verify first?',
    options: ['Screen color', 'Connector and input power limits', 'Sweep trace count', 'File name'],
    answer: 1,
    explanation:
      'The exact input, connector, DC, and damage limits in the equipment manuals come before connection.',
  },
  {
    id: 'rbw-vbw',
    category: 'Test Equipment',
    prompt: 'On a spectrum analyzer, VBW primarily smooths what?',
    options: [
      'The RF input impedance',
      'The detected trace after resolution filtering',
      'The local oscillator frequency',
      'The cable calibration plane',
    ],
    answer: 1,
    explanation:
      'VBW is a post-detection low-pass filter that reduces displayed trace variation; RBW determines frequency selectivity.',
  },
  {
    id: 'probe-ground',
    category: 'Test Equipment',
    prompt: 'Why can a long oscilloscope probe ground lead create misleading ringing?',
    options: [
      'It changes screen brightness',
      'Its inductance forms an unintended loop and resonant network',
      'It lowers sample memory',
      'It converts voltage to current',
    ],
    answer: 1,
    explanation:
      'Long ground loops add inductance and pick up interference, so high-speed probing needs a short ground path.',
  },
  {
    id: 'mic-distance',
    category: 'Studio Tech',
    prompt: 'What is usually the strongest first move for cleaner spoken audio?',
    options: [
      'Add more compression',
      'Move an appropriate microphone closer',
      'Increase camera ISO',
      'Raise stream bitrate',
    ],
    answer: 1,
    explanation:
      'Closer placement improves the direct voice-to-room-noise ratio before processing is asked to rescue the signal.',
  },
  {
    id: 'obs-source',
    category: 'Studio Tech',
    prompt: 'In OBS, where does a camera or capture card normally enter a scene?',
    options: [
      'Video Capture Device source',
      'Text source',
      'Browser history',
      'Replay buffer only',
    ],
    answer: 0,
    explanation: 'OBS represents cameras and capture devices as sources placed inside scenes.',
  },
  {
    id: 'keyframe',
    category: 'Studio Tech',
    prompt: 'What keyframe interval does YouTube currently recommend for live encoders?',
    options: ['Every frame', '2 seconds', '30 seconds', 'It forbids keyframes'],
    answer: 1,
    explanation:
      'YouTube currently recommends a two-second keyframe frequency and says not to exceed four seconds.',
  },
  {
    id: 'frame-rate',
    category: 'Studio Tech',
    prompt: 'For an uploaded video, what should happen to the recorded frame rate?',
    options: [
      'Always convert it to 24 fps',
      'Upload at the same frame rate it was recorded',
      'Double it',
      'Interlace it',
    ],
    answer: 1,
    explanation:
      'YouTube recommends encoding and uploading at the same frame rate used for recording.',
  },
  {
    id: 'stream-headroom',
    category: 'Studio Tech',
    prompt: 'Why should upload speed exceed the target stream bitrate?',
    options: [
      'To increase microphone gain',
      'To preserve stability when bandwidth fluctuates',
      'To change color space',
      'To reduce shutter angle',
    ],
    answer: 1,
    explanation:
      'A stream running at the absolute uplink limit has no headroom for normal network variation.',
  },
  {
    id: 'gain-stage',
    category: 'Studio Tech',
    prompt: 'What is gain staging trying to preserve across an audio chain?',
    options: [
      'Maximum clipping',
      'Healthy signal-to-noise ratio with headroom',
      'Constant microphone distance',
      'Video resolution',
    ],
    answer: 1,
    explanation:
      'Each stage should be strong enough to stay above noise while retaining headroom for peaks.',
  },
];

export function quizQuestionsFor(category?: CipherQuizCategory) {
  return category
    ? CIPHER_QUIZ_QUESTIONS.filter((question) => question.category === category)
    : CIPHER_QUIZ_QUESTIONS;
}
