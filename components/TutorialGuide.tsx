import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Zap, Users, ShoppingBag, ArrowRight, Check, Sparkles } from 'lucide-react';
import Button from './Button';

interface TutorialGuideProps {
  isOpen: boolean;
  onComplete: () => void;
}

const steps = [
  {
    icon: <Sparkles size={32} className="text-primary-500" />,
    title: 'Welcome to Prompter!',
    description: "You're about to get access to the fastest way to craft perfect AI prompts. Let's take a 30-second tour.",
    tip: null,
  },
  {
    icon: <Zap size={32} className="text-primary-500" />,
    title: 'Generate with AI',
    description: 'Describe your goal in plain English, pick a tone and category, and we generate a fully structured, ready-to-use prompt.',
    tip: 'Use the Refine buttons after generation to make it shorter, more specific, or formatted differently.',
  },
  {
    icon: <Users size={32} className="text-primary-500" />,
    title: 'Community Hub',
    description: 'Browse thousands of prompts shared by other creators. Upvote your favourites, leave comments, and share your own.',
    tip: 'You get 3 free prompt submissions per day.',
  },
  {
    icon: <ShoppingBag size={32} className="text-primary-500" />,
    title: 'Marketplace',
    description: 'Buy curated prompt collections from expert creators — or submit your own collection and earn.',
    tip: 'Pro users get unlimited generations and more daily submissions.',
  },
];

const TutorialGuide: React.FC<TutorialGuideProps> = ({ isOpen, onComplete }) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen]);

  if (!isOpen) return null;

  const current = steps[step];
  const isLast = step === steps.length - 1;

  return createPortal(
    <div className="fixed top-0 left-0 w-screen h-screen bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md animate-pop-in">

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 pt-6">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-6 bg-primary-500' : i < step ? 'w-3 bg-primary-300' : 'w-3 bg-gray-200 dark:bg-gray-700'}`}
            />
          ))}
        </div>

        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-primary-50 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mx-auto mb-5">
            {current.icon}
          </div>

          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-3">
            {current.title}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
            {current.description}
          </p>

          {current.tip && (
            <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl px-4 py-3 text-sm text-primary-700 dark:text-primary-300 text-left flex items-start gap-2 mb-4">
              <Check size={16} className="flex-shrink-0 mt-0.5" />
              <span>{current.tip}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-8 pb-8 gap-3">
          {step > 0 ? (
            <button
              onClick={() => setStep(s => s - 1)}
              className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              Back
            </button>
          ) : (
            <button
              onClick={onComplete}
              className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              Skip
            </button>
          )}

          <Button
            onClick={isLast ? onComplete : () => setStep(s => s + 1)}
            icon={isLast ? undefined : <ArrowRight size={16} />}
            className="!flex-row-reverse"
          >
            {isLast ? "Let's Go!" : 'Next'}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default TutorialGuide;
