import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface RatingControlProps {
  upvotes: number;
  downvotes: number;
  userVote?: 'up' | 'down' | null;
  onVote: (voteType: 'up' | 'down') => void;
  size?: number;
  disabled?: boolean;
}

const RatingControl: React.FC<RatingControlProps> = ({ upvotes, downvotes, userVote, onVote, size = 18, disabled = false }) => {
  const score = upvotes - downvotes;

  const handleUpvote = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    onVote('up');
  };

  const handleDownvote = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    onVote('down');
  };

  const upvoteClass = userVote === 'up' ? 'text-primary-500' : 'text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400';
  const downvoteClass = userVote === 'down' ? 'text-red-500' : 'text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400';

  return (
    <div className={`flex items-center space-x-1 ${disabled ? 'opacity-50' : ''}`}>
      <button onClick={handleUpvote} className="p-1 rounded-full transition-colors" title="Upvote" aria-label={`Upvote (score: ${score})`} aria-pressed={userVote === 'up'} disabled={disabled}>
        <ArrowUp size={size} className={upvoteClass} />
      </button>
      <span className="font-bold text-sm min-w-[24px] text-center" style={{fontSize: `${size > 20 ? '1rem' : '0.875rem'}`}} aria-label={`Score: ${score}`}>{score}</span>
      <button onClick={handleDownvote} className="p-1 rounded-full transition-colors" title="Downvote" aria-label="Downvote" aria-pressed={userVote === 'down'} disabled={disabled}>
        <ArrowDown size={size} className={downvoteClass} />
      </button>
    </div>
  );
};

export default RatingControl;