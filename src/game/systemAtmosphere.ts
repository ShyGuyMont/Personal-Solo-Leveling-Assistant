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
};

export function getAtmosphereProfile(theme: ColorTheme): AtmosphereProfile {
  return PROFILES[theme];
}
