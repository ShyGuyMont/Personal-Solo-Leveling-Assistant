export const APP_VERSION = '4.0.0';
export const DATABASE_SCHEMA_VERSION = 11;
export const SAVE_FORMAT_VERSION = 11;

export interface ReleaseSection {
  title: string;
  detail: string;
  points: string[];
}

export const RELEASE_SECTIONS: ReleaseSection[] = [
  {
    title: 'The Scripture Sanctuary',
    detail: 'The Bible mission now opens a private, guided spiritual-formation space.',
    points: [
      'Choose what feels most present from twelve concerns, then receive a rotating three-passage path with context, observation, application, and prayer prompts.',
      'Snow opens and closes the space, Selah guides Scripture, and the companion who understands the selected struggle adds focused counsel.',
      'A four-movement prayer framework supports deeper prayer while every reflection, prayer note, and next action remains optional and private.',
    ],
  },
  {
    title: 'Stronghold Protocol',
    detail: 'Immediate support is available when an urge or emotion is already loud.',
    points: [
      'Stronghold sessions combine practical pattern interruption, targeted Scripture, a ten-minute next action, and an invitation toward safe human connection.',
      'Pornography support can explicitly address loneliness and counterfeit intimacy without excusing the behavior or using shame as the recovery strategy.',
      'Stronghold sessions are unlimited and award no XP, so support never becomes a reward exploit or a reason to avoid returning.',
    ],
  },
  {
    title: 'Ninety-Six Passage Paths',
    detail: 'A broad offline reference library keeps guidance useful without copying a whole Bible.',
    points: [
      'Eight paths each support sexual integrity, shame, anger, sadness, loneliness, stress, numbness, focus, doubt, forgiveness, identity, and gratitude.',
      'The least-used passages rotate first, and connected concerns can be paired so the session addresses both the visible struggle and what may be beneath it.',
      'The app provides references and original guidance; the user reads the passage in their own preferred Bible translation.',
    ],
  },
  {
    title: 'Archive Shield 11',
    detail: 'Sanctuary history joins the portable, update-safe local campaign save.',
    points: [
      'Save format 11 preserves completed Sanctuary sessions, selected concerns, passage paths, optional reflections, prayer notes, outcomes, and Bible-mission credit.',
      'Version 3.5 and older saves migrate forward automatically without replacing Training Hall, Treasury, companion, progression, or mission history.',
      'The Sanctuary is a faith and reflection tool, not clinical or crisis care; its help text clearly encourages trusted and professional human support when needed.',
    ],
  },
];
