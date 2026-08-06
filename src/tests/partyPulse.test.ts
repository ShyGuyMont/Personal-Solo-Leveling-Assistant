import { describe, expect, it } from 'vitest';
import { getPartyPulseSignals } from '@/game/partyPulse';
import { createInitialStat } from '@/game/stats';
import type { CompanionId, StatName, StatProgress } from '@/types/game';

const PARTY: CompanionId[] = [
  'snow',
  'rook',
  'selah',
  'cipher',
  'haven',
  'ember',
  'amara',
  'cassian',
  'saffron',
];

function stat(id: StatName, neglectedDays: number, momentum: number): StatProgress {
  return {
    ...createInitialStat(id),
    neglectedDays,
    momentum,
    trend: neglectedDays ? 'declining' : 'stable',
  };
}

describe('Party Pulse', () => {
  it('stays quiet before a stat crosses the humane attention threshold', () => {
    expect(getPartyPulseSignals([stat('strength', 1, 50)], PARTY)).toEqual([]);
  });

  it('routes neglected stats to their specialists with distinct recovery actions', () => {
    const signals = getPartyPulseSignals(
      [stat('strength', 3, 32), stat('faith', 2, 40), stat('stewardship', 5, 18)],
      PARTY,
    );

    expect(signals.map((signal) => signal.companionId)).toEqual(['cassian', 'rook', 'selah']);
    expect(signals.find((signal) => signal.companionId === 'rook')?.actionPath).toBe(
      '/training-hall',
    );
    expect(signals.find((signal) => signal.companionId === 'selah')?.message).toMatch(/shame/i);
    expect(signals.find((signal) => signal.companionId === 'cassian')?.message).toMatch(/guilt/i);
  });

  it('adds Ember for broad re-entry while honoring individual companion controls', () => {
    const signals = getPartyPulseSignals(
      [stat('strength', 3, 35), stat('faith', 3, 35), stat('focus', 3, 35), stat('empathy', 3, 35)],
      PARTY.filter((id) => id !== 'selah'),
    );

    expect(signals.some((signal) => signal.companionId === 'ember')).toBe(true);
    expect(signals.some((signal) => signal.companionId === 'selah')).toBe(false);
    expect(signals.find((signal) => signal.companionId === 'ember')?.message).toMatch(
      /easiest meaningful objective/i,
    );
  });
});
