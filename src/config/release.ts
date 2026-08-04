export const APP_VERSION = '3.5.0';
export const DATABASE_SCHEMA_VERSION = 10;
export const SAVE_FORMAT_VERSION = 10;

export interface ReleaseSection {
  title: string;
  detail: string;
  points: string[];
}

export const RELEASE_SECTIONS: ReleaseSection[] = [
  {
    title: 'The Training Hall',
    detail: 'Rook and Ember now command a complete phone-first training system.',
    points: [
      'Choose Home, Gym, Conditioning, or Recovery; every completed path clears the single Daily Workout mission exactly once.',
      'Home training contains four full-body circuit protocols, a saved Rook assignment, Ember’s weighted 15–30 minute clock, one reassignment, and optional five-minute Boss overtime.',
      'Timers survive leaving the screen, rounds and partial reps remain saved, adjustable-dumbbell loads can be recorded, and the entire party joins the post-training recovery scene.',
    ],
  },
  {
    title: 'Physical Mission Consolidation',
    detail: 'Daily Movement has been retired without lowering the physical path’s value.',
    points: [
      'Daily Workout now contains the combined account and stat rewards that Movement and Workout previously awarded together.',
      'Existing history remains intact, current briefing references migrate safely, and physical challenges now point to Training Hall deployments.',
      'Gym, conditioning, recovery, and home circuits are alternate ways to clear one mission—not repeatable sources of extra XP.',
    ],
  },
  {
    title: 'Progression Rebalance',
    detail: 'Rank pacing now respects the larger mission and companion ecosystem.',
    points: [
      'Rank requirements and mandatory trial durations were rebuilt around an achievable 18–24 month World Class progression instead of a distant multi-year extreme.',
      'Snow’s Daily Command remains the major consistency multiplier: Low is 1×, Steady is 1.5× or 1.75× on a Full Clear, and High is 2× or 2.5× on a Full Clear.',
      'Mission, Perfect Day, challenge, questline, Treasury, and rare-event rewards retain separate one-time transaction protection.',
    ],
  },
  {
    title: 'Archive Shield 10',
    detail: 'Training records join the portable, update-safe campaign save.',
    points: [
      'Save format 10 preserves Training Hall assignments, timers, completed sessions, rounds, loads, effort, and private notes.',
      'Version 3.0 and older saves migrate forward automatically without replacing existing campaign, companion, Treasury, or mission history.',
      'The Update Center continues to install new releases without deleting the home-screen app or its local progression data.',
    ],
  },
];
