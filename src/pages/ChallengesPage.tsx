import { Crown, Diamond, LockKeyhole, Sparkles } from 'lucide-react';
import { useMemo } from 'react';
import { ChallengeCard } from '@/components/ChallengeCard';
import { BOSS_CHALLENGES, getChallengeTemplate } from '@/config/challenges';
import { calculateRankQualification } from '@/game/rank';
import { useGameStore } from '@/store/useGameStore';

export function ChallengesPage() {
  const { challenges, progression, stats, startBoss, startTrial } = useGameStore();
  const active = challenges.filter((challenge) => challenge.status === 'active');
  const completed = challenges
    .filter((challenge) => challenge.status === 'completed')
    .sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? ''));
  const activeBoss = active.find((challenge) => challenge.kind === 'boss');
  const qualification = useMemo(
    () => (progression ? calculateRankQualification(progression, stats, challenges) : undefined),
    [progression, stats, challenges],
  );
  const availableBosses = BOSS_CHALLENGES.filter(
    (template) =>
      !activeBoss &&
      !challenges.some(
        (progress) =>
          progress.templateId === template.id &&
          (progress.status === 'active' || progress.status === 'completed'),
      ),
  );

  return (
    <div className="page">
      <header className="page-heading">
        <div>
          <p className="eyebrow eyebrow--purple">HIGHER-ORDER OPERATIONS</p>
          <h1>Challenges</h1>
          <p>Longer campaigns test consistency without erasing the progress that qualified you.</p>
        </div>
        <span className="page-heading__glyph page-heading__glyph--purple">
          <Diamond size={25} />
        </span>
      </header>

      <section className="challenge-section">
        <header className="section-heading">
          <div>
            <Sparkles size={19} />
            <span>
              <strong>Active operations</strong>
              <small>Weekly dungeons, monthly operations, recovery, and optional campaigns</small>
            </span>
          </div>
        </header>
        <div className="challenge-grid">
          {active
            .filter((progress) => progress.kind !== 'rank-trial')
            .map((progress) => (
              <ChallengeCard key={progress.id} progress={progress} featured />
            ))}
        </div>
      </section>

      <section className="challenge-section">
        <header className="section-heading">
          <div>
            <Crown size={19} />
            <span>
              <strong>Rank Trial</strong>
              <small>Unlocked through complete qualification</small>
            </span>
          </div>
        </header>
        {qualification?.requirement?.trialTemplateId ? (
          (() => {
            const trial = challenges.find(
              (progress) => progress.templateId === qualification.requirement?.trialTemplateId,
            );
            const template = getChallengeTemplate(qualification.requirement.trialTemplateId!);
            if (trial) return <ChallengeCard progress={trial} featured />;
            if (qualification.qualified && template) {
              return (
                <ChallengeCard
                  template={template}
                  featured
                  onStart={() => void startTrial(template.id)}
                />
              );
            }
            return (
              <div className="locked-operation">
                <LockKeyhole size={23} />
                <div>
                  <strong>{template?.name ?? 'Next Rank Trial'}</strong>
                  <span>Complete every qualification requirement to unlock this operation.</span>
                </div>
              </div>
            );
          })()
        ) : (
          <div className="locked-operation">
            <Crown size={23} />
            <div>
              <strong>Highest classification reached</strong>
              <span>No higher trial exists.</span>
            </div>
          </div>
        )}
      </section>

      <section className="challenge-section">
        <header className="section-heading">
          <div>
            <Diamond size={19} />
            <span>
              <strong>Available Boss Challenges</strong>
              <small>User-activated and never forced</small>
            </span>
          </div>
        </header>
        {activeBoss ? (
          <p className="section-note">
            Complete or conclude the active Boss Challenge before starting another.
          </p>
        ) : null}
        <div className="challenge-grid">
          {availableBosses.map((template) => (
            <ChallengeCard
              key={template.id}
              template={template}
              onStart={() => void startBoss(template.id)}
            />
          ))}
        </div>
      </section>

      {completed.length > 0 && (
        <section className="challenge-section">
          <header className="section-heading">
            <div>
              <Sparkles size={19} />
              <span>
                <strong>Completed operations</strong>
                <small>Permanent campaign record</small>
              </span>
            </div>
          </header>
          <div className="challenge-grid challenge-grid--archive">
            {completed.map((progress) => (
              <ChallengeCard key={progress.id} progress={progress} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
