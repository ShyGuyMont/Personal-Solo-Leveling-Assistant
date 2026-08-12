import { RANK_ORDER, RANK_REQUIREMENTS } from '@/config/balance';
import { db } from '@/db/database';
import { getRelevantApprovedMemories } from '@/game/aiHeadquarters';
import { calculateRankQualification } from '@/game/rank';
import { buildQuickLinkActionCatalog } from '@/game/aiQuickLink';
import { getCustomKitchenRecipes } from '@/game/kitchenGrimoire';
import { resolveKitchenSessionRecipe } from '@/game/kitchen';
import { accountXpForLevel, totalXpAtLevel } from '@/game/xp';
import type { AiProgressContext } from '@/services/aiHeadquarters';
import type {
  AccountProgression,
  AiConversationAudience,
  ChallengeProgress,
  CompanionId,
  DailyMissionRecord,
  LocalDateKey,
  MissionDefinition,
  Profile,
  Settings,
  StatProgress,
} from '@/types/game';
import { addDays } from '@/utils/date';

export interface AiContextSource {
  audience: AiConversationAudience;
  profile: Profile;
  settings: Settings;
  progression: AccountProgression;
  missions: MissionDefinition[];
  todayRecords: DailyMissionRecord[];
  stats: StatProgress[];
  challenges: ChallengeProgress[];
  systemDate: LocalDateKey;
  enabledCompanionIds: Settings['enabledCompanionIds'];
}

function roundedAverage(total: number, divisor: number) {
  if (!divisor) return 0;
  return Number((total / divisor).toFixed(1));
}

function remaining(current: number, target: number) {
  return Math.max(0, target - current);
}

function sumBy<T>(items: T[], value: (item: T) => number) {
  return items.reduce((total, item) => total + value(item), 0);
}

function directorNote(value: string | undefined) {
  return (value ?? '').trim().slice(0, 420);
}

export async function buildAiProgressContext(source: AiContextSource): Promise<AiProgressContext> {
  const recentStart = addDays(source.systemDate, -29);
  const treasurySharingAllowed =
    source.settings.aiTreasurySharingEnabled === true &&
    (source.audience === 'cassian' ||
      (source.audience === 'party' && source.enabledCompanionIds.includes('cassian')));
  const [
    reviews,
    recentMissions,
    xpTransactions,
    training,
    kitchen,
    sanctuary,
    memories,
    customRecipes,
    campaignArcs,
    arcMilestones,
    treasuryTransactions,
    treasuryWeeks,
    treasuryBills,
    treasuryDebts,
    treasurySavingsGoals,
    creatorSettings,
    creatorSnapshots,
    creatorProjects,
    creatorVideoInsights,
  ] = await Promise.all([
    db.dailyReviews.where('date').aboveOrEqual(recentStart).toArray(),
    db.dailyMissions.where('date').aboveOrEqual(recentStart).toArray(),
    db.xpTransactions.where('date').aboveOrEqual(recentStart).toArray(),
    db.trainingSessions.where('date').aboveOrEqual(recentStart).toArray(),
    db.kitchenSessions.where('date').aboveOrEqual(recentStart).toArray(),
    db.sanctuarySessions.where('date').aboveOrEqual(recentStart).toArray(),
    source.settings.aiRelationshipMemoryEnabled
      ? getRelevantApprovedMemories(source.audience, 12)
      : Promise.resolve([]),
    getCustomKitchenRecipes(),
    db.campaignArcs.toArray(),
    db.arcMilestones.toArray(),
    treasurySharingAllowed
      ? db.treasuryTransactions.where('date').aboveOrEqual(recentStart).toArray()
      : Promise.resolve([]),
    treasurySharingAllowed ? db.treasuryWeeks.toArray() : Promise.resolve([]),
    treasurySharingAllowed ? db.treasuryBills.toArray() : Promise.resolve([]),
    treasurySharingAllowed ? db.treasuryDebts.toArray() : Promise.resolve([]),
    treasurySharingAllowed ? db.treasurySavingsGoals.toArray() : Promise.resolve([]),
    db.creatorSettings.get('primary'),
    db.creatorSnapshots.orderBy('capturedAt').reverse().limit(30).toArray(),
    db.creatorProjects.orderBy('updatedAt').reverse().limit(30).toArray(),
    db.creatorVideoInsights.orderBy('views').reverse().limit(10).toArray(),
  ]);

  const available = source.missions.filter((mission) => mission.enabled && !mission.archived);
  const latestCreatorSnapshot =
    creatorSnapshots.find((snapshot) => snapshot.periodDays === 28) ?? creatorSnapshots[0];
  const commandCatalog = buildQuickLinkActionCatalog(source.missions, source.todayRecords);
  const todayKitchen = kitchen.find((session) => session.date === source.systemDate);
  const todayRecipe = resolveKitchenSessionRecipe(todayKitchen);
  const completedToday = new Set(
    source.todayRecords
      .filter((record) => record.status === 'completed')
      .map((record) => record.missionId),
  );
  const finalizedReviews = reviews.filter((review) => review.status === 'finalized');
  const completedRecentMissions = recentMissions.filter((record) => record.status === 'completed');
  const positiveXp = xpTransactions
    .filter((transaction) => transaction.amount > 0)
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const observedDays = Math.max(1, finalizedReviews.length);
  const averageXpPerCompletedDay = roundedAverage(positiveXp, observedDays);
  const averageMissionsPerCompletedDay = roundedAverage(
    completedRecentMissions.length,
    observedDays,
  );
  const completedChallenges = source.challenges.filter(
    (challenge) => challenge.status === 'completed',
  ).length;
  const discipline = source.stats.find((stat) => stat.id === 'discipline')?.level ?? 1;
  const qualification = calculateRankQualification(
    source.progression,
    source.stats,
    source.challenges,
  );
  const worldRequirement = RANK_REQUIREMENTS.find(
    (requirement) => requirement.rank === 'WORLD CLASS',
  )!;
  const worldLevelXp = totalXpAtLevel(worldRequirement.minimumLevel, accountXpForLevel);
  const worldBalancedStats = source.stats.filter(
    (stat) => stat.level >= worldRequirement.balancedStatLevel,
  ).length;
  const lowerBoundCandidates = [
    remaining(source.progression.completedDays, worldRequirement.completedDays),
  ];
  if (averageMissionsPerCompletedDay > 0) {
    lowerBoundCandidates.push(
      Math.ceil(
        remaining(
          source.progression.lifetimeMissionCompletions,
          worldRequirement.lifetimeCompletions,
        ) / averageMissionsPerCompletedDay,
      ),
    );
  }
  if (averageXpPerCompletedDay > 0) {
    lowerBoundCandidates.push(
      Math.ceil(remaining(source.progression.totalXp, worldLevelXp) / averageXpPerCompletedDay),
    );
  }
  const currentTreasuryWeek = treasuryWeeks.find(
    (week) => week.weekStart <= source.systemDate && week.weekEnd >= source.systemDate,
  );
  const currentWeekTransactions = currentTreasuryWeek
    ? treasuryTransactions.filter(
        (transaction) =>
          transaction.date >= currentTreasuryWeek.weekStart &&
          transaction.date <= currentTreasuryWeek.weekEnd,
      )
    : [];
  const activeDebts = treasuryDebts.filter((debt) => debt.active);
  const debtAprs = activeDebts
    .map((debt) => debt.aprBasisPoints)
    .filter((value): value is number => typeof value === 'number');

  return {
    hunter: {
      firstName: source.profile.displayName.trim().split(/\s+/)[0] || 'Hunter',
      systemTitle: source.profile.systemTitle,
      level: source.progression.level,
      class: source.progression.rank,
      startingFocus: source.profile.startingFocus,
    },
    today: {
      date: source.systemDate,
      completedMissions: available.filter((mission) => completedToday.has(mission.id)).length,
      availableMissions: available.length,
      pendingMissionNames: available
        .filter((mission) => !completedToday.has(mission.id))
        .slice(0, 12)
        .map((mission) => mission.name),
    },
    progression: {
      totalXp: source.progression.totalXp,
      currentLevelXp: source.progression.currentLevelXp,
      xpToNextLevel: source.progression.xpToNextLevel,
      lifetimeMissionCompletions: source.progression.lifetimeMissionCompletions,
      completedDays: source.progression.completedDays,
      perfectDays: source.progression.perfectDays,
      currentDayStreak: source.progression.currentDayStreak,
      currentPerfectStreak: source.progression.currentPerfectStreak,
      xpMultiplier: source.progression.xpMultiplier,
    },
    classification: {
      nextClass: qualification.targetRank,
      qualifiedForNextClass: qualification.qualified,
      trialStatus: qualification.trialStatus,
      nextRequirements: qualification.items.map((item) => ({
        label: item.label,
        current: item.current,
        target: item.target,
        remaining: remaining(item.current, item.target),
        met: item.met,
        display: item.display,
      })),
      roadmap: RANK_REQUIREMENTS.filter(
        (requirement) =>
          RANK_ORDER.indexOf(requirement.rank) > RANK_ORDER.indexOf(source.progression.rank),
      ).map((requirement) => ({
        class: requirement.rank,
        minimumLevel: requirement.minimumLevel,
        lifetimeCompletions: requirement.lifetimeCompletions,
        completedDays: requirement.completedDays,
        disciplineLevel: requirement.disciplineLevel,
        balancedStatLevel: requirement.balancedStatLevel,
        balancedStatsRequired: requirement.balancedStatsRequired,
        challengesCompleted: requirement.challengesCompleted,
        requiresTrial: Boolean(requirement.trialTemplateId),
      })),
      worldClass: {
        remainingLevels: remaining(source.progression.level, worldRequirement.minimumLevel),
        remainingXpToMinimumLevel: remaining(source.progression.totalXp, worldLevelXp),
        remainingMissionCompletions: remaining(
          source.progression.lifetimeMissionCompletions,
          worldRequirement.lifetimeCompletions,
        ),
        remainingCompletedDays: remaining(
          source.progression.completedDays,
          worldRequirement.completedDays,
        ),
        remainingDisciplineLevels: remaining(discipline, worldRequirement.disciplineLevel),
        remainingBalancedStats: remaining(
          worldBalancedStats,
          worldRequirement.balancedStatsRequired,
        ),
        remainingChallenges: remaining(completedChallenges, worldRequirement.challengesCompleted),
        lowerBoundCompletedDaysAtRecentPace: Math.max(...lowerBoundCandidates),
        forecastCaveat:
          'This is a lower-bound pace estimate. Every intermediate Class trial, stat requirement, challenge requirement, and completed-day gate must still be cleared.',
      },
    },
    recentThirtyDays: {
      finalizedDays: finalizedReviews.length,
      missionsCompleted: completedRecentMissions.length,
      xpEarned: positiveXp,
      averageXpPerCompletedDay,
      averageMissionsPerCompletedDay,
      perfectDays: finalizedReviews.filter((review) => review.perfectDay).length,
      trainingSessions: training.filter((session) => session.status === 'completed').length,
      kitchenOrders: kitchen.filter((session) => session.status === 'completed').length,
      sanctuarySessions: sanctuary.filter((session) => session.status === 'completed').length,
    },
    momentum: source.stats.map((stat) => ({
      stat: stat.name,
      level: stat.level,
      trend: stat.trend,
      neglectedDays: stat.neglectedDays,
    })),
    party: {
      enabledCompanionIds: source.enabledCompanionIds,
      directorNotes: Object.entries(source.settings.aiSoulprintNotes)
        .filter(([companionId]) =>
          source.audience === 'party'
            ? source.enabledCompanionIds.includes(
                companionId as (typeof source.enabledCompanionIds)[number],
              )
            : companionId === source.audience,
        )
        .map(([companionId, notes]) => ({
          companionId: companionId as CompanionId,
          humor: directorNote(notes?.humor),
          challenge: directorNote(notes?.challenge),
          care: directorNote(notes?.care),
          casual: directorNote(notes?.casual),
          conflict: directorNote(notes?.conflict),
          bonds: directorNote(notes?.bonds),
          never: directorNote(notes?.never),
        })),
    },
    state: {
      recoveryActive: source.settings.recoveryMode.active,
    },
    bondMemory: {
      enabled: source.settings.aiRelationshipMemoryEnabled,
      approved: memories.map((memory) => ({
        fact: memory.fact,
        category: memory.category,
        scope: memory.scope,
      })),
    },
    kitchen: {
      todayOrder:
        todayKitchen && todayRecipe
          ? {
              status: todayKitchen.status,
              name: todayRecipe.name,
              codename: todayRecipe.codename,
              totalMinutes: todayRecipe.prepMinutes + todayRecipe.cookMinutes,
              servings: todayRecipe.servings,
              equipment: todayRecipe.equipment,
              ingredients: todayRecipe.ingredients,
              steps: todayRecipe.steps,
              completedStepNumbers: todayRecipe.steps
                .map((step, index) => (todayKitchen.stepChecks?.[step] ? index + 1 : 0))
                .filter(Boolean),
              storage: todayRecipe.storage,
              safety: todayRecipe.safety,
            }
          : undefined,
      savedRecipeNames: customRecipes.slice(0, 40).map((recipe) => recipe.name),
    },
    specialists: {
      sanctuary: {
        recentSessions: sanctuary
          .slice()
          .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
          .slice(0, 5)
          .map((session) => ({
            date: session.date,
            mode: session.mode,
            status: session.status,
            concerns: [session.primaryConcern, session.secondaryConcern].filter(
              (concern): concern is NonNullable<typeof concern> => Boolean(concern),
            ),
            passageIds: session.passageIds,
            nextAction: session.nextAction?.slice(0, 240),
            outcome: session.outcome,
          })),
        privateWritingExcluded: true,
      },
      training: {
        recentSessions: training
          .slice()
          .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
          .slice(0, 8)
          .map((session) => ({
            date: session.date,
            location: session.location,
            status: session.status,
            circuitId: session.circuitId,
            plannedMinutes: session.durationMinutes ?? session.mobilityEstimatedMinutes,
            loggedMinutes: session.loggedDurationMinutes,
            roundsCompleted: session.roundsCompleted,
            recoveryProtocol: session.recoveryProtocol?.slice(0, 160),
          })),
        privateNotesExcluded: true,
      },
      campaigns: {
        activeArcs: campaignArcs
          .filter((arc) => arc.status === 'active')
          .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
          .slice(0, 8)
          .map((arc) => {
            const milestones = arcMilestones
              .filter((milestone) => milestone.arcId === arc.id)
              .sort((left, right) => left.order - right.order);
            return {
              id: arc.id,
              name: arc.name.slice(0, 120),
              purpose: arc.purpose.slice(0, 300),
              category: arc.category,
              companionId: arc.companionId,
              targetDate: arc.targetDate,
              incompleteMilestones: milestones
                .filter((milestone) => milestone.status !== 'completed')
                .slice(0, 8)
                .map((milestone) => milestone.title.slice(0, 140)),
              completedMilestones: milestones.filter(
                (milestone) => milestone.status === 'completed',
              ).length,
            };
          }),
        milestoneNotesExcluded: true,
      },
      creator: {
        identity: {
          channelName: creatorSettings?.channelName.slice(0, 160) ?? '',
          channelHandle: creatorSettings?.channelHandle.slice(0, 100) ?? '',
          weeklyUploadTarget: creatorSettings?.weeklyUploadTarget ?? 1,
          currentArcFocus: creatorSettings?.currentArcFocus.slice(0, 500) ?? '',
          accountabilityMode: creatorSettings?.accountabilityMode ?? 'direct',
        },
        latestSnapshot: latestCreatorSnapshot
          ? {
              capturedAt: latestCreatorSnapshot.capturedAt,
              periodDays: latestCreatorSnapshot.periodDays,
              subscribers: latestCreatorSnapshot.subscribers,
              views: latestCreatorSnapshot.views,
              watchHours: latestCreatorSnapshot.watchHours,
              impressions: latestCreatorSnapshot.impressions,
              clickThroughRate: latestCreatorSnapshot.clickThroughRate,
              averageViewDurationSeconds: latestCreatorSnapshot.averageViewDurationSeconds,
              uploads: latestCreatorSnapshot.uploads,
            }
          : undefined,
        historyWindows: ([28, 90, 365] as const)
          .map((periodDays) =>
            creatorSnapshots.find((snapshot) => snapshot.periodDays === periodDays),
          )
          .filter((snapshot): snapshot is NonNullable<typeof snapshot> => Boolean(snapshot))
          .map((snapshot) => ({
            periodDays: snapshot.periodDays,
            views: snapshot.views,
            watchHours: snapshot.watchHours,
            averageViewDurationSeconds: snapshot.averageViewDurationSeconds,
            uploads: snapshot.uploads,
          })),
        provenVideos: creatorVideoInsights.map((video) => ({
          title: video.title.slice(0, 200),
          publishedAt: video.publishedAt,
          periodDays: video.periodDays,
          views: video.views,
          watchHours: video.watchHours,
          averageViewPercentage: video.averageViewPercentage,
          likes: video.likes,
          comments: video.comments,
        })),
        activeProjects: creatorProjects
          .filter((project) => project.status !== 'published' && project.status !== 'paused')
          .slice(0, 12)
          .map((project) => ({
            id: project.id,
            title: project.title.slice(0, 180),
            platform: project.platform,
            contentType: project.contentType,
            status: project.status,
            pillar: project.pillar.slice(0, 200),
            hook: project.hook.slice(0, 500),
            audiencePromise: project.audiencePromise.slice(0, 500),
            nextAction: project.nextAction.slice(0, 500),
            updatedAt: project.updatedAt,
          })),
        recentlyPublished: creatorProjects
          .filter((project) => project.status === 'published')
          .slice(0, 8)
          .map((project) => ({
            title: project.title.slice(0, 180),
            platform: project.platform,
            publishedAt: project.publishedAt,
          })),
        privateNotesExcluded: true,
      },
      treasury: treasurySharingAllowed
        ? {
            sharingEnabled: true,
            privacy:
              'Aggregated totals only. Transaction labels, notes, merchants, bill names, debt names, savings-goal names, and individual records are excluded.',
            recentThirtyDays: {
              incomeCents: sumBy(
                treasuryTransactions.filter((item) => item.kind === 'income'),
                (item) => item.amountCents,
              ),
              expenseCents: sumBy(
                treasuryTransactions.filter((item) => item.kind === 'expense'),
                (item) => item.amountCents,
              ),
              diningCents: sumBy(
                treasuryTransactions.filter(
                  (item) => item.kind === 'expense' && item.category === 'dining',
                ),
                (item) => item.amountCents,
              ),
              groceriesCents: sumBy(
                treasuryTransactions.filter(
                  (item) => item.kind === 'expense' && item.category === 'groceries',
                ),
                (item) => item.amountCents,
              ),
              debtPaymentCents: sumBy(
                treasuryTransactions.filter((item) => item.kind === 'debt-payment'),
                (item) => item.amountCents,
              ),
              savingsCents: sumBy(
                treasuryTransactions.filter((item) => item.kind === 'savings'),
                (item) => item.amountCents,
              ),
            },
            currentWeek: currentTreasuryWeek
              ? {
                  status: currentTreasuryWeek.status,
                  spendingLimitCents: currentTreasuryWeek.spendingLimitCents,
                  diningLimitCents: currentTreasuryWeek.diningLimitCents,
                  savingsTargetCents: currentTreasuryWeek.savingsTargetCents,
                  debtTargetCents: currentTreasuryWeek.debtTargetCents,
                  spendingSoFarCents: sumBy(
                    currentWeekTransactions.filter((item) => item.kind === 'expense'),
                    (item) => item.amountCents,
                  ),
                  diningSoFarCents: sumBy(
                    currentWeekTransactions.filter(
                      (item) => item.kind === 'expense' && item.category === 'dining',
                    ),
                    (item) => item.amountCents,
                  ),
                }
              : undefined,
            obligations: {
              activeBillCount: treasuryBills.filter((bill) => bill.active).length,
              knownBillAmountCents: sumBy(
                treasuryBills.filter((bill) => bill.active),
                (bill) => bill.amountCents,
              ),
              activeDebtCount: activeDebts.length,
              debtBalanceCents: sumBy(activeDebts, (debt) => debt.balanceCents),
              minimumPaymentsCents: sumBy(activeDebts, (debt) => debt.minimumPaymentCents ?? 0),
              aprRangeBasisPoints: debtAprs.length
                ? [Math.min(...debtAprs), Math.max(...debtAprs)]
                : undefined,
              activeSavingsGoalCount: treasurySavingsGoals.filter((goal) => goal.active).length,
              savingsCurrentCents: sumBy(
                treasurySavingsGoals.filter((goal) => goal.active),
                (goal) => goal.currentCents,
              ),
              savingsTargetCents: sumBy(
                treasurySavingsGoals.filter((goal) => goal.active),
                (goal) => goal.targetCents,
              ),
            },
          }
        : {
            sharingEnabled: false,
            privacy:
              'Cassian Ledger Counsel is disabled. Do not infer or request private amounts; explain that the Hunter may enable aggregate-only counsel in AI Headquarters.',
          },
    },
    commands: {
      confirmationRequired: true,
      allowedActions: commandCatalog.map((action) => ({
        actionId: action.actionId,
        label: action.label,
        description: action.description,
        impact: action.impact,
      })),
    },
  };
}
