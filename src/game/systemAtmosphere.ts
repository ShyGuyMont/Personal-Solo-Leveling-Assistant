import type { ColorTheme } from '@/types/game';

export type AtmosphereParticleKind = 'mote' | 'ember' | 'crystal' | 'snow';

export interface AtmosphereProfile {
  kind: AtmosphereParticleKind;
  primary: string;
  secondary: string;
  glow: string;
}

const PROFILES: Record<ColorTheme, AtmosphereProfile> = {
  abyss: {
    kind: 'mote',
    primary: '#63f5d2',
    secondary: '#a98cff',
    glow: 'rgba(99, 245, 210, 0.42)',
  },
  daybreak: {
    kind: 'mote',
    primary: '#e4ae00',
    secondary: '#29486a',
    glow: 'rgba(228, 174, 0, 0.32)',
  },
  bloodmoon: {
    kind: 'ember',
    primary: '#ff675f',
    secondary: '#d7a95d',
    glow: 'rgba(255, 82, 73, 0.46)',
  },
  frostbound: {
    kind: 'crystal',
    primary: '#79ddff',
    secondary: '#b4a7ff',
    glow: 'rgba(93, 211, 255, 0.42)',
  },
  'winter-crown': {
    kind: 'snow',
    primary: '#ffffff',
    secondary: '#65cfff',
    glow: 'rgba(83, 196, 246, 0.38)',
  },
  'verdant-nexus': {
    kind: 'mote',
    primary: '#55f29b',
    secondary: '#d4ee62',
    glow: 'rgba(85, 242, 155, 0.44)',
  },
  'solar-warden': {
    kind: 'ember',
    primary: '#ffc857',
    secondary: '#fff2bd',
    glow: 'rgba(255, 190, 66, 0.48)',
  },
  'neon-revenant': {
    kind: 'crystal',
    primary: '#ff4fd8',
    secondary: '#48e7ff',
    glow: 'rgba(255, 79, 216, 0.46)',
  },
  'phantom-steel': {
    kind: 'crystal',
    primary: '#edf4f8',
    secondary: '#7e9db2',
    glow: 'rgba(191, 218, 232, 0.38)',
  },
};

export function getAtmosphereProfile(theme: ColorTheme): AtmosphereProfile {
  return PROFILES[theme];
}
