import { ArrowRight, Check, ListChecks, Shield, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Modal } from '@/components/Modal';
import { setFirstDayGuideCompleted } from '@/db/repositories';
import { useGameStore } from '@/store/useGameStore';

const STEPS = [
  {
    icon: Sparkles,
    title: 'This is your System day',
    text: 'The dashboard shows your active directives, level, cleared-day streak, and current System state. A partial day records progress but does not extend that streak.',
  },
  {
    icon: ListChecks,
    title: 'Complete honestly',
    text: 'Quick-complete simple missions, or expand one to add private notes and optional details.',
  },
  {
    icon: Shield,
    title: 'Review before the next cycle',
    text: 'At your reset boundary, unresolved missions enter Daily Review. Nothing is silently erased.',
  },
];

export function FirstDayGuide() {
  const { settings, resume } = useGameStore();
  const [step, setStep] = useState(0);
  if (!settings || settings.firstDayGuideCompleted) return null;
  const current = STEPS[step];
  const Icon = current.icon;

  const finish = async () => {
    await setFirstDayGuideCompleted(true);
    await resume();
  };

  return (
    <Modal
      open
      lock
      onClose={() => undefined}
      eyebrow={`GUIDED START · ${step + 1}/3`}
      title={current.title}
    >
      <div className="first-day-guide">
        <span className="first-day-guide__icon">
          <Icon size={30} />
        </span>
        <p>{current.text}</p>
        <div className="first-day-guide__dots" aria-label={`Step ${step + 1} of 3`}>
          {STEPS.map((item, index) => (
            <i key={item.title} className={index === step ? 'is-active' : ''} />
          ))}
        </div>
        <button
          className="button button--primary button--wide"
          onClick={() => {
            if (step < STEPS.length - 1) setStep((value) => value + 1);
            else void finish();
          }}
        >
          {step < STEPS.length - 1 ? (
            <>
              Continue <ArrowRight size={17} />
            </>
          ) : (
            <>
              Enter the System <Check size={17} />
            </>
          )}
        </button>
        <button className="text-button" onClick={() => void finish()}>
          Skip guide
        </button>
      </div>
    </Modal>
  );
}
