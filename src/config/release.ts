export const APP_VERSION = '3.0.0';
export const DATABASE_SCHEMA_VERSION = 9;
export const SAVE_FORMAT_VERSION = 9;

export interface ReleaseSection {
  title: string;
  detail: string;
  points: string[];
}

export const RELEASE_SECTIONS: ReleaseSection[] = [
  {
    title: 'Treasury Command',
    detail: 'Money management now has a private, phone-first command center of its own.',
    points: [
      'Log paychecks, expenses, eating-out purchases, recurring bills, debt balances and payments, and savings goals without linking a bank.',
      'Plan spending, dining, savings, and debt targets, then complete a fact-based Weekly Review for fixed XP and Stewardship progress.',
      'Budget Stability is a visible coaching signal only; it never changes core XP, rank, streaks, or mission results.',
    ],
  },
  {
    title: 'Cassian · The Steward',
    detail:
      'The eighth companion joins as a calm, exacting guide for clarity, margin, and recovery.',
    points: [
      'Cassian has full dialogue across check-ins, Direct Support, milestones, mission banter, Campfires, Councils, and Treasury events.',
      'His five-chapter questline contains 15 objectives and unlocks the legendary Keeper of Margin title.',
      'A 75% daily roll can open No Eating Out for bonus XP; failure removes no account XP and opens a practical recovery debrief.',
    ],
  },
  {
    title: 'Campaign Command',
    detail: 'Long-range goals now have structure without becoming another punishment system.',
    points: [
      'Campaign Arcs with purpose, companion guidance, target dates, milestones, pause, completion, and archive states.',
      'Snow’s Daily Command now locks a fair morning target: Low protects continuity, Steady rewards 65% completion, High rewards 80%, and Full Clears earn the strongest multipliers.',
      'A dedicated Update Center shows the installed version, checks for releases, and keeps backup controls close.',
    ],
  },
  {
    title: 'Companion Questlines',
    detail: 'Every party member now has a complete personal five-chapter campaign.',
    points: [
      'Eight questlines, 40 authored chapters, and 120 tracked or reflective objectives.',
      'Only one questline is active at a time; pause and resume freely with no failure timer or decay.',
      'Each completed questline unlocks a unique legendary title and deeper companion story.',
    ],
  },
  {
    title: 'Amara · The Heartweaver',
    detail:
      'The seventh companion joins the party as the guide for empathy, relationships, and belonging.',
    points: [
      'Amara appears across Party Chat, Direct Support, stat reactions, mission banter, Campfires, Councils, and Headquarters.',
      'Her guidance covers friendship, family, romance, communication, appreciation, repair, and healthy boundaries.',
      'No relationship objective requires unsafe contact; protected distance and self-respecting alternatives always count.',
    ],
  },
  {
    title: 'Monthly Councils',
    detail: 'The full party now closes each completed month together.',
    points: [
      'Nine fact-aware messages review mission balance, growth, recovery, connection, Treasury progress, campaigns, and quest chapters.',
      'Councils remain saved in Headquarters and the Archive, with space for one next-month intention.',
      'Council commentary never changes XP, rank, streaks, or hidden scoring.',
    ],
  },
  {
    title: 'Archive Shield',
    detail: 'The expanded campaign remains portable and update-safe.',
    points: [
      'Save format 9 preserves all Version 3.0 records—including the complete Treasury—and migrates older saves forward automatically.',
      'Import capacity increased to 32 MB with checksum verification, previews, and automatic pre-import recovery snapshots.',
      'Backup tests cover briefings, campaigns, milestones, quest progress, councils, both new companions, and Treasury records.',
    ],
  },
];
