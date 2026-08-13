import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '@/db/database';
import {
  buildArcKnowledgeContext,
  saveArcCanonSource,
  saveArcCharacter,
  scanArcContinuity,
} from '@/game/arcArchives';

function dossier(name: string, overrides: Record<string, unknown> = {}) {
  return {
    schema: 'ARC_Profile_Template',
    version: 4,
    meta: { completion: 84, overallClass: 'A' },
    data: {
      name,
      alias: 'The Ember Heir',
      style: 'Nature Flame',
      faction: 'Radiant Brigade',
      starting_class: 'C',
      ending_class: 'World',
      backstory: 'A guardian learning to carry an inherited flame without becoming consumed by it.',
      stats: { strength: 320, soul: 610 },
      ...overrides,
    },
  };
}

describe('A.R.C. Archives', () => {
  beforeEach(async () => {
    await Promise.all([db.arcCharacters.clear(), db.arcCanonSources.clear()]);
  });

  it('updates an existing character identity instead of duplicating it', async () => {
    const first = await saveArcCharacter(dossier('Laz'), 'laz-v1.json');
    const updated = await saveArcCharacter(
      dossier('Laz', { alias: 'The Rekindled Heir' }),
      'laz-v2.json',
    );

    expect(updated.id).toBe(first.id);
    expect(updated.createdAt).toBe(first.createdAt);
    expect(updated.alias).toBe('The Rekindled Heir');
    expect(await db.arcCharacters.count()).toBe(1);
  });

  it('retrieves only records that match the current lore question', async () => {
    await saveArcCharacter(dossier('Laz'));
    await saveArcCharacter(dossier('Fleur', { style: 'Bloom', faction: 'Verdant Court' }));
    await saveArcCanonSource({
      title: 'Nature Flame Inheritance',
      kind: 'world-lore',
      tags: ['Nature Flame', 'Radiant Brigade'],
      characterNames: ['Laz'],
      text: 'Laz inherits Nature Flame through the Radiant Brigade line.',
    });

    const context = await buildArcKnowledgeContext('What is established about Laz and Nature Flame?');

    expect(context.relevantCharacters.map((record) => record.name)).toEqual(['Laz']);
    expect(context.relevantCanonSources[0]?.source).toBe(
      'Canon source: Nature Flame Inheritance',
    );
    expect(context.grounding).toMatch(/established canon/i);
  });

  it('does not dump recent records for a non-empty question with no meaningful match', async () => {
    await saveArcCharacter(dossier('Laz'));

    const context = await buildArcKnowledgeContext('What is this and how should it work?');

    expect(context.relevantCharacters).toEqual([]);
    expect(context.relevantCanonSources).toEqual([]);
  });

  it('flags dossier gaps and source references without a matching character file', async () => {
    const incomplete = await saveArcCharacter(
      dossier('Laz', { faction: '', ending_class: '' }),
    );
    const source = await saveArcCanonSource({
      title: 'Brigade Roll Call',
      kind: 'faction',
      characterNames: ['Laz', 'Lucius'],
      text: 'Laz and Lucius answer the Radiant Brigade call.',
    });

    const findings = scanArcContinuity([incomplete], [source]);

    expect(findings.some((finding) => finding.title.includes('open dossier fields'))).toBe(true);
    expect(findings.some((finding) => finding.detail.includes('Lucius'))).toBe(true);
  });
});
