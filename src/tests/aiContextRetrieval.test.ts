import { describe, expect, it } from 'vitest';
import { selectCreatorProjectsForContext } from '@/game/aiContext';
import type { CreatorProject } from '@/types/game';

function project(
  id: string,
  title: string,
  updatedAt: string,
  status: CreatorProject['status'] = 'idea',
): CreatorProject {
  return {
    id,
    title,
    platform: 'youtube',
    contentType: 'long-form',
    status,
    pillar: 'Gaming',
    hook: `${title} hook`,
    audiencePromise: `${title} promise`,
    nextAction: `Record ${title}`,
    notes: '',
    createdAt: updatedAt,
    updatedAt,
  };
}

describe('AI specialist record targeting', () => {
  it('keeps an exact older Creator Forge project inside Vesper context', () => {
    const projects = [
      ...Array.from({ length: 14 }, (_, index) =>
        project(
          `recent-${index}`,
          `Recent operation ${index}`,
          `2026-08-${String(30 - index).padStart(2, '0')}T12:00:00.000Z`,
        ),
      ),
      project('tokon', 'Marvel Tokon Reawakening', '2026-06-01T12:00:00.000Z'),
    ];

    const context = selectCreatorProjectsForContext(
      projects,
      "Workshop Marvel Tokon Reawakening's next move.",
    );

    expect(context.targeting.mode).toBe('exact-project');
    expect(context.targeting.requestedProjectTitles).toEqual(['Marvel Tokon Reawakening']);
    expect(context.selected[0]?.id).toBe('tokon');
    expect(context.selected).toHaveLength(12);
  });

  it('carries an exact Creator Forge project through Vesper follow-ups', () => {
    const projects = [
      project('tokon', 'Marvel Tokon Reawakening', '2026-08-01T12:00:00.000Z'),
      project('other', 'Sunday Stream', '2026-08-02T12:00:00.000Z'),
    ];

    const context = selectCreatorProjectsForContext(projects, 'Yes, help me sharpen it.', [
      {
        role: 'hunter',
        message: 'Review Marvel Tokon Reawakening with me.',
      },
    ]);

    expect(context.targeting.mode).toBe('conversation-carryover');
    expect(context.targeting.usedConversationCarryover).toBe(true);
    expect(context.selected[0]?.id).toBe('tokon');
  });
});
