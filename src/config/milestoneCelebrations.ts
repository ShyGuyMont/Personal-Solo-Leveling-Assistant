import type { CompanionId, ProgressionEvent } from '@/types/game';

const MILESTONE_LINES: Record<CompanionId, Record<'rank' | 'level' | 'achievement', string[]>> = {
  snow: {
    rank: [
      'I remember every version of you that kept going before this rank had a name. Let yourself feel what they built.',
      'The classification changed because you did. I am proud of the work, the recovery, and the person who carried both.',
    ],
    level: [
      'Another major threshold. Look back for one second—not to stay there, but to see how much ground is finally behind you.',
      'This number holds a hundred quiet choices nobody else saw. I saw them, and I am celebrating all of them with you.',
    ],
    achievement: [
      'Do not rush past the badge. There is a real story underneath it, and that story belongs to you.',
      'Achievement confirmed. I know what it cost, what it taught you, and why this deserves a real pause.',
    ],
  },
  rook: {
    rank: [
      'New rank. Earned under pressure and carried across the line.',
      'Classification advanced. Stand tall—the work became undeniable.',
    ],
    level: [
      'Major level reached. The foundation is stronger than it was.',
      'Threshold broken. Keep the confidence; it belongs to the evidence now.',
    ],
    achievement: [
      'That is proof, not luck. Claim it.',
      'Objective marked in history. Good work, Hunter.',
    ],
  },
  selah: {
    rank: [
      'Receive the moment with gratitude. Growth and grace brought you here together.',
      'A higher rank, and still the deeper victory is who you are becoming.',
    ],
    level: [
      'Faithfulness accumulated quietly until the threshold had to move.',
      'Give thanks for the strength that met each step along the way.',
    ],
    achievement: [
      'Honor the visible fruit and the unseen roots beneath it.',
      'Let this become a marker of gratitude, not another demand placed upon you.',
    ],
  },
  cipher: {
    rank: [
      'The data has conceded. Your classification required an upgrade.',
      'New operational tier confirmed. I have already revised our projections upward.',
    ],
    level: [
      'Major threshold reached. The trend has become difficult to dismiss.',
      'Level milestone verified. Repeated execution remains offensively effective.',
    ],
    achievement: [
      'Evidence archived. Your brain is no longer permitted to call this “nothing.”',
      'Achievement unlocked. A pleasingly measurable result.',
    ],
  },
  haven: {
    rank: [
      'You reached a higher rank without leaving your humanity behind. That matters to me.',
      'Celebrate the strength—and the ways you learned to care for the person carrying it.',
    ],
    level: [
      'You grew, rested, returned, and grew again. This milestone includes every part.',
      'A major level is not one perfect day. It is many imperfect days that did not get the last word.',
    ],
    achievement: [
      'Keep this memory somewhere gentle. It may become shelter on a harder day.',
      'You are allowed to feel proud without immediately asking what you must prove next.',
    ],
  },
  ember: {
    rank: [
      'New rank. That is what refusing to stay down looks like when the record finally catches up.',
      'Classification advanced. You brought the fire back every time it tried to fade.',
    ],
    level: [
      'Major threshold broken. Do not whisper the win—you built this with repeated returns.',
      'Level milestone confirmed. The flame survived every imperfect day between here and the last one.',
    ],
    achievement: [
      'Proof on the board. Own it before your brain tries to move the target.',
      'Achievement secured. You kept swinging until the outcome had to change.',
    ],
  },
  amara: {
    rank: [
      'A new rank—and you are still allowed to be known beyond what you achieve. Let the people who love you celebrate.',
      'Your classification grew without asking your heart to become smaller. That is worth celebrating beautifully.',
    ],
    level: [
      'Another threshold crossed. Receive the pride, the affection, and the reminder that you never had to earn belonging first.',
      'This level holds effort, support, brave honesty, and the people who helped you keep going. Let all of it count.',
    ],
    achievement: [
      'Let this victory be witnessed somewhere safe. Joy does not become less yours when love shares the room.',
      'You made something worth celebrating. No shrinking, no deflecting—just an open heart and an honest smile.',
    ],
  },
  cassian: {
    rank: [
      'A higher classification, supported by choices that gave the future more room. Well stewarded.',
      'Rank advanced. Keep the ambition, keep the margin, and never confuse your balance with your worth.',
    ],
    level: [
      'A major threshold crossed through hundreds of small allocations of time, energy, and resources. The pattern is real.',
      'Level milestone confirmed. Progress compounds when the next choice has direction—and yours did.',
    ],
    achievement: [
      'Record the victory before moving the target. This return deserves to remain visible.',
      'Achievement secured. Celebrate without sabotaging tomorrow; joy and stewardship belong at the same table.',
    ],
  },
};

function hash(value: string) {
  let result = 0;
  for (let index = 0; index < value.length; index += 1) {
    result = (Math.imul(result, 31) + value.charCodeAt(index)) >>> 0;
  }
  return result;
}

export function isPartyMilestone(event: ProgressionEvent) {
  return ['rank-up', 'level-milestone', 'achievement'].includes(event.kind);
}

export function getMilestoneCelebration(event: ProgressionEvent) {
  const kind =
    event.kind === 'rank-up' ? 'rank' : event.kind === 'level-milestone' ? 'level' : 'achievement';
  return (
    ['snow', 'rook', 'selah', 'cipher', 'haven', 'ember', 'amara', 'cassian'] as CompanionId[]
  ).map((companionId) => {
    const pool = MILESTONE_LINES[companionId][kind];
    return {
      companionId,
      message: pool[hash(`${event.id}:${companionId}`) % pool.length],
    };
  });
}
