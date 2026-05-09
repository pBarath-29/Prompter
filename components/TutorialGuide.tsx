import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { Zap, Users, ShoppingBag, PartyPopper } from 'lucide-react';

interface TutorialGuideProps {
  isOpen: boolean;
  onComplete: () => void;
}

const Feature: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <div className="flex items-start space-x-4">
    <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-500">
      {icon}
    </div>
    <div>
      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h4>
      <p className="text-gray-600 dark:text-gray-400">{children}</p>
    </div>
  </div>
);


const TutorialGuide: React.FC<TutorialGuideProps> = ({ isOpen, onComplete }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onComplete} title="">
      <div className="text-center p-4">
        <PartyPopper size={48} className="mx-auto text-primary-500 mb-4 animate-pop-in" />
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Welcome to Prompter!</h2>
        <p className="text-lg text-gray-500 dark:text-gray-400 mb-8">
          Here’s a quick overview to get you started.
        </p>
        
        <div className="space-y-6 text-left">
            <Feature icon={<Zap size={24} />} title="Prompt Generator">
                Craft perfect prompts with AI assistance. Just describe your goal and we'll optimize it for you.
            </Feature>
            <Feature icon={<Users size={24} />} title="Community Hub">
                Explore, share, and vote on prompts from a vibrant community of creators.
            </Feature>
            <Feature icon={<ShoppingBag size={24} />} title="Marketplace">
                Discover premium, curated prompt collections for specialized tasks and projects.
            </Feature>
        </div>
        
        <div className="mt-10">
          <Button onClick={onComplete} className="w-full sm:w-auto !py-3 !px-8 !text-base">
            Let's Get Started!
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default TutorialGuide;
