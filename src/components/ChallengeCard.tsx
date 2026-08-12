import { Check, Clock3, Crown, LockKeyhole, Play, Sparkles } from 'lucide-react';
import { ProgressBar } from '@/components/ProgressBar';
import { getChallengeTemplate } from '@/config/challenges';
import { formatShortDate } from '@/utils/date';
import type { ChallengeProgress, ChallengeTemplate } from '@/types/game';

export function ChallengeCard({
  progress,
  template: templateProp,
  onStart,
  featured = false,
}: {
  progress?: ChallengeProgress;
  template?: ChallengeTemplate;
  onStart?: () => void;
  featured?: boolean;
}) {
  const template =
    templateProp ?? (progress ? getChallengeTemplate(progress.templateId) : undefined);
  if (!template) return null;
  const status = progress?.status ?? 'available';
  return (
    <article className={`challenge-card ${featured ? 'challenge-card--featured' : ''}`}>
      <div className="challenge-card__aura" />
      <header className="challenge-card__header">
        <span className="challenge-card__icon">
          {template.kind === 'rank-trial' ? <Crown size={20} /> : <Sparkles size={20} />}
        </span>
        <div>
          <span className="challenge-card__type">
            {template.kind.replace('-', ' ')} · TIER {template.difficulty}
          </span>
          <h3>{template.name}</h3>
        </div>
        <span className={`status-chip status-chip--${status}`}>{status}</span>
      </header>
      <p>{template.description}</p>
      {progress && (
        <>
          <ProgressBar
            value={progress.current}
            max={progress.target}
            tone="purple"
            label={`${progress.current} / ${progress.target}`}
          />
          <div className="challenge-card__timeline">
            <Clock3 size={14} />
            <span>
              {formatShortDate(progress.startedAt)} — {formatShortDate(progress.endsAt)}
            </span>
            <span>
              {progress.milestoneReached}/{template.milestones.length} milestones
            </span>
          </div>
        </>
      )}
      <div className="challenge-card__rewards">
        <span>REWARD</span>
        <strong>+{template.accountXp} XP</strong>
        {template.titleRewardId && <strong>Unique title</strong>}
        {template.cosmeticReward && <strong>Cosmetic</strong>}
      </div>
      {!progress && onStart && (
        <button className="button button--purple button--wide" onClick={onStart}>
          <Play size={17} />
          Begin challenge
        </button>
      )}
      {status === 'completed' && (
        <div className="challenge-card__complete">
          <Check size={16} /> Rewards secured
        </div>
      )}
      {status === 'cooldown' && (
        <div className="challenge-card__complete challenge-card__complete--muted">
          <LockKeyhole size={16} /> Retry available {progress?.cooldownUntil}
        </div>
      )}
    </article>
  );
}
