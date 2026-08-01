import { create } from 'zustand';
import { db } from '@/db/database';
import { ensureCoreData, initializeProfile as seedProfile } from '@/db/seed';
import { getEmergencyQuest } from '@/config/dailyEvents';
import {
  acknowledgeCompanionReaction,
  getNextCompanionReaction,
  queueLockInIfNeeded,
  queueCompanionReaction,
} from '@/game/companions';
import {
  acknowledgeCampfireRecap,
  ensureWeeklyCampfireRecap,
  getNextCampfireRecap,
} from '@/game/campfire';
import { acknowledgePartyBanter, getNextPartyBanter, queuePartyBanter } from '@/game/banter';
import {
  activateDailyEvent,
  claimMissionPass,
  completeEmergencyQuest,
  declineDailyEvent,
  ensureDailyEvent,
  consumeMissionPass,
} from '@/game/dailyEvents';
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
import { STAT_LABELS } from '@/utils/format';
import type {
  DailyReview,
  Focus,
  GameSnapshot,
  LocalDateKey,
  MissionDetails,
  MissionStatus,
  Settings,
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
  activateEvent: () => Promise<void>;
  declineEvent: () => Promise<void>;
  claimPass: () => Promise<void>;
  completeEvent: () => Promise<void>;
  applyMissionPass: (missionId: string, date?: LocalDateKey) => Promise<void>;
  dismissCompanionReaction: () => Promise<void>;
  dismissPartyBanter: () => Promise<void>;
  dismissCampfireRecap: () => Promise<void>;
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
  inventory: [],
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
    dailyEvent,
    inventory,
    companionReaction,
    partyBanter,
    campfireRecap,
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
    db.dailyEvents.get(systemDate),
    db.inventory.toArray(),
    getNextCompanionReaction(),
    getNextPartyBanter(),
    getNextCampfireRecap(),
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
    dailyEvent,
    inventory,
    companionReaction,
    partyBanter,
    campfireRecap,
    systemDate,
  };
}

async function prepareDailySystems(settings: Settings) {
  const date = getSystemDateKey(new Date(), settings.resetTime, settings.timeZone);
  await ensureDailyEvent(date);
  await ensureWeeklyCampfireRecap(date, settings.weekStartsOn);
  await queueLockInIfNeeded(date);
  if (settings.firstDayGuideCompleted) {
    await queueCompanionReaction({
      trigger: 'daily-briefing',
      sourceId: `daily-briefing:${date}`,
      companionId: 'snow',
    });
  }
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...EMPTY_SNAPSHOT,
  loading: true,
  async load() {
    set({ loading: true, error: undefined });
    try {
      await ensureCoreData();
      await initializeSystemCycle();
      const settings = await db.settings.get('primary');
      if (settings) {
        await prepareDailySystems(settings);
      }
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
      const settings = await db.settings.get('primary');
      if (settings) {
        await prepareDailySystems(settings);
      }
      set({ ...(await readSnapshot()), error: undefined });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'System refresh failed.' });
    }
  },
  async initializeProfile(input) {
    try {
      await seedProfile(input);
      await initializeSystemCycle();
      const settings = await db.settings.get('primary');
      if (settings) {
        await prepareDailySystems(settings);
      }
      set({ ...(await readSnapshot()), error: undefined });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Initialization failed.' });
      throw error;
    }
  },
  async complete(missionId, details, date) {
    try {
      const mission = get().missions.find((item) => item.id === missionId);
      const previousStats = get().stats;
      const previousRank = get().progression?.rank;
      const result = await completeMission({
        date: date ?? get().systemDate,
        missionId,
        details,
        systemDate: get().systemDate,
      });
      let snapshot = await readSnapshot();
      const leveledStats = snapshot.stats.filter((stat) => {
        const before = previousStats.find((item) => item.id === stat.id);
        return before && stat.level > before.level;
      });
      for (const stat of leveledStats) {
        await queueCompanionReaction({
          trigger: 'stat-level',
          sourceId: `mission:${date ?? get().systemDate}:${missionId}:${stat.id}:${stat.level}`,
          stat: stat.id,
          statLabel: STAT_LABELS[stat.id],
          level: stat.level,
        });
      }
      if (snapshot.progression?.rank !== previousRank) {
        await queueCompanionReaction({
          trigger: 'rank-up',
          sourceId: `rank:${snapshot.progression?.rank}:${snapshot.progression?.lastRankUpAt ?? ''}`,
          companionId: 'snow',
        });
      } else if (!leveledStats.length && mission) {
        await queueCompanionReaction({
          trigger: 'mission',
          sourceId: `mission:${date ?? get().systemDate}:${missionId}`,
          category: mission.category,
        });
      }
      if (mission) {
        await queuePartyBanter({
          date: date ?? get().systemDate,
          sourceId: `mission:${date ?? get().systemDate}:${missionId}`,
          category: mission.category,
        });
      }
      snapshot = await readSnapshot();
      set({
        ...snapshot,
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
  async activateEvent() {
    try {
      await activateDailyEvent(get().systemDate);
      set({ ...(await readSnapshot()), error: undefined });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'The event could not be activated.' });
      throw error;
    }
  },
  async declineEvent() {
    await declineDailyEvent(get().systemDate);
    set({ ...(await readSnapshot()), error: undefined });
  },
  async claimPass() {
    try {
      await claimMissionPass(get().systemDate);
      await queueCompanionReaction({
        trigger: 'mission-pass',
        sourceId: `mission-pass:${get().systemDate}`,
        companionId: 'snow',
      });
      set({ ...(await readSnapshot()), error: undefined });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'The Mission Pass could not be claimed.' });
      throw error;
    }
  },
  async completeEvent() {
    try {
      const previousStats = get().stats;
      const event = get().dailyEvent;
      const result = await completeEmergencyQuest(get().systemDate);
      let snapshot = await readSnapshot();
      const leveledStats = snapshot.stats.filter((stat) => {
        const before = previousStats.find((item) => item.id === stat.id);
        return before && stat.level > before.level;
      });
      for (const stat of leveledStats) {
        await queueCompanionReaction({
          trigger: 'stat-level',
          sourceId: `daily-event:${get().systemDate}:${stat.id}:${stat.level}`,
          stat: stat.id,
          statLabel: STAT_LABELS[stat.id],
          level: stat.level,
        });
      }
      const template = getEmergencyQuest(event?.templateId);
      await queueCompanionReaction({
        trigger: 'rare-event',
        sourceId: `daily-event:${get().systemDate}:${event?.templateId ?? 'rare'}`,
        companionId: template?.companionId,
      });
      snapshot = await readSnapshot();
      set({
        ...snapshot,
        rewardNotice: {
          missionName: event?.title ?? 'Emergency Quest',
          accountXp: result.awardedXp,
          levelsGained: result.levelsGained,
        },
        error: undefined,
      });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'The event could not be completed.' });
      throw error;
    }
  },
  async applyMissionPass(missionId, date) {
    try {
      await consumeMissionPass(date ?? get().systemDate, missionId);
      set({ ...(await readSnapshot()), error: undefined });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'The Mission Pass could not be used.' });
      throw error;
    }
  },
  async dismissCompanionReaction() {
    const reaction = get().companionReaction;
    if (!reaction) return;
    await acknowledgeCompanionReaction(reaction.id);
    set({ companionReaction: await getNextCompanionReaction() });
  },
  async dismissPartyBanter() {
    const banter = get().partyBanter;
    if (!banter) return;
    await acknowledgePartyBanter(banter.id);
    set({ partyBanter: await getNextPartyBanter() });
  },
  async dismissCampfireRecap() {
    const recap = get().campfireRecap;
    if (!recap) return;
    await acknowledgeCampfireRecap(recap.id);
    set({ ...(await readSnapshot()), error: undefined });
  },
  clearRewardNotice() {
    set({ rewardNotice: undefined });
  },
  clearError() {
    set({ error: undefined });
  },
}));
