import { create } from 'zustand';
import { db } from '@/db/database';
import { ensureCoreData, initializeProfile as seedProfile } from '@/db/seed';
import {
  activateBossChallenge,
  activateRankTrial,
  completeMission,
  excuseMission,
  finalizeDailyReview,
  getPendingReview,
  initializeSystemCycle,
  setMissionStatus,
  undoMission,
  updateMissionDetails,
} from '@/game/engine';
import { getSystemDateKey } from '@/utils/date';
import type {
  DailyReview,
  Focus,
  GameSnapshot,
  LocalDateKey,
  MissionDetails,
  MissionStatus,
} from '@/types/game';

type RewardNotice = {
  missionName: string;
  accountXp: number;
  levelsGained: number;
};

interface GameStore extends GameSnapshot {
  loading: boolean;
  error?: string;
  rewardNotice?: RewardNotice;
  load: () => Promise<void>;
  refresh: () => Promise<void>;
  initializeProfile: (input: {
    displayName: string;
    systemTitle?: string;
    resetTime: string;
    focus: Focus;
    soundEnabled: boolean;
    reducedMotion: boolean;
  }) => Promise<void>;
  complete: (missionId: string, details?: MissionDetails, date?: LocalDateKey) => Promise<void>;
  saveDetails: (missionId: string, details: MissionDetails) => Promise<void>;
  updateStatus: (
    missionId: string,
    status: Exclude<MissionStatus, 'completed'>,
    details?: MissionDetails,
    date?: LocalDateKey,
  ) => Promise<void>;
  excuse: (missionId: string, protectedException: boolean, date?: LocalDateKey) => Promise<void>;
  undo: (missionId: string, date?: LocalDateKey) => Promise<void>;
  finalizeReview: (date: LocalDateKey) => Promise<DailyReview>;
  startBoss: (templateId: string) => Promise<void>;
  startTrial: (templateId: string) => Promise<void>;
  clearRewardNotice: () => void;
  clearError: () => void;
}

const EMPTY_SNAPSHOT: GameSnapshot = {
  missions: [],
  todayRecords: [],
  stats: [],
  challenges: [],
  titles: [],
  streaks: [],
  systemDate: '1970-01-01',
};

async function readSnapshot(): Promise<GameSnapshot> {
  const settings = await db.settings.get('primary');
  const systemDate = settings
    ? getSystemDateKey(new Date(), settings.resetTime, settings.timeZone)
    : (new Date().toISOString().slice(0, 10) as LocalDateKey);
  const [
    profile,
    missions,
    todayRecords,
    pendingReview,
    progression,
    stats,
    challenges,
    titles,
    streaks,
  ] = await Promise.all([
    db.profiles.get('primary'),
    db.missions.toArray(),
    db.dailyMissions.where('date').equals(systemDate).toArray(),
    getPendingReview(),
    db.progression.get('primary'),
    db.stats.toArray(),
    db.challengeProgress.toArray(),
    db.titles.toArray(),
    db.streaks.toArray(),
  ]);
  return {
    profile,
    settings,
    missions,
    todayRecords,
    pendingReview,
    progression,
    stats,
    challenges,
    titles,
    streaks,
    systemDate,
  };
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...EMPTY_SNAPSHOT,
  loading: true,
  async load() {
    set({ loading: true, error: undefined });
    try {
      await ensureCoreData();
      await initializeSystemCycle();
      set({ ...(await readSnapshot()), loading: false });
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'System initialization failed.',
      });
    }
  },
  async refresh() {
    try {
      await initializeSystemCycle();
      set({ ...(await readSnapshot()), error: undefined });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'System refresh failed.' });
    }
  },
  async initializeProfile(input) {
    try {
      await seedProfile(input);
      await initializeSystemCycle();
      set({ ...(await readSnapshot()), error: undefined });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Initialization failed.' });
      throw error;
    }
  },
  async complete(missionId, details, date) {
    try {
      const mission = get().missions.find((item) => item.id === missionId);
      const result = await completeMission({
        date: date ?? get().systemDate,
        missionId,
        details,
        systemDate: get().systemDate,
      });
      set({
        ...(await readSnapshot()),
        rewardNotice: {
          missionName: mission?.name ?? 'Mission',
          accountXp: result.awardedXp,
          levelsGained: result.levelsGained,
        },
        error: undefined,
      });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Mission completion failed.' });
      throw error;
    }
  },
  async saveDetails(missionId, details) {
    try {
      await updateMissionDetails(get().systemDate, missionId, details);
      set({ ...(await readSnapshot()), error: undefined });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Mission details could not be saved.',
      });
    }
  },
  async updateStatus(missionId, status, details, date) {
    try {
      await setMissionStatus({
        date: date ?? get().systemDate,
        missionId,
        status,
        details,
      });
      set({ ...(await readSnapshot()), error: undefined });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Mission status could not be changed.',
      });
      throw error;
    }
  },
  async excuse(missionId, protectedException, date) {
    try {
      await excuseMission(date ?? get().systemDate, missionId, protectedException);
      set({ ...(await readSnapshot()), error: undefined });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Mission could not be excused.' });
      throw error;
    }
  },
  async undo(missionId, date) {
    try {
      await undoMission(date ?? get().systemDate, missionId);
      set({ ...(await readSnapshot()), error: undefined });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Mission could not be undone.' });
      throw error;
    }
  },
  async finalizeReview(date) {
    try {
      const review = await finalizeDailyReview(date, get().systemDate);
      set({ error: undefined });
      return review;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Review could not be finalized.' });
      throw error;
    }
  },
  async startBoss(templateId) {
    try {
      await activateBossChallenge(templateId, get().systemDate);
      set({ ...(await readSnapshot()), error: undefined });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Boss Challenge could not begin.' });
      throw error;
    }
  },
  async startTrial(templateId) {
    try {
      await activateRankTrial(templateId, get().systemDate);
      set({ ...(await readSnapshot()), error: undefined });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Rank Trial could not begin.' });
      throw error;
    }
  },
  clearRewardNotice() {
    set({ rewardNotice: undefined });
  },
  clearError() {
    set({ error: undefined });
  },
}));
