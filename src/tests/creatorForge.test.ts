import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '@/db/database';
import { createDefaultCreatorSettings } from '@/db/seed';
import {
  getCreatorForgeSummary,
  parseYouTubeStudioCsv,
  saveCreatorCampaign,
  saveCreatorProject,
  saveCreatorSnapshot,
  saveCreatorStudioIntelligence,
} from '@/game/creatorForge';

describe('Creator Forge', () => {
  beforeEach(async () => {
    await db.creatorSettings.clear();
    await db.creatorSnapshots.clear();
    await db.creatorProjects.clear();
    await db.creatorVideoInsights.clear();
    await db.creatorSettings.put(createDefaultCreatorSettings('2026-08-12T12:00:00.000Z'));
  });

  it('builds a historical Reawakening map from three Studio windows and proven videos', async () => {
    await saveCreatorStudioIntelligence({
      snapshots: [
        { periodDays: 28, views: 0, watchHours: 0, uploads: 0 },
        { periodDays: 90, views: 30, watchHours: 2, uploads: 0 },
        { periodDays: 365, views: 1200, watchHours: 55, uploads: 3 },
      ],
      topVideos: [
        {
          videoId: 'video-1',
          title: 'The Old Arc',
          periodDays: 365,
          views: 900,
          watchHours: 42,
          averageViewPercentage: 58,
        },
      ],
    });
    const summary = await getCreatorForgeSummary();
    expect(summary.snapshotsByPeriod[28]?.views).toBe(0);
    expect(summary.snapshotsByPeriod[365]?.views).toBe(1200);
    expect(summary.videoInsights[0]?.title).toBe('The Old Arc');
    expect(summary.reawakening).toMatchObject({
      state: 'dormant',
      headline: 'This is a reawakening, not a continuation.',
    });
    expect(summary.reawakening.focus).toContain('The Old Arc');
  });

  it('tracks content from idea through publish and reports creator momentum', async () => {
    await saveCreatorSnapshot({
      subscribers: 125,
      views: 2400,
      watchHours: 81.5,
      clickThroughRate: 5.4,
    });
    const project = await saveCreatorProject({
      title: 'The ARC Awakens',
      platform: 'youtube',
      contentType: 'long-form',
      status: 'idea',
      pillar: 'ARC',
      hook: 'What if progress became a living world?',
      audiencePromise: 'See how the System turns habits into a story.',
      nextAction: 'Write the first 30 seconds.',
      notes: '',
    });
    const summary = await getCreatorForgeSummary();
    expect(summary.latestSnapshot?.views).toBe(2400);
    expect(summary.activeProjects[0]).toEqual(expect.objectContaining({ id: project.id }));
    expect(summary.vesperCallout).toContain('The ARC Awakens');
  });

  it('adds a comeback campaign as one duplicate-safe board update', async () => {
    const base = {
      platform: 'youtube' as const,
      contentType: 'long-form' as const,
      pillar: 'ARC',
      hook: 'A grounded opening.',
      audiencePromise: 'One clear lesson.',
      nextAction: 'Write the opening.',
      notes: '',
    };
    await saveCreatorProject({ ...base, title: 'Already Planned', status: 'idea' });
    const created = await saveCreatorCampaign([
      { ...base, title: 'Already Planned' },
      { ...base, title: 'Return Signal' },
      { ...base, title: 'Return Signal' },
      { ...base, title: 'Second Wave' },
    ]);

    expect(created.map((project) => project.title)).toEqual(['Return Signal', 'Second Wave']);
    expect(await db.creatorProjects.count()).toBe(3);
  });

  it('imports common YouTube Studio analytics columns without credentials', () => {
    const parsed = parseYouTubeStudioCsv(
      [
        'Content,Views,Watch time (hours),Impressions,Impressions click-through rate (%),Average view duration,Subscribers',
        'Video A,1000,50,10000,5.0,0:03:00,12',
        'Video B,500,25,5000,8.0,0:02:00,8',
      ].join('\n'),
    );
    expect(parsed.views).toBe(1500);
    expect(parsed.watchHours).toBe(75);
    expect(parsed.impressions).toBe(15000);
    expect(parsed.clickThroughRate).toBeCloseTo(6);
    expect(parsed.averageViewDurationSeconds).toBe(150);
    expect(parsed.subscribers).toBe(20);
  });

  it('uses a Studio total row without counting every video twice', () => {
    const parsed = parseYouTubeStudioCsv(
      [
        'Content,Views,Watch time (hours),Impressions,Impressions click-through rate (%)',
        'Total,1500,75,15000,6.0',
        'Video A,1000,50,10000,5.0',
        'Video B,500,25,5000,8.0',
      ].join('\n'),
    );
    expect(parsed.views).toBe(1500);
    expect(parsed.watchHours).toBe(75);
    expect(parsed.impressions).toBe(15000);
    expect(parsed.clickThroughRate).toBe(6);
  });

  it('rejects a CSV that does not contain supported Studio metrics', () => {
    expect(() => parseYouTubeStudioCsv('Content,Published\nVideo A,2026-08-12')).toThrow(
      'No supported Studio metrics were found',
    );
  });
});
