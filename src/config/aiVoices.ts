import type {
  AiVoiceAccent,
  AiVoiceCadence,
  AiVoiceDelivery,
  AiVoiceName,
  AiVoiceProfile,
  AiVoiceTexture,
  CompanionId,
} from '@/types/game';

export interface CanonVoiceProfile extends AiVoiceProfile {
  direction: string;
  audition: string;
}

export const AI_VOICE_OPTIONS: Array<{
  id: AiVoiceName;
  label: string;
  character: string;
}> = [
  { id: 'alloy', label: 'Alloy', character: 'balanced and clear' },
  { id: 'ash', label: 'Ash', character: 'crisp and focused' },
  { id: 'ballad', label: 'Ballad', character: 'animated and expressive' },
  { id: 'coral', label: 'Coral', character: 'warm and composed' },
  { id: 'echo', label: 'Echo', character: 'measured and polished' },
  { id: 'fable', label: 'Fable', character: 'story-rich and textured' },
  { id: 'nova', label: 'Nova', character: 'bright and forceful' },
  { id: 'onyx', label: 'Onyx', character: 'deep and grounded' },
  { id: 'sage', label: 'Sage', character: 'steady and reflective' },
  { id: 'shimmer', label: 'Shimmer', character: 'gentle and airy' },
  { id: 'verse', label: 'Verse', character: 'smooth and articulate' },
  { id: 'marin', label: 'Marin', character: 'natural and intimate' },
  { id: 'cedar', label: 'Cedar', character: 'resonant and assured' },
];

export const AI_ACCENT_OPTIONS: Array<{
  id: AiVoiceAccent;
  label: string;
  direction: string;
}> = [
  {
    id: 'natural',
    label: 'Natural / canon',
    direction: 'Use the base voice naturally without imposing a regional accent.',
  },
  {
    id: 'general-american',
    label: 'General American',
    direction: 'Use a natural, contemporary General American accent.',
  },
  { id: 'british', label: 'British', direction: 'Use a natural modern British accent.' },
  { id: 'irish', label: 'Irish', direction: 'Use a natural modern Irish accent.' },
  {
    id: 'australian',
    label: 'Australian',
    direction: 'Use a natural modern Australian accent.',
  },
  {
    id: 'caribbean',
    label: 'Caribbean',
    direction: 'Use a light, natural Caribbean English accent without caricature.',
  },
  {
    id: 'west-african',
    label: 'West African',
    direction: 'Use a light, natural West African English accent without caricature.',
  },
  {
    id: 'southern-us',
    label: 'Southern U.S.',
    direction: 'Use a light, contemporary Southern U.S. accent without caricature.',
  },
];

export const AI_DELIVERY_OPTIONS: Array<{
  id: AiVoiceDelivery;
  label: string;
  character: string;
}> = [
  { id: 'conversational', label: 'Conversational', character: 'real phone-call energy' },
  { id: 'cinematic', label: 'Cinematic', character: 'dramatic and scene-rich' },
  { id: 'playful', label: 'Playful', character: 'smiles, wit, and bounce' },
  { id: 'intense', label: 'Intense', character: 'focused emotional pressure' },
  { id: 'soothing', label: 'Soothing', character: 'calm without sedation' },
  { id: 'commanding', label: 'Commanding', character: 'decisive effortless authority' },
  { id: 'dry', label: 'Dry', character: 'restrained deadpan humor' },
  { id: 'intimate', label: 'Intimate', character: 'close, private, and present' },
];

export const AI_CADENCE_OPTIONS: Array<{
  id: AiVoiceCadence;
  label: string;
  character: string;
}> = [
  { id: 'natural', label: 'Natural', character: 'varied everyday rhythm' },
  { id: 'clipped', label: 'Clipped', character: 'short decisive phrases' },
  { id: 'flowing', label: 'Flowing', character: 'connected and effortless' },
  { id: 'measured', label: 'Measured', character: 'deliberate, never dragged' },
  { id: 'rapid-fire', label: 'Rapid-fire', character: 'fast controlled momentum' },
];

export const AI_TEXTURE_OPTIONS: Array<{
  id: AiVoiceTexture;
  label: string;
  character: string;
}> = [
  { id: 'clean', label: 'Clean', character: 'clear and uncolored' },
  { id: 'smooth', label: 'Smooth', character: 'rounded and easy' },
  { id: 'airy', label: 'Airy', character: 'light without whispering' },
  { id: 'textured', label: 'Textured', character: 'lived-in and expressive' },
  { id: 'grounded', label: 'Grounded', character: 'solid and resonant' },
  { id: 'bright', label: 'Bright', character: 'crisp and energized' },
];

const CREATED_AT = '2026-08-11T00:00:00.000Z';

export const CANON_VOICE_PROFILES: Record<CompanionId, CanonVoiceProfile> = {
  snow: {
    id: 'snow',
    voice: 'marin',
    accent: 'natural',
    delivery: 'conversational',
    cadence: 'flowing',
    texture: 'smooth',
    pace: 1.1,
    warmth: 5,
    energy: 3,
    expressiveness: 4,
    naturalism: 5,
    pauseDiscipline: 4,
    updatedAt: CREATED_AT,
    direction:
      "A real late-night call with the Hunter's ride-or-die older sister: relaxed, wise, lightly teasing, and naturally quick. Her authority is effortless; never sleepy, breathy, corporate, or audiobook-like.",
    audition:
      "Okay, first of all, breathe. You don't have to solve the whole week tonight. Tell me the next true thing, and we'll handle it together.",
  },
  rook: {
    id: 'rook',
    voice: 'cedar',
    accent: 'natural',
    delivery: 'commanding',
    cadence: 'clipped',
    texture: 'grounded',
    pace: 1.18,
    warmth: 3,
    energy: 5,
    expressiveness: 4,
    naturalism: 5,
    pauseDiscipline: 5,
    updatedAt: CREATED_AT,
    direction:
      'An athletic sparring partner speaking in the room, not a stadium announcer: resonant, competitive, quick, and controlled, with an audible grin and zero drill-sergeant caricature.',
    audition:
      "Good. Now we've got a target. One clean rep, then another. Make me work to stay ahead of you.",
  },
  selah: {
    id: 'selah',
    voice: 'coral',
    accent: 'natural',
    delivery: 'soothing',
    cadence: 'flowing',
    texture: 'clean',
    pace: 0.98,
    warmth: 5,
    energy: 1,
    expressiveness: 3,
    naturalism: 5,
    pauseDiscipline: 3,
    updatedAt: CREATED_AT,
    direction:
      'Spiritually grounded and gently alive: clear, warm, plainspoken conviction without preaching, stage-whispering, or a solemn church-narrator cadence.',
    audition:
      'Be still for one breath. You do not need a polished answer; only enough honesty to choose the next faithful step.',
  },
  cipher: {
    id: 'cipher',
    voice: 'ash',
    accent: 'natural',
    delivery: 'dry',
    cadence: 'clipped',
    texture: 'clean',
    pace: 1.22,
    warmth: 2,
    energy: 3,
    expressiveness: 2,
    naturalism: 5,
    pauseDiscipline: 5,
    updatedAt: CREATED_AT,
    direction:
      'Quick, crisp, tech-smart, and quietly amused, like a brilliant friend with a restrained smirk. Precise without becoming monotone, synthetic, or over-enunciated.',
    audition:
      'The problem is not motivation. It is ambiguity. Name the deliverable, remove one constraint, and begin before the plan becomes decorative.',
  },
  haven: {
    id: 'haven',
    voice: 'fable',
    accent: 'caribbean',
    delivery: 'playful',
    cadence: 'rapid-fire',
    texture: 'bright',
    pace: 1.2,
    warmth: 4,
    energy: 5,
    expressiveness: 5,
    naturalism: 5,
    pauseDiscipline: 4,
    updatedAt: CREATED_AT,
    direction:
      'A magnetic creator friend live in the greenroom: quick, playful, socially intelligent, camera-ready, and genuinely excited by a strong idea. Use a light natural Caribbean lilt without caricature. Never sound like an ad read, influencer parody, announcer, or forced hype machine.',
    audition:
      'Okay, that hook has a pulse. Give me the audience promise, the first ten seconds, and the one tiny production move you can finish before fear starts calling itself research.',
  },
  ember: {
    id: 'ember',
    voice: 'nova',
    accent: 'natural',
    delivery: 'intense',
    cadence: 'rapid-fire',
    texture: 'bright',
    pace: 1.28,
    warmth: 2,
    energy: 5,
    expressiveness: 5,
    naturalism: 5,
    pauseDiscipline: 5,
    updatedAt: CREATED_AT,
    direction:
      'Fast, hard-edged, tough-skinned, and fiercely loyal. The heat attacks the obstacle, never the Hunter; she sounds like a real protective friend, not a screaming anime villain.',
    audition:
      "Nope. The spiral doesn't get the whole day. Shoes on, one minute of motion, and then it can file a complaint with me.",
  },
  mira: {
    id: 'mira',
    voice: 'shimmer',
    accent: 'natural',
    delivery: 'soothing',
    cadence: 'flowing',
    texture: 'airy',
    pace: 0.96,
    warmth: 4,
    energy: 2,
    expressiveness: 3,
    naturalism: 5,
    pauseDiscipline: 3,
    updatedAt: CREATED_AT,
    direction:
      'Calm, embodied, breath-aware, and quietly exacting. She leaves usable space for movement cues without sounding sedated, mystical, breathy, or like an ASMR recording.',
    audition:
      'Lengthen through the crown, soften the jaw, and let the exhale make room. Control first; range will follow.',
  },
  amara: {
    id: 'amara',
    voice: 'alloy',
    accent: 'natural',
    delivery: 'intimate',
    cadence: 'natural',
    texture: 'textured',
    pace: 1.08,
    warmth: 5,
    energy: 4,
    expressiveness: 5,
    naturalism: 5,
    pauseDiscipline: 4,
    updatedAt: CREATED_AT,
    direction:
      'Emotionally alive, bold, and deeply conversational. Warmth, laughter, softness, and firmness shift naturally instead of landing as a polished performance.',
    audition:
      'Say the honest version. Not the impressive one. Connection starts when somebody finally stops performing safety.',
  },
  cassian: {
    id: 'cassian',
    voice: 'echo',
    accent: 'natural',
    delivery: 'dry',
    cadence: 'measured',
    texture: 'clean',
    pace: 1.02,
    warmth: 2,
    energy: 2,
    expressiveness: 3,
    naturalism: 4,
    pauseDiscipline: 4,
    updatedAt: CREATED_AT,
    direction:
      'Polished, controlled, and dryly funny, as if the numbers have already testified. His precision stays human and conversational, never stiff or automated.',
    audition:
      'The ledger is not angry. It is merely observant. Give every dollar a duty before convenience volunteers it for something else.',
  },
  saffron: {
    id: 'saffron',
    voice: 'ballad',
    accent: 'natural',
    delivery: 'playful',
    cadence: 'rapid-fire',
    texture: 'bright',
    pace: 1.32,
    warmth: 4,
    energy: 5,
    expressiveness: 5,
    naturalism: 5,
    pauseDiscipline: 5,
    updatedAt: CREATED_AT,
    direction:
      'Pressure in a bottle: rapid, vibrant, high-pressure, theatrical, and affectionate. She ricochets through a culinary emergency like a real expressive friend, never a generic commercial narrator.',
    audition:
      'You have protein, rice, and twenty minutes. This is not a crisis; it is dinner with terrible public relations. Pan. Heat. Move!',
  },
};

export function cloneCanonVoiceProfile(companionId: CompanionId): AiVoiceProfile {
  const profile = CANON_VOICE_PROFILES[companionId];
  return {
    id: profile.id,
    voice: profile.voice,
    accent: profile.accent,
    delivery: profile.delivery,
    cadence: profile.cadence,
    texture: profile.texture,
    pace: profile.pace,
    warmth: profile.warmth,
    energy: profile.energy,
    expressiveness: profile.expressiveness,
    naturalism: profile.naturalism,
    pauseDiscipline: profile.pauseDiscipline,
    updatedAt: profile.updatedAt,
  };
}

function bounded(value: unknown, fallback: number, min: number, max: number, decimals = 0) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  const clamped = Math.min(max, Math.max(min, number));
  return decimals ? Number(clamped.toFixed(decimals)) : Math.round(clamped);
}

export function normalizeAiVoiceProfile(
  companionId: CompanionId,
  value?: Partial<AiVoiceProfile>,
): AiVoiceProfile {
  const canon = cloneCanonVoiceProfile(companionId);
  const voices = AI_VOICE_OPTIONS.map((option) => option.id);
  const accents = AI_ACCENT_OPTIONS.map((option) => option.id);
  const deliveries = AI_DELIVERY_OPTIONS.map((option) => option.id);
  const cadences = AI_CADENCE_OPTIONS.map((option) => option.id);
  const textures = AI_TEXTURE_OPTIONS.map((option) => option.id);
  return {
    ...canon,
    ...value,
    id: companionId,
    voice: value?.voice && voices.includes(value.voice) ? value.voice : canon.voice,
    accent: value?.accent && accents.includes(value.accent) ? value.accent : canon.accent,
    delivery:
      value?.delivery && deliveries.includes(value.delivery) ? value.delivery : canon.delivery,
    cadence: value?.cadence && cadences.includes(value.cadence) ? value.cadence : canon.cadence,
    texture: value?.texture && textures.includes(value.texture) ? value.texture : canon.texture,
    pace: bounded(value?.pace, canon.pace, 0.75, 1.65, 2),
    warmth: bounded(value?.warmth, canon.warmth, 1, 5),
    energy: bounded(value?.energy, canon.energy, 1, 5),
    expressiveness: bounded(value?.expressiveness, canon.expressiveness, 1, 5),
    naturalism: bounded(value?.naturalism, canon.naturalism, 1, 5),
    pauseDiscipline: bounded(value?.pauseDiscipline, canon.pauseDiscipline, 1, 5),
    updatedAt:
      typeof value?.updatedAt === 'string' && Number.isFinite(Date.parse(value.updatedAt))
        ? value.updatedAt
        : canon.updatedAt,
  };
}
