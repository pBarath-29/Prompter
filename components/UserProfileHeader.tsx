import React, { useMemo } from 'react';
import { User } from '../types';
import { usePrompts } from '../contexts/PromptContext';
import { Award, Edit, BookOpen, KeyRound } from 'lucide-react';
import Button from './Button';

interface UserProfileHeaderProps {
  user: User;
  isEditable: boolean;
  onEditProfileClick?: () => void;
  onChangePasswordClick?: () => void;
}

const UserProfileHeader: React.FC<UserProfileHeaderProps> = ({ user, isEditable, onEditProfileClick, onChangePasswordClick }) => {
  const { prompts } = usePrompts();

  const approvedPrompts = useMemo(() => {
    return prompts.filter(p => user.submittedPrompts?.includes(p.id) && p.status === 'approved' && p.isPublic);
  }, [prompts, user.submittedPrompts]);

  const badges = useMemo(() => {
    const calculatedBadges: string[] = [];
    
    if (user.role === 'admin') {
        calculatedBadges.push('Admin');
    }
    
    if (approvedPrompts.length >= 20) {
        calculatedBadges.push('Prompt Master');
    }
    
    if (approvedPrompts.length > 0) {
        const totalUpvotes = approvedPrompts.reduce((sum, p) => sum + p.upvotes, 0);
        const averageUpvotes = totalUpvotes / approvedPrompts.length;
        if (averageUpvotes >= 100) {
            calculatedBadges.push('Top Creator');
        }
    }
    
    return calculatedBadges;
  }, [user.role, approvedPrompts]);

  return (
    <div className="p-4 sm:p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
      <img src={user.avatar} alt={user.name} className="w-24 h-24 sm:w-32 sm:h-32 rounded-full ring-4 ring-primary-500 object-cover flex-shrink-0" />
      <div className="text-center md:text-left flex-grow">
        <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
          <h1 className="text-3xl sm:text-4xl font-extrabold">{user.name}</h1>
          {isEditable && (
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <Button variant="secondary" onClick={onEditProfileClick} icon={<Edit size={16}/>} className="w-full sm:w-auto">
                Edit Profile
              </Button>
              <Button variant="secondary" onClick={onChangePasswordClick} icon={<KeyRound size={16}/>} className="w-full sm:w-auto">
                Change Password
              </Button>
            </div>
          )}
        </div>
        <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-xl mx-auto md:mx-0">{user.bio}</p>
        <div className="flex flex-wrap justify-center md:justify-start gap-2 sm:gap-4 mt-4">
          <div className="flex items-center px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 text-sm font-semibold rounded-full">
              <BookOpen size={16} className="mr-1.5" />
              <span>{approvedPrompts.length} Prompts Submitted</span>
          </div>
          {badges.map(badge => (
            <span key={badge} className="flex items-center px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-sm font-semibold rounded-full">
              <Award size={16} className="mr-1.5" />
              {badge}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserProfileHeader;