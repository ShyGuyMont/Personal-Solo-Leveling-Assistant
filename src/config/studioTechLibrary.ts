export type StudioTechCategory =
  'Camera & Capture' | 'Audio' | 'Lighting' | 'Streaming' | 'Delivery' | 'Troubleshooting';

export interface StudioTechSource {
  title: string;
  organization: string;
  url: string;
}

export interface StudioTechTopic {
  id: string;
  title: string;
  category: StudioTechCategory;
  summary: string;
  concepts: string[];
  setupChecklist: string[];
  diagnostics: string[];
  keywords: string[];
  sources: StudioTechSource[];
}

const YOUTUBE_UPLOAD: StudioTechSource = {
  title: 'Recommended upload encoding settings',
  organization: 'YouTube Help',
  url: 'https://support.google.com/youtube/answer/1722171',
};
const YOUTUBE_LIVE: StudioTechSource = {
  title: 'Choose live encoder settings, bitrates, and resolutions',
  organization: 'YouTube Help',
  url: 'https://support.google.com/youtube/answer/2853702',
};
const YOUTUBE_ERRORS: StudioTechSource = {
  title: 'Live streaming error messages',
  organization: 'YouTube Help',
  url: 'https://support.google.com/youtube/answer/3006768',
};
const OBS_START: StudioTechSource = {
  title: 'OBS Studio Quick Start Guide',
  organization: 'OBS Project',
  url: 'https://obsproject.com/kb/quick-start-guide',
};
const OBS_OVERVIEW: StudioTechSource = {
  title: 'OBS Studio Overview Guide',
  organization: 'OBS Project',
  url: 'https://obsproject.com/kb/obs-studio-overview',
};
const SHURE_VIDEO: StudioTechSource = {
  title: 'Audio Systems Guide for Video and Film Production',
  organization: 'Shure',
  url: 'https://www.shure.com/damfiles/default/global/documents/publications/en/performance-production/audio-systems-guide-for-video-and-film-production-english.pdf-041a24efe18f0fd3f46465374fbe1839.pdf',
};
const HDMI_SPEC: StudioTechSource = {
  title: 'HDMI Specifications Overview',
  organization: 'HDMI Licensing Administrator',
  url: 'https://www.hdmi.org/spec/index',
};
const BLACKMAGIC_CAPTURE: StudioTechSource = {
  title: 'Capture and Playback Support',
  organization: 'Blackmagic Design',
  url: 'https://www.blackmagicdesign.com/support/family/capture-and-playback',
};

export const STUDIO_TECH_CATEGORIES: StudioTechCategory[] = [
  'Camera & Capture',
  'Audio',
  'Lighting',
  'Streaming',
  'Delivery',
  'Troubleshooting',
];

export const STUDIO_TECH_TOPICS: StudioTechTopic[] = [
  {
    id: 'camera-signal-chain',
    title: 'Camera Signal Chain',
    category: 'Camera & Capture',
    summary:
      'Trace the image from sensor and lens through camera processing, HDMI or USB, capture, OBS, encoding, and final delivery.',
    concepts: [
      'Resolution and frame rate are separate from bitrate and codec.',
      'A clean HDMI feed removes overlays before capture.',
      'Color range, transfer function, and chroma format must agree through the chain.',
      'Every conversion adds a possible format or latency failure.',
    ],
    setupChecklist: [
      'Choose delivery resolution and frame rate first.',
      'Match camera output to capture-card support.',
      'Disable display overlays for a clean feed.',
      'Confirm OBS canvas, source, and output formats.',
      'Record a movement and skin-tone test.',
    ],
    diagnostics: [
      'No signal: verify camera output mode, cable, capture input, and supported timing.',
      'Soft image: check focus, shutter, scaling, and whether the source is being enlarged.',
      'Wrong color: compare full versus limited range and SDR color settings.',
    ],
    keywords: ['camera', 'capture card', 'hdmi', 'usb', 'clean feed', 'frame rate', 'resolution'],
    sources: [OBS_START, HDMI_SPEC, BLACKMAGIC_CAPTURE],
  },
  {
    id: 'exposure-motion',
    title: 'Exposure, Motion, and Frame Rate',
    category: 'Camera & Capture',
    summary:
      'Control motion rendering deliberately instead of letting auto exposure change the look mid-recording.',
    concepts: [
      'Frame rate defines temporal sampling.',
      'Shutter time changes motion blur and light collection.',
      'Aperture changes exposure and depth of field.',
      'Gain or ISO raises the captured signal and visible noise together.',
    ],
    setupChecklist: [
      'Pick frame rate for the content.',
      'Set a stable shutter appropriate to that frame rate.',
      'Choose aperture for the desired depth of field.',
      'Light the scene before pushing gain.',
      'Lock white balance after the lighting is stable.',
    ],
    diagnostics: [
      'Choppy motion: inspect shutter and dropped frames.',
      'Brightness pumping: disable unwanted auto exposure.',
      'Color drifting: lock white balance and mixed-light sources.',
    ],
    keywords: ['iso', 'shutter', 'aperture', 'motion blur', 'fps', 'white balance'],
    sources: [YOUTUBE_UPLOAD, OBS_OVERVIEW],
  },
  {
    id: 'capture-compatibility',
    title: 'HDMI, USB, and Capture Compatibility',
    category: 'Camera & Capture',
    summary:
      'Understand handshakes, supported timings, bandwidth, copy protection, and why a perfectly good cable can still produce a black screen.',
    concepts: [
      'Source and sink negotiate supported formats.',
      'USB bandwidth is shared by devices on the same controller.',
      'HDCP-protected content is not a normal capture source.',
      'A capture device may accept one format while outputting another to software.',
    ],
    setupChecklist: [
      'Read the exact capture-device format table.',
      'Use a known-good short cable.',
      'Test direct camera-to-display output.',
      'Connect capture hardware before launching software.',
      'Check USB controller load and power.',
    ],
    diagnostics: [
      'Black screen: test timing, HDCP, cable, and input selection.',
      'Random disconnects: inspect USB power and controller contention.',
      'Only 30 fps available: verify the complete format path supports the target mode.',
    ],
    keywords: [
      'edid',
      'hdcp',
      'capture',
      'capture card',
      'hdmi',
      'usb bandwidth',
      'black screen',
      'handshake',
    ],
    sources: [HDMI_SPEC, BLACKMAGIC_CAPTURE, OBS_START],
  },
  {
    id: 'microphone-selection',
    title: 'Microphone Choice and Placement',
    category: 'Audio',
    summary:
      'Choose placement for the room and voice before trying to repair distance with processing.',
    concepts: [
      'Distance usually matters more than microphone price.',
      'Directional patterns reject sound by angle, not by magic.',
      'Dynamic and condenser designs solve different practical problems.',
      'Room reflections arrive louder as the microphone moves away.',
    ],
    setupChecklist: [
      'Place the microphone close but outside problem plosive angles.',
      'Aim the rejection area toward the main noise source.',
      'Monitor through headphones.',
      'Record silence, normal speech, and loud speech.',
      'Move the microphone before adding aggressive processing.',
    ],
    diagnostics: [
      'Hollow voice: reduce room contribution and inspect phase relationships.',
      'Plosives: move off-axis or add a pop filter.',
      'Keyboard noise: change placement, pattern, and desk coupling.',
    ],
    keywords: ['microphone', 'dynamic', 'condenser', 'placement', 'polar pattern', 'plosive'],
    sources: [SHURE_VIDEO],
  },
  {
    id: 'gain-staging',
    title: 'Gain Staging and Voice Processing',
    category: 'Audio',
    summary:
      'Keep speech clearly above the noise floor while preserving headroom through the microphone, interface, software, and encoder.',
    concepts: [
      'Gain establishes level before later processing.',
      'Compression narrows dynamic range; it does not repair clipping.',
      'A limiter catches peaks but should not carry the entire mix.',
      'Noise suppression trades artifacts for lower background noise.',
    ],
    setupChecklist: [
      'Set hardware gain from the loudest realistic voice.',
      'Leave peak headroom.',
      'Apply high-pass filtering only when useful.',
      'Use gentle compression before limiting.',
      'Compare processed and bypassed recordings at matched loudness.',
    ],
    diagnostics: [
      'Hiss: improve placement and front-end gain before boosting later.',
      'Distortion: locate the first clipping stage.',
      'Pumping: reduce compressor or suppressor intensity.',
    ],
    keywords: ['gain', 'compression', 'limiter', 'noise gate', 'noise floor', 'clipping'],
    sources: [SHURE_VIDEO, OBS_OVERVIEW],
  },
  {
    id: 'audio-routing',
    title: 'Interfaces, Monitoring, and Audio Routing',
    category: 'Audio',
    summary:
      'Build one intentional path for microphones, game audio, chat, alerts, monitoring, and recordings without doubles or missing tracks.',
    concepts: [
      'Direct monitoring and software monitoring have different latency.',
      'Duplicate monitoring paths create echo.',
      'Sample-rate mismatches can cause drift or conversion.',
      'Separate tracks help editing but the stream still needs a complete program mix.',
    ],
    setupChecklist: [
      'Draw every source and destination.',
      'Choose one monitoring path per source.',
      'Match sample rates across the chain.',
      'Name OBS sources by physical device and purpose.',
      'Test both the live mix and isolated recording tracks.',
    ],
    diagnostics: [
      'Echo: find duplicate monitor or loopback paths.',
      'Gradual sync drift: inspect sample rates and clocking.',
      'Meters move but stream is silent: verify track and monitoring assignments.',
    ],
    keywords: ['audio interface', 'monitoring', 'routing', 'loopback', 'sample rate', 'sync'],
    sources: [SHURE_VIDEO, OBS_OVERVIEW],
  },
  {
    id: 'lighting-foundations',
    title: 'Lighting a Creator Space',
    category: 'Lighting',
    summary:
      'Shape a repeatable face and background with direction, size, distance, color consistency, and controlled spill.',
    concepts: [
      'A larger apparent source creates softer transitions.',
      'Distance changes intensity and falloff.',
      'Key-to-fill ratio creates shape.',
      'Mixed color temperatures complicate skin tone and white balance.',
    ],
    setupChecklist: [
      'Kill uncontrolled room lights first.',
      'Place and expose the key light.',
      'Add fill only as needed.',
      'Separate subject and background deliberately.',
      'Check glasses, shadows, and flicker on camera.',
    ],
    diagnostics: [
      'Harsh face: increase source size or move diffusion closer.',
      'Flat image: reduce fill or change key angle.',
      'Banding or flicker: match lighting and shutter behavior.',
    ],
    keywords: ['key light', 'fill', 'rim', 'softbox', 'color temperature', 'flicker'],
    sources: [YOUTUBE_UPLOAD, OBS_OVERVIEW],
  },
  {
    id: 'obs-architecture',
    title: 'OBS Scenes, Sources, and Reliability',
    category: 'Streaming',
    summary:
      'Build reusable scenes, controlled transitions, clean audio ownership, and testable fallbacks.',
    concepts: [
      'Scenes are compositions; sources are reusable inputs.',
      'Nested scenes reduce duplication but can hide dependencies.',
      'Studio Mode separates preview from program.',
      'A backup scene is part of reliability, not decoration.',
    ],
    setupChecklist: [
      'Run the Auto-Configuration Wizard as a baseline.',
      'Build gameplay, camera, BRB, and emergency scenes.',
      'Use descriptive source names.',
      'Disable unused global audio devices.',
      'Make a local test recording before going live.',
    ],
    diagnostics: [
      'Black game capture: verify capture method and privilege level.',
      'Lagged preview: inspect GPU load and source complexity.',
      'Wrong audio: audit global devices and per-scene sources.',
    ],
    keywords: ['obs', 'scene', 'source', 'studio mode', 'game capture', 'stream'],
    sources: [OBS_START, OBS_OVERVIEW],
  },
  {
    id: 'encoder-bitrate',
    title: 'Encoder, Bitrate, and Network Headroom',
    category: 'Streaming',
    summary:
      'Choose a stream the computer and connection can sustain continuously rather than a quality target that fails under pressure.',
    concepts: [
      'Resolution, frame rate, codec, and bitrate jointly set quality and load.',
      'Hardware encoders trade some flexibility for lower CPU pressure.',
      'CBR and regular keyframes support predictable live ingest.',
      'Upload headroom protects the stream from ordinary network variation.',
    ],
    setupChecklist: [
      'Measure realistic sustained upload speed.',
      'Choose a bitrate inside YouTube guidance.',
      'Set a two-second keyframe interval.',
      'Run movement and audio tests.',
      'Monitor dropped frames, render lag, encoder lag, and YouTube stream health.',
    ],
    diagnostics: [
      'Network dropped frames: lower bitrate or fix uplink stability.',
      'Encoding lag: reduce encoder load or output complexity.',
      'Render lag: reduce GPU scene load and frame demand.',
    ],
    keywords: ['bitrate', 'nvenc', 'av1', 'h264', 'hevc', 'keyframe', 'dropped frames'],
    sources: [YOUTUBE_LIVE, YOUTUBE_ERRORS, OBS_START],
  },
  {
    id: 'latency-sync',
    title: 'Latency and A/V Sync',
    category: 'Streaming',
    summary:
      'Measure where delay enters the path and align sources intentionally instead of adding random offsets.',
    concepts: [
      'Camera, capture, audio, filters, encoding, network, and playback all add latency.',
      'A constant offset can be corrected; drifting sync needs a clock or sample-rate diagnosis.',
      'Monitoring latency is not always program latency.',
      'Lower stream latency can reduce playback buffer resilience.',
    ],
    setupChecklist: [
      'Record a visible clap test.',
      'Measure which source arrives first.',
      'Correct the faster source with a controlled delay.',
      'Retest after every hardware or format change.',
      'Separate local sync from viewer-side platform latency.',
    ],
    diagnostics: [
      'Constant lip-sync error: apply measured delay.',
      'Drift over time: inspect sample rates, clocks, and variable frame rate.',
      'Only live viewers see delay: inspect platform latency mode and network buffering.',
    ],
    keywords: ['latency', 'sync', 'audio delay', 'audio video sync', 'lip sync', 'drift', 'buffer'],
    sources: [YOUTUBE_LIVE, OBS_OVERVIEW],
  },
  {
    id: 'recording-master',
    title: 'Recording Masters and Storage Planning',
    category: 'Delivery',
    summary:
      'Record files that survive crashes, preserve edit quality, and fit the available storage and workflow.',
    concepts: [
      'Container and codec are different choices.',
      'Crash-resilient recording containers can be remuxed later.',
      'Higher bitrate raises quality potential and storage demand.',
      'Separate audio tracks preserve editing control.',
    ],
    setupChecklist: [
      'Choose a crash-resilient recording container.',
      'Estimate storage from bitrate and duration.',
      'Record isolated audio tracks plus the program mix.',
      'Use a quality-oriented recording profile.',
      'Test remux, playback, and editor import before a long session.',
    ],
    diagnostics: [
      'Corrupt file after crash: change recording container strategy.',
      'Editor rejects file: remux or use a supported codec.',
      'Storage fills early: calculate total video and audio bitrate before recording.',
    ],
    keywords: ['mkv', 'mp4', 'remux', 'codec', 'container', 'storage', 'recording'],
    sources: [OBS_OVERVIEW, YOUTUBE_UPLOAD],
  },
  {
    id: 'youtube-delivery',
    title: 'YouTube Upload and Delivery',
    category: 'Delivery',
    summary:
      'Export a clean master with consistent frame rate, progressive video, correct SDR color metadata, and supported audio.',
    concepts: [
      'YouTube re-encodes uploads.',
      'The upload should retain the recorded frame rate.',
      'BT.709 is the normal SDR delivery space.',
      'A high-quality source gives the platform more useful information to encode.',
    ],
    setupChecklist: [
      'Export progressive video at the recorded frame rate.',
      'Use consistent SDR color metadata.',
      'Use a supported container and codec.',
      'Export audio at 48 kHz when that matches the production chain.',
      'Inspect the processed upload on more than one display.',
    ],
    diagnostics: [
      'Wrong colors: inspect color primaries, transfer, matrix, and range tags.',
      'Soft result: inspect source resolution, bitrate, scaling, and processing completion.',
      'Audio issue: verify codec, phase, channel layout, and sample rate.',
    ],
    keywords: ['youtube upload', 'h264', 'bt709', 'color space', 'aac', 'export'],
    sources: [YOUTUBE_UPLOAD],
  },
  {
    id: 'fault-isolation',
    title: 'Studio Fault Isolation',
    category: 'Troubleshooting',
    summary:
      'Reduce a broken studio to the smallest known-good path, change one variable, and preserve evidence.',
    concepts: [
      'A signal chain is debugged from source to destination.',
      'Known-good substitutions separate device faults from path faults.',
      'Changing several settings destroys causal evidence.',
      'A short test recording is more trustworthy than a live impression.',
    ],
    setupChecklist: [
      'Write the exact symptom and last known-good state.',
      'Restart with one camera, one microphone, and one scene.',
      'Verify each stage independently.',
      'Substitute one known-good cable or device at a time.',
      'Save the working configuration before rebuilding complexity.',
    ],
    diagnostics: [
      'No picture: source → output format → cable → capture → source selection.',
      'No audio: microphone → preamp → interface → OS → OBS track → encoder.',
      'Stutter: separate render, encode, disk, USB, and network bottlenecks.',
    ],
    keywords: ['troubleshoot', 'black screen', 'no audio', 'stutter', 'dropped frames', 'debug'],
    sources: [OBS_START, YOUTUBE_ERRORS, BLACKMAGIC_CAPTURE],
  },
];

export function searchStudioTechLibrary(query: string, category?: StudioTechCategory) {
  const needle = query.trim().toLowerCase();
  const tokens = needle.split(/\s+/).filter(Boolean);
  return STUDIO_TECH_TOPICS.map((topic) => {
    const title = topic.title.toLowerCase();
    const keywords = topic.keywords.join(' ').toLowerCase();
    const searchable = [
      topic.title,
      topic.category,
      topic.summary,
      ...topic.concepts,
      ...topic.diagnostics,
      ...topic.keywords,
    ]
      .join(' ')
      .toLowerCase();
    const score =
      (title.includes(needle) ? 50 : 0) +
      (keywords.includes(needle) ? 30 : 0) +
      tokens.reduce(
        (total, token) =>
          total +
          (title.includes(token) ? 8 : 0) +
          (keywords.includes(token) ? 4 : 0) +
          (searchable.includes(token) ? 1 : 0),
        0,
      );
    return { topic, searchable, score };
  })
    .filter(({ topic, searchable }) => {
      if (category && topic.category !== category) return false;
      if (!needle) return true;
      return searchable.includes(needle) || tokens.every((token) => searchable.includes(token));
    })
    .sort((left, right) => right.score - left.score)
    .map(({ topic }) => topic);
}

export function buildStudioTechPrompt(topic: StudioTechTopic) {
  const sources = topic.sources
    .map((source) => `- ${source.organization}: ${source.title} (${source.url})`)
    .join('\n');
  return `Cipher, open your Studio Tech dossier “${topic.title}.” Help me apply it to my actual YouTube setup. Ask what gear and signal path I have, diagnose one stage at a time, and distinguish official guidance from your inference. Ground the answer in these official sources:\n${sources}`;
}
