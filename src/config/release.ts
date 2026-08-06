export const APP_VERSION = '6.0.2';
export const DATABASE_SCHEMA_VERSION = 12;
export const SAVE_FORMAT_VERSION = 12;

export interface ReleaseSection {
  title: string;
  detail: string;
  points: string[];
}

export const RELEASE_SECTIONS: ReleaseSection[] = [
  {
    title: 'Version 6.0.2 · Party Pulse',
    detail:
      'Companions now notice neglected paths in character, section exits are clearer, and Saffron gains six new orders.',
    points: [
      'Party Pulse watches finalized stat neglect without creating a penalty: the matching specialist responds in their own voice, explains the signal, and offers one direct route back into motion.',
      'Quiet, Balanced, Talkative, Off, Reduced Motion, and individual companion controls remain authoritative; a broader slip can call Ember into a shame-free re-entry signal while Snow protects the whole journey.',
      'Long Training Hall and Scripture Sanctuary flows now keep an explicit route back to their own command screen, while the complete section audit confirms persistent tabs, close controls, and return routes everywhere else.',
      'Saffron’s grimoire expands from twelve to eighteen no-bean, no-pea recipes with new fish, turkey, chicken, beef, shrimp, egg, freezer, safety, substitution, and leftover guidance.',
    ],
  },
  {
    title: 'Version 6.0.1 · System Optimization',
    detail: 'The living interface is steadier on mobile and gains two complete color protocols.',
    points: [
      'The bottom command bar is now isolated from the scrolling app canvas and anchored directly to the mobile viewport, preventing it from drifting into the middle of the screen.',
      'Blood Moon adds an obsidian, crimson, and antique-gold command atmosphere; Frostbound adds midnight, glacial blue, and silver-violet energy.',
      'Touch interactions, reduced-motion behavior, mobile atmosphere layers, and fixed interface compositing are tightened without changing campaign data or progression rules.',
    ],
  },
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
