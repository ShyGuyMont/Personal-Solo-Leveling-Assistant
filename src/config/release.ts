export const APP_VERSION = '6.0.0';
export const DATABASE_SCHEMA_VERSION = 12;
export const SAVE_FORMAT_VERSION = 12;

export interface ReleaseSection {
  title: string;
  detail: string;
  points: string[];
}

export const RELEASE_SECTIONS: ReleaseSection[] = [
  {
    title: 'System Ascension Interface',
    detail: 'The complete app now inhabits one dimensional, route-aware command system.',
    points: [
      'Abyssal Hologram atmosphere, Command Chamber structure, and Living Companion Realm accents now work as one visual language.',
      'Layered gates, tactical depth planes, illuminated surfaces, responsive navigation, and tactile controls make the interface feel spatial without sacrificing clarity.',
      'Abyss and Daybreak remain distinct lighting palettes, while Clean mode and Reduced Motion preserve a calm, accessible alternative.',
    ],
  },
  {
    title: 'Class System',
    detail:
      'The long-term classification is now expressed consistently from F-Class to World Class.',
    points: [
      'The dashboard and Status record share a new animated Class emblem with a distinct energy signature for every classification.',
      'Class Trials, qualification, achievements, history, celebrations, companion dialogue, help, and save previews now use the same player-facing language.',
      'The proven internal progression model and every existing save remain compatible; this release changes presentation, not earned advancement.',
    ],
  },
  {
    title: 'Living Companion Realms',
    detail: 'Every major destination now carries the energy of the companions who guide it.',
    points: [
      'Training, Sanctuary, Kitchen, Treasury, Party, Campaign, Archive, and progression spaces each tune the global light, energy, and dimensional grid.',
      'Snow and the full party now appear inside richer portrait frames and companion-colored command surfaces.',
      'Mission cards, destination gates, major panels, and milestone overlays respond with deeper motion and lighting while remaining phone-first.',
    ],
  },
  {
    title: 'Ascension Without Compromise',
    detail: 'The visual upgrade respects privacy, accessibility, offline use, and the tested game.',
    points: [
      'No database migration is required, and Archive Shield 12 continues to protect the full campaign.',
      'Generated PWA preview output no longer enters source control or lint checks after local development.',
      'Selected onboarding preferences now announce their state correctly to assistive technology.',
    ],
  },
];
