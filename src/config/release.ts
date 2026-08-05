export const APP_VERSION = '5.0.0';
export const DATABASE_SCHEMA_VERSION = 12;
export const SAVE_FORMAT_VERSION = 12;

export interface ReleaseSection {
  title: string;
  detail: string;
  points: string[];
}

export const RELEASE_SECTIONS: ReleaseSection[] = [
  {
    title: 'Toji Ascension Gym',
    detail: 'Gym Deployment is now a complete progressive resistance-training program.',
    points: [
      'Vanguard Frame, Iron Citadel, and Shadow Hunter form the three-day foundation; Heavenly Restriction is an optional fourth specialization day.',
      'Rook recommends the session that has waited longest while substitutions, every working set, load, reps, rest, effort, and optional finisher remain under your control.',
      'Previous performance becomes the next target, top-of-range sets trigger a small-increase prompt, and new volume records are called out after the session.',
    ],
  },
  {
    title: 'Double Deployment',
    detail: 'Home circuits remain available even after a full gym session.',
    points: [
      'Completing one Gym Deployment and one Home Circuit on the same System day awards one fixed +150 XP Ascension Surge plus Strength, Endurance, Discipline, and Vitality XP.',
      'The Daily Workout mission still pays only once, and the surge is never multiplied by Snow’s Daily Command.',
      'Stable transaction keys prevent duplicate rewards after repeated taps, reloads, updates, or save imports.',
    ],
  },
  {
    title: 'Saffron and the Kitchen',
    detail: 'The ninth companion turns cooking into Provision Command.',
    points: [
      'Saffron, The Flame Chef, brings a complete chibi portrait, emotional check-ins, direct support, banter, milestones, Campfires, Councils, training debriefs, and a five-chapter questline.',
      'Twelve no-bean, no-pea recipes rotate away from recent meals and include ingredients, guided steps, substitutions, leftovers, and food-safety checkpoints.',
      'One daily ingredient swap and no-penalty decline keep the system honest; the first three completed orders each week award 40 account XP plus Stewardship, Vitality, and Discipline.',
    ],
  },
  {
    title: 'Archive Shield 12',
    detail: 'Every new workout and Kitchen fact joins the update-safe local campaign save.',
    points: [
      'Save format 12 preserves multiple same-day training sessions, gym set logs, substitutions, progression prompts, personal records, Kitchen orders, checklists, ratings, and private notes.',
      'Version 4.0 and older saves migrate forward automatically, enable Saffron, and preserve every existing mission, companion, Treasury, Sanctuary, and progression record.',
      'Snow’s offline help now explains structured gym progression, Double Deployment scoring, Saffron’s weekly reward cap, and the complete nine-companion party.',
    ],
  },
];
