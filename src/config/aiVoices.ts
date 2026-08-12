import type { AiVoiceAccent, AiVoiceName, AiVoiceProfile, CompanionId } from '@/types/game';

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

const CREATED_AT = '2026-08-11T00:00:00.000Z';

export const CANON_VOICE_PROFILES: Record<CompanionId, CanonVoiceProfile> = {
  snow: {
    id: 'snow',
    voice: 'marin',
    accent: 'natural',
    pace: 0.92,
    warmth: 5,
    energy: 2,
    expressiveness: 3,
    updatedAt: CREATED_AT,
    direction:
      'Relaxed, warm, and wise with cool older-sister energy. Authority should feel effortless, never announced.',
    audition:
      "Easy, Hunter. We don't have to solve the whole week tonight. Give me the next true thing, and we'll move from there.",
  },
  rook: {
    id: 'rook',
    voice: 'cedar',
    accent: 'natural',
    pace: 1.05,
    warmth: 3,
    energy: 5,
    expressiveness: 4,
    updatedAt: CREATED_AT,
    direction:
      'Resonant, athletic, competitive, and controlled, with a grin audible beneath the challenge.',
    audition:
      "Good. Now we've got a target. One clean rep, then another. Make me work to stay ahead of you.",
  },
  selah: {
    id: 'selah',
    voice: 'coral',
    accent: 'natural',
    pace: 0.88,
    warmth: 5,
    energy: 1,
    expressiveness: 3,
    updatedAt: CREATED_AT,
    direction:
      'Gentle, clear, unhurried, and spiritually grounded. Conviction without performance or pressure.',
    audition:
      'Be still for one breath. You do not need a polished answer; only enough honesty to choose the next faithful step.',
  },
  cipher: {
    id: 'cipher',
    voice: 'ash',
    accent: 'natural',
    pace: 1.08,
    warmth: 2,
    energy: 3,
    expressiveness: 2,
    updatedAt: CREATED_AT,
    direction:
      'Quick, crisp, precise, and quietly amused. Confidence comes from clarity rather than volume.',
    audition:
      'The problem is not motivation. It is ambiguity. Name the deliverable, remove one constraint, and begin before the plan becomes decorative.',
  },
  haven: {
    id: 'haven',
    voice: 'onyx',
    accent: 'natural',
    pace: 0.86,
    warmth: 4,
    energy: 1,
    expressiveness: 2,
    updatedAt: CREATED_AT,
    direction:
      'Quiet, deep, protective, and spacious, with understated deadpan humor and no parental edge.',
    audition:
      'You are allowed to recover before the damage becomes impressive. Protect tonight, then we build the return properly.',
  },
  ember: {
    id: 'ember',
    voice: 'nova',
    accent: 'natural',
    pace: 1.1,
    warmth: 2,
    energy: 5,
    expressiveness: 5,
    updatedAt: CREATED_AT,
    direction:
      'Hard-edged, clipped, and forceful. The heat attacks the obstacle, never the Hunter, and loyalty remains audible underneath.',
    audition:
      "Nope. The spiral doesn't get the whole day. Shoes on, one minute of motion, and then it can file a complaint with me.",
  },
  mira: {
    id: 'mira',
    voice: 'shimmer',
    accent: 'natural',
    pace: 0.9,
    warmth: 4,
    energy: 2,
    expressiveness: 3,
    updatedAt: CREATED_AT,
    direction:
      'Breath-centered, smooth, serene, and exacting. Calm should sound embodied rather than sleepy.',
    audition:
      'Lengthen through the crown, soften the jaw, and let the exhale make room. Control first; range will follow.',
  },
  amara: {
    id: 'amara',
    voice: 'alloy',
    accent: 'natural',
    pace: 1.02,
    warmth: 5,
    energy: 4,
    expressiveness: 5,
    updatedAt: CREATED_AT,
    direction:
      'Warm, expressive, bold, and emotionally present. Direct without losing tenderness or humor.',
    audition:
      'Say the honest version. Not the impressive one. Connection starts when somebody finally stops performing safety.',
  },
  cassian: {
    id: 'cassian',
    voice: 'echo',
    accent: 'natural',
    pace: 0.94,
    warmth: 2,
    energy: 2,
    expressiveness: 3,
    updatedAt: CREATED_AT,
    direction:
      'Polished, controlled, quietly intimidating, and dryly funny, as if the numbers have already testified.',
    audition:
      'The ledger is not angry. It is merely observant. Give every dollar a duty before convenience volunteers it for something else.',
  },
  saffron: {
    id: 'saffron',
    voice: 'ballad',
    accent: 'natural',
    pace: 1.12,
    warmth: 4,
    energy: 5,
    expressiveness: 5,
    updatedAt: CREATED_AT,
    direction:
      'Rapid, vibrant, high-pressure, and theatrical, with unmistakable affection beneath every culinary emergency.',
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
    pace: profile.pace,
    warmth: profile.warmth,
    energy: profile.energy,
    expressiveness: profile.expressiveness,
    updatedAt: profile.updatedAt,
  };
}
