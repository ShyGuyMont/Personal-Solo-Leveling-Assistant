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
    title: 'The Living Headquarters',
    detail: 'The dashboard is now the command chamber at the center of the entire campaign.',
    points: [
      'A central Ascension Core, current Class signal, live Snow transmission, level path, daily completion, streak, and System state now share one responsive command stage.',
      'The former destination stack is now an eight-realm tactical map with live Training, Sanctuary, Kitchen, Treasury, Party, Campaign, progression, and Archive signals.',
      'The Headquarters reacts to Class readiness, active trials, recovery, momentum, offline use, and recent ascension instead of remaining visually static.',
    ],
  },
  {
    title: 'A System That Stays Alive',
    detail: 'Essential campaign awareness now follows the player between every destination.',
    points: [
      'A persistent live HUD shows System condition, daily synchronization, the next pending directive, current level, and connected realm without hiding routine controls.',
      'The global atmosphere changes with the player’s local dawn, day, dusk, or night and carries a separate signal for trials, recovery, stagnation, and advancement readiness.',
      'System and Clean interface styles remain complete experiences, and saved Reduced Motion now directly suppresses portal travel and ambient animation.',
    ],
  },
  {
    title: 'Companions Beyond Cards',
    detail: 'The companion responsible for each realm now remains visibly connected to the player.',
    points: [
      'Snow, Rook, Selah, Saffron, Cassian, Cipher, and Haven automatically establish the appropriate companion link as the player moves through their realms.',
      'The expandable transmission carries authored, purpose-specific guidance and a direct action without changing XP, decisions, or saved campaign data.',
      'Companion frequency and individual companion controls are still honored; muting the party or a specialist removes their persistent presence cleanly.',
    ],
  },
  {
    title: 'Dimensional Travel & Ascension',
    detail:
      'Important movement and breakthroughs now feel like events instead of ordinary page changes.',
    points: [
      'Every major route opens through a short realm-colored portal sequence that yields immediately to the destination and never blocks input afterward.',
      'Class advancement overlays now awaken a Class-colored Ascension Gate and present the new emblem as a genuine chapter transition.',
      'Subtle, Standard, and Intense immersion settings control the experience, while Clean mode and Reduced Motion remove cinematic layers.',
    ],
  },
  {
    title: 'The Complete Class System',
    detail: 'F-Class through World Class now has one consistent identity across the entire app.',
    points: [
      'The dashboard, live HUD, Status record, tactical map, Class Trials, celebrations, achievements, history, help, and companion dialogue share the same classification language.',
      'Every Class carries a distinct visual energy signature, with advancement readiness surfaced as a live System condition.',
      'No database migration is required. The established progression engine, offline behavior, privacy model, and every existing save remain fully compatible.',
    ],
  },
];
