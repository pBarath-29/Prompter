import React from 'react';
import { PartyPopper, X } from 'lucide-react';

interface WelcomeBannerProps {
  name: string;
  onDismiss: () => void;
}

const WelcomeBanner: React.FC<WelcomeBannerProps> = ({ name, onDismiss }) => {
  return (
    <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white p-4 rounded-lg shadow-lg flex items-center justify-between animate-fade-in">
      <div className="flex items-center space-x-4">
        <PartyPopper size={32} />
        <div>
          <h3 className="font-bold text-lg">Welcome, {name}!</h3>
          <p className="text-sm">We're excited to have you join the Prompter community.</p>
        </div>
      </div>
      <button 
        onClick={onDismiss} 
        className="p-2 rounded-full hover:bg-white/20 transition-colors"
        aria-label="Dismiss welcome message"
      >
        <X size={20} />
      </button>
    </div>
  );
};

export default WelcomeBanner;
