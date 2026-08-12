import { describe, expect, it } from 'vitest';
import {
  BOSS_CHALLENGES,
  MONTHLY_CHALLENGES,
  RECOVERY_CHALLENGES,
  RANK_TRIALS,
  WEEKLY_CHALLENGES,
} from '@/config/challenges';
import { ACHIEVEMENTS } from '@/config/achievements';
import { COSMETICS } from '@/config/cosmetics';
import { SYSTEM_MESSAGE_COUNT } from '@/config/messages';
import { DEFAULT_MISSIONS } from '@/config/missions';
import { TITLE_LIBRARY } from '@/config/titles';

describe('required local content libraries', () => {
  it('contains every specified mission and campaign library size', () => {
    expect(DEFAULT_MISSIONS).toHaveLength(6);
    expect(WEEKLY_CHALLENGES.length).toBeGreaterThanOrEqual(30);
    expect(MONTHLY_CHALLENGES.length).toBeGreaterThanOrEqual(20);
    expect(BOSS_CHALLENGES).toHaveLength(6);
    expect(RECOVERY_CHALLENGES).toHaveLength(10);
    expect(RANK_TRIALS).toHaveLength(7);
    expect(ACHIEVEMENTS.length).toBeGreaterThanOrEqual(50);
    expect(COSMETICS.length).toBeGreaterThanOrEqual(10);
  });

  it('contains the required original messaging and title depth', () => {
    expect(SYSTEM_MESSAGE_COUNT).toBeGreaterThanOrEqual(50);
    expect(TITLE_LIBRARY.length).toBeGreaterThanOrEqual(40);
  });

  it('pays optional challenges at the boosted rate without changing mandatory Class Trials', () => {
    expect(WEEKLY_CHALLENGES.find((challenge) => challenge.id === 'w-faith-10')?.accountXp).toBe(
      255,
    );
    expect(MONTHLY_CHALLENGES.find((challenge) => challenge.id === 'm-workout-12')?.accountXp).toBe(
      750,
    );
    expect(BOSS_CHALLENGES.find((challenge) => challenge.id === 'boss-awakening')?.accountXp).toBe(
      675,
    );
    expect(RECOVERY_CHALLENGES[0].accountXp).toBe(30);
    expect(RECOVERY_CHALLENGES[0].statRewards[0].xp).toBe(8);
    expect(RANK_TRIALS.find((challenge) => challenge.id === 'trial-e')?.accountXp).toBe(500);
  });
});
