import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { Ban, Zap } from 'lucide-react';
import { FREE_TIER_POST_LIMIT, PRO_TIER_POST_LIMIT } from '../config';
import { useNavigate } from 'react-router-dom';


interface LimitReachedModalProps {
  isOpen: boolean;
  onClose: () => void;
  isPro: boolean;
}

const LimitReachedModal: React.FC<LimitReachedModalProps> = ({ isOpen, onClose, isPro }) => {
  const navigate = useNavigate();

  const handleUpgradeClick = () => {
    onClose();
    navigate('/upgrade');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Daily Limit Reached">
        {isPro ? (
            <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-yellow-100 dark:bg-yellow-900 mb-4">
                    <Ban className="h-12 w-12 text-yellow-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">You're on Fire!</h3>
                <p className="mt-2 text-gray-500 dark:text-gray-400">
                    You've reached your Pro limit of {PRO_TIER_POST_LIMIT} prompt submissions for today. Come back tomorrow to share more of your awesome creations!
                </p>
                <div className="mt-8 flex justify-center">
                    <Button onClick={onClose}>
                        Got It
                    </Button>
                </div>
            </div>
        ) : (
            <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-primary-100 dark:bg-primary-900 mb-4">
                    <Zap className="h-12 w-12 text-primary-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Upgrade to Keep Creating</h3>
                <p className="mt-2 text-gray-500 dark:text-gray-400">
                    You've reached your daily limit of {FREE_TIER_POST_LIMIT} free prompt submission. Upgrade to Pro to submit up to {PRO_TIER_POST_LIMIT} prompts daily and enjoy unlimited generations!
                </p>
                <div className="mt-8 flex flex-col sm:flex-row-reverse gap-3">
                    <Button onClick={handleUpgradeClick} className="w-full">
                        Upgrade to Pro
                    </Button>
                    <Button onClick={onClose} variant="secondary" className="w-full">
                        Maybe Later
                    </Button>
                </div>
            </div>
        )}
    </Modal>
  );
};

export default LimitReachedModal;