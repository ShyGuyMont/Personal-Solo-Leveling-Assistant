export type EngineeringLibraryCategory =
  | 'RF Foundations'
  | 'Network Analysis'
  | 'Spectrum & Noise'
  | 'Test Equipment'
  | 'Data & Automation'
  | 'Software Systems';

export interface EngineeringLibrarySource {
  title: string;
  organization: string;
  url: string;
}

export interface EngineeringLibraryTopic {
  id: string;
  title: string;
  category: EngineeringLibraryCategory;
  level: 'Foundation' | 'Working' | 'Advanced';
  summary: string;
  whyItMatters: string;
  keyConcepts: string[];
  fieldChecklist: string[];
  commonTraps: string[];
  keywords: string[];
  sources: EngineeringLibrarySource[];
}

const KEYSIGHT_S_PARAMETERS: EngineeringLibrarySource = {
  title: 'S-Parameter Design',
  organization: 'Keysight Technologies',
  url: 'https://www.keysight.com/us/en/assets/7018-06743/application-notes/5952-1087.pdf',
};

const KEYSIGHT_VNA_CORRECTION: EngineeringLibrarySource = {
  title: 'Network Analyzer Error Models and Calibration Methods',
  organization: 'Keysight Technologies',
  url: 'https://www.keysight.com/zz/en/assets/7018-06761/application-notes/5965-7709.pdf',
};

const KEYSIGHT_TIME_DOMAIN: EngineeringLibrarySource = {
  title: 'Time Domain Analysis Using a Network Analyzer',
  organization: 'Keysight Technologies',
  url: 'https://www.keysight.com/us/en/assets/7018-01451/application-notes/5989-5723.pdf',
};

const RS_PHASE_NOISE: EngineeringLibrarySource = {
  title: 'Measuring Phase Noise',
  organization: 'Rohde & Schwarz',
  url: 'https://www.rohde-schwarz.com/us/products/test-and-measurement/analyzers/signal-and-spectrum-analyzers/measuring-phase-noise_258363.html',
};

const RS_SPECTRUM: EngineeringLibrarySource = {
  title: 'Understanding Basic Spectrum Analyzer Operation',
  organization: 'Rohde & Schwarz',
  url: 'https://www.rohde-schwarz.com/us/knowledge-center/videos/understanding-basic-spectrum-analyzer-operation_251220-1513228.html',
};

const NI_RF: EngineeringLibrarySource = {
  title: 'RF Measurement Fundamentals',
  organization: 'National Instruments',
  url: 'https://www.ni.com/en/shop/pxi/rf-measurement-fundamentals.html',
};

const EXCEL_FUNCTIONS: EngineeringLibrarySource = {
  title: 'Excel Functions (Alphabetical)',
  organization: 'Microsoft',
  url: 'https://support.microsoft.com/en-US/Excel/excel-functions-alphabetical',
};

const EXCEL_ARRAYS: EngineeringLibrarySource = {
  title: 'Excel Functions That Return Ranges or Arrays',
  organization: 'Microsoft',
  url: 'https://support.microsoft.com/en-US/Excel/excel-functions-that-return-ranges-or-arrays',
};

const OFFICE_SCRIPTS: EngineeringLibrarySource = {
  title: 'Office Scripts in Excel',
  organization: 'Microsoft Learn',
  url: 'https://learn.microsoft.com/en-us/office/dev/scripts/overview/excel',
};

const POWER_QUERY_VS_SCRIPTS: EngineeringLibrarySource = {
  title: 'Differences Between Office Scripts and Power Query',
  organization: 'Microsoft Learn',
  url: 'https://learn.microsoft.com/en-us/office/dev/scripts/resources/power-query-differences',
};

const NUMPY: EngineeringLibrarySource = {
  title: 'NumPy Documentation',
  organization: 'NumPy',
  url: 'https://numpy.org/doc/stable/',
};

const SCIPY_SIGNAL: EngineeringLibrarySource = {
  title: 'Signal Processing (scipy.signal)',
  organization: 'SciPy',
  url: 'https://docs.scipy.org/doc/scipy/reference/signal.html',
};

const GIT_BOOK: EngineeringLibrarySource = {
  title: 'Pro Git',
  organization: 'Git',
  url: 'https://git-scm.com/book/en/v2',
};

export const ENGINEERING_LIBRARY_TOPICS: EngineeringLibraryTopic[] = [
  {
    id: 'rf-signal-chain', title: 'RF Signal-Chain Fundamentals', category: 'RF Foundations', level: 'Foundation',
    summary: 'A signal chain is only as trustworthy as its reference plane, impedance environment, gain budget, noise budget, and linearity margin.',
    whyItMatters: 'It prevents a clean-looking instrument trace from hiding loss, mismatch, compression, or a reference-plane mistake.',
    keyConcepts: ['50 Ω systems and mismatch', 'Gain/loss cascade', 'Noise and dynamic range', 'Compression and headroom'],
    fieldChecklist: ['Draw the complete path and reference planes.', 'Record expected power at every stage.', 'Verify connector, cable, attenuator, and termination limits.', 'Compare measured deltas with the cascade budget.'],
    commonTraps: ['Mixing voltage and power dB', 'Ignoring cable loss', 'Driving a receiver or DUT into compression'],
    keywords: ['rf', 'signal chain', 'gain', 'loss', 'compression', 'power budget'], sources: [NI_RF],
  },
  {
    id: 'db-dbm-cascade', title: 'dB, dBm, and Cascade Math', category: 'RF Foundations', level: 'Foundation',
    summary: 'dB expresses a ratio; dBm expresses absolute power referenced to 1 mW. Cascaded gains and losses add in dB while absolute powers require a reference.',
    whyItMatters: 'This is the arithmetic underneath almost every RF setup, link budget, and instrument safety check.',
    keyConcepts: ['10 log for power ratios', '20 log for equal-impedance voltage ratios', 'dBm to watts', 'Cascaded gain and loss'],
    fieldChecklist: ['Mark every number as ratio or absolute.', 'Keep impedance assumptions explicit.', 'Run a linear-unit sanity check.', 'Include uncertainty and margin.'],
    commonTraps: ['Adding dBm values', 'Using 20 log for power', 'Dropping minus signs on attenuation'],
    keywords: ['db', 'dbm', 'watts', 'cascade', 'link budget'], sources: [NI_RF],
  },
  {
    id: 's-parameters', title: 'S-Parameters Without the Fog', category: 'Network Analysis', level: 'Working',
    summary: 'S11 and S22 describe input/output reflection; S21 and S12 describe forward/reverse transmission under defined port conditions.',
    whyItMatters: 'S-parameters make high-frequency networks measurable without requiring impractical open- and short-circuit voltage/current measurements.',
    keyConcepts: ['S11 input match', 'S21 forward gain or insertion loss', 'S12 reverse isolation', 'S22 output match'],
    fieldChecklist: ['Confirm port orientation.', 'State magnitude format and phase convention.', 'Check reference impedance.', 'Save frequency span, IF bandwidth, power, and averaging.'],
    commonTraps: ['Reversing ports', 'Calling S21 gain when the DUT is passive without context', 'Ignoring fixture de-embedding'],
    keywords: ['s parameter', 's11', 's21', 's12', 's22', 'return loss', 'insertion loss'], sources: [KEYSIGHT_S_PARAMETERS],
  },
  {
    id: 'smith-chart', title: 'Smith Chart and Impedance Matching', category: 'Network Analysis', level: 'Working',
    summary: 'The Smith chart maps complex reflection coefficient to normalized impedance or admittance, making matching moves and resonance behavior visible.',
    whyItMatters: 'It turns reflection data into an actionable picture of whether a network is resistive, inductive, capacitive, or badly referenced.',
    keyConcepts: ['Reflection coefficient', 'VSWR and return loss', 'Normalized impedance', 'Series and shunt matching paths'],
    fieldChecklist: ['Confirm normalization impedance.', 'Place marker at the actual operating frequency.', 'Inspect both magnitude and phase.', 'Validate the match across bandwidth, not one point.'],
    commonTraps: ['Optimizing one frequency only', 'Confusing impedance and admittance charts', 'Ignoring component parasitics'],
    keywords: ['smith chart', 'impedance', 'matching', 'vswr', 'reflection'], sources: [KEYSIGHT_S_PARAMETERS],
  },
  {
    id: 'vna-calibration', title: 'VNA Calibration: SOLT, TRL, and Reference Planes', category: 'Test Equipment', level: 'Advanced',
    summary: 'Calibration estimates systematic measurement errors and moves the reference plane to the standards; it does not repair drift, bad connections, damaged cables, or an invalid fixture model.',
    whyItMatters: 'A VNA can be extremely precise while reporting the wrong DUT if the calibration plane or standard definition is wrong.',
    keyConcepts: ['Directivity, source match, and tracking', 'One-port vs two-port correction', 'SOLT', 'TRL and fixture environments'],
    fieldChecklist: ['Warm up the instrument.', 'Inspect and clean every interface.', 'Choose standards for connector/fixture geometry.', 'Verify with a known check device.', 'Recalibrate after cable or setup changes.'],
    commonTraps: ['Treating calibration as permanent', 'Flexing cables after calibration', 'Using the wrong cal-kit definition'],
    keywords: ['vna', 'calibration', 'solt', 'trl', 'reference plane', 'error correction'], sources: [KEYSIGHT_VNA_CORRECTION],
  },
  {
    id: 'vna-time-domain', title: 'VNA Time-Domain Fault Location', category: 'Test Equipment', level: 'Advanced',
    summary: 'Inverse transforms convert swept-frequency data into a time/distance view that can locate discontinuities, gates, and fixture effects.',
    whyItMatters: 'It helps answer where a reflection lives instead of only showing that one exists.',
    keyConcepts: ['Frequency span vs spatial resolution', 'Time-domain gating', 'Windowing', 'Velocity factor'],
    fieldChecklist: ['Use enough span and points.', 'Enter the correct propagation velocity.', 'Compare gated and ungated frequency results.', 'Document window and gate settings.'],
    commonTraps: ['Over-gating real DUT behavior', 'Using the wrong velocity factor', 'Reading beyond unambiguous range'],
    keywords: ['time domain', 'tdr', 'vna', 'gating', 'fault location'], sources: [KEYSIGHT_TIME_DOMAIN],
  },
  {
    id: 'spectrum-analyzer', title: 'Spectrum Analyzer Operating Discipline', category: 'Spectrum & Noise', level: 'Working',
    summary: 'Center/span, reference level, attenuation, preamp, RBW, VBW, detector, sweep time, and averaging jointly determine what the trace can prove.',
    whyItMatters: 'A fast, pretty sweep can hide signals, distort amplitudes, or raise the displayed noise floor.',
    keyConcepts: ['Resolution bandwidth', 'Video bandwidth', 'Displayed average noise level', 'Input attenuation and preamp'],
    fieldChecklist: ['Protect the input first.', 'Set reference level with headroom.', 'Narrow span and RBW deliberately.', 'Use detector and averaging appropriate to the signal.', 'Record all acquisition settings.'],
    commonTraps: ['Overloading the front end', 'Comparing traces with different RBW', 'Mistaking DANL for the DUT noise floor'],
    keywords: ['spectrum analyzer', 'rbw', 'vbw', 'danl', 'detector', 'span'], sources: [RS_SPECTRUM, NI_RF],
  },
  {
    id: 'phase-noise', title: 'Phase Noise Measurement', category: 'Spectrum & Noise', level: 'Advanced',
    summary: 'Phase noise describes short-term phase fluctuations around a carrier, commonly expressed as single-sideband noise power density relative to carrier power at a specified offset.',
    whyItMatters: 'It affects communications quality, reciprocal mixing, radar sensitivity, clocks, converters, and every system that depends on spectral purity.',
    keyConcepts: ['dBc/Hz and offset frequency', 'Residual vs absolute phase noise', 'Cross-correlation', 'Integrated phase noise and jitter'],
    fieldChecklist: ['State carrier and offset range.', 'Confirm analyzer noise floor and reference quality.', 'Avoid compression and AM contamination.', 'Report correlation count and integration limits.'],
    commonTraps: ['Quoting dBc/Hz without offset', 'Confusing spur levels with random phase noise', 'Integrating across undocumented limits'],
    keywords: ['phase noise', 'dBc/Hz', 'jitter', 'cross correlation', 'spectral purity'], sources: [RS_PHASE_NOISE],
  },
  {
    id: 'noise-figure', title: 'Noise Figure and Sensitivity', category: 'Spectrum & Noise', level: 'Working',
    summary: 'Noise figure measures degradation of signal-to-noise ratio through a network; cascaded system performance is dominated by early-stage gain and noise behavior.',
    whyItMatters: 'It ties component choices to receiver sensitivity and prevents late-stage gain from being mistaken for recovered SNR.',
    keyConcepts: ['Noise factor vs noise figure', 'Thermal noise density', 'Friis cascade', 'Gain before lossy stages'],
    fieldChecklist: ['Define source temperature and bandwidth.', 'Measure or verify gain.', 'Account for adapters and pre-DUT loss.', 'Check ENR/calibration and uncertainty.'],
    commonTraps: ['Ignoring input cable loss', 'Using dB values directly in Friis math', 'Confusing noise power with noise figure'],
    keywords: ['noise figure', 'sensitivity', 'friis', 'snr', 'thermal noise'], sources: [NI_RF],
  },
  {
    id: 'measurement-plan', title: 'Measurement Plan and Troubleshooting Ladder', category: 'Test Equipment', level: 'Foundation',
    summary: 'A defensible measurement begins with the decision it must support, expected range, reference plane, limits, uncertainty, safety, and a repeatable capture procedure.',
    whyItMatters: 'It separates engineering evidence from trial-and-error instrument operation.',
    keyConcepts: ['Hypothesis and acceptance limit', 'Golden path and known-good device', 'Uncertainty and repeatability', 'Change one variable'],
    fieldChecklist: ['Write the question and pass/fail rule.', 'Sketch setup and reference planes.', 'Record instrument state and calibration.', 'Run a known-good check.', 'Preserve raw data and metadata.'],
    commonTraps: ['Changing several variables at once', 'Saving screenshots without settings', 'Treating one good run as repeatability'],
    keywords: ['measurement plan', 'troubleshoot', 'test equipment', 'uncertainty', 'repeatability'], sources: [NI_RF, KEYSIGHT_VNA_CORRECTION],
  },
  {
    id: 'excel-modern-formulas', title: 'Modern Excel Formula Engineering', category: 'Data & Automation', level: 'Working',
    summary: 'Dynamic arrays, XLOOKUP, LET, FILTER, SORT, UNIQUE, and structured references can replace fragile helper-column chains with readable calculation pipelines.',
    whyItMatters: 'Engineering workbooks become easier to audit, reuse, and hand to someone who did not build them.',
    keyConcepts: ['Dynamic-array spill behavior', 'LET for named intermediate values', 'Exact-match lookup', 'Tables and structured references'],
    fieldChecklist: ['Separate raw data, transformations, and presentation.', 'Use units in headers.', 'Name important intermediate logic.', 'Test blanks, errors, and boundary values.'],
    commonTraps: ['Hard-coded ranges', 'Silent approximate matches', 'Merged cells in data regions'],
    keywords: ['excel', 'xlookup', 'let', 'filter', 'dynamic array', 'spreadsheet'], sources: [EXCEL_FUNCTIONS, EXCEL_ARRAYS],
  },
  {
    id: 'excel-automation', title: 'Power Query vs Office Scripts', category: 'Data & Automation', level: 'Working',
    summary: 'Power Query is strongest for repeatable data ingestion and transformation; Office Scripts automates workbook actions and can participate in broader workflows.',
    whyItMatters: 'Choosing the correct layer prevents a workbook macro from becoming a brittle data pipeline.',
    keyConcepts: ['ETL and refreshable queries', 'Workbook action automation', 'Idempotent transformations', 'Separation of data and presentation'],
    fieldChecklist: ['Define the input contract.', 'Choose query for transform, script for workbook actions.', 'Make reruns safe.', 'Log failures and validate row counts.'],
    commonTraps: ['Automating manual clicks instead of modeling the transform', 'Overwriting source data', 'Depending on active cell state'],
    keywords: ['excel', 'power query', 'office scripts', 'automation', 'etl'], sources: [OFFICE_SCRIPTS, POWER_QUERY_VS_SCRIPTS],
  },
  {
    id: 'python-signal-analysis', title: 'Python Signal Analysis Stack', category: 'Data & Automation', level: 'Working',
    summary: 'NumPy provides array mathematics and SciPy Signal provides filters, spectral estimation, transforms, resampling, and system-analysis tools.',
    whyItMatters: 'Repeatable scripts preserve the calculation path from raw capture to engineering conclusion.',
    keyConcepts: ['Array shape and units', 'Sample rate and aliasing', 'Windowing and PSD estimation', 'Filter response validation'],
    fieldChecklist: ['Preserve raw input unchanged.', 'Store sample rate and units beside data.', 'Plot time and frequency domains.', 'Test with a known synthetic signal.', 'Record library versions.'],
    commonTraps: ['Wrong FFT normalization', 'Losing units', 'Filtering without checking phase or edge effects'],
    keywords: ['python', 'numpy', 'scipy', 'signal processing', 'fft', 'filter'], sources: [NUMPY, SCIPY_SIGNAL],
  },
  {
    id: 'git-debugging', title: 'Git and Software Debugging Discipline', category: 'Software Systems', level: 'Foundation',
    summary: 'Small commits, observable failure cases, controlled changes, and bisectable history turn debugging from guessing into evidence collection.',
    whyItMatters: 'The same discipline that protects lab measurements protects production software and automation.',
    keyConcepts: ['Working tree vs index vs commit', 'Branches and remotes', 'Minimal reproduction', 'Binary search with bisect'],
    fieldChecklist: ['Reproduce before editing.', 'Capture the exact error.', 'Change one causal layer.', 'Run targeted and regression tests.', 'Commit a coherent result.'],
    commonTraps: ['Mixing unrelated fixes', 'Deleting evidence before reproducing', 'Assuming the newest change is the only cause'],
    keywords: ['git', 'coding', 'debugging', 'branch', 'commit', 'bisect'], sources: [GIT_BOOK],
  },
];

export const ENGINEERING_LIBRARY_CATEGORIES: EngineeringLibraryCategory[] = [
  'RF Foundations', 'Network Analysis', 'Spectrum & Noise', 'Test Equipment', 'Data & Automation', 'Software Systems',
];

function normalizeEngineeringQuery(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9+.-]+/g, ' ').trim();
}

export function searchEngineeringLibrary(query: string, category?: EngineeringLibraryCategory) {
  const terms = normalizeEngineeringQuery(query).split(/\s+/).filter(Boolean);
  return ENGINEERING_LIBRARY_TOPICS.filter((topic) => {
    if (category && topic.category !== category) return false;
    if (!terms.length) return true;
    const haystack = normalizeEngineeringQuery([
      topic.title, topic.category, topic.summary, ...topic.keywords, ...topic.keyConcepts,
    ].join(' '));
    return terms.every((term) => haystack.includes(term));
  });
}

export function selectEngineeringTopics(query: string, limit = 4) {
  const direct = searchEngineeringLibrary(query);
  return (direct.length ? direct : ENGINEERING_LIBRARY_TOPICS).slice(0, limit);
}

export function buildCipherTopicPrompt(topic: EngineeringLibraryTopic) {
  const sourceList = topic.sources.map((source) => `${source.organization}: ${source.url}`).join('\n');
  return `Cipher, open your Engineering Library dossier “${topic.title}” and teach it to me at my level. Start with a direct explanation, use a practical example, then quiz my understanding. Treat these official sources as the library grounding and distinguish sourced facts from your own inference:\n${sourceList}`;
}
