import { Crown } from 'lucide-react';
import { formatClassName } from '@/utils/format';
import type { Rank } from '@/types/game';

export function ClassEmblem({ rank, compact = false }: { rank: Rank; compact?: boolean }) {
  const classKey = rank.toLowerCase().replaceAll(' ', '-');

  return (
    <div
      className={`class-emblem ${compact ? 'class-emblem--compact' : ''}`}
      data-class={classKey}
      aria-label={`Current class: ${formatClassName(rank)}`}
    >
      <span className="class-emblem__orbit" aria-hidden="true" />
      <span className="class-emblem__orbit class-emblem__orbit--inner" aria-hidden="true" />
      <Crown className="class-emblem__crown" size={compact ? 12 : 15} aria-hidden="true" />
      <span className="class-emblem__label">CURRENT CLASS</span>
      <strong>{rank === 'WORLD CLASS' ? 'WORLD' : rank}</strong>
      <small>CLASS</small>
    </div>
  );
}
