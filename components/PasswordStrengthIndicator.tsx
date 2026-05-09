import React, { useState, useEffect, useMemo } from 'react';
import { Check, X } from 'lucide-react';

interface PasswordStrengthIndicatorProps {
  password?: string;
}

const strengthLevels = [
  { text: '', color: 'bg-gray-200 dark:bg-gray-600' }, // Score 0
  { text: 'Weak', color: 'bg-red-500' }, // Score 1
  { text: 'Medium', color: 'bg-orange-500' }, // Score 2
  { text: 'Strong', color: 'bg-yellow-500' }, // Score 3
  { text: 'Very Strong', color: 'bg-green-500' }, // Score 4
];

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ password = '' }) => {
  
  const validation = useMemo(() => {
    return {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    };
  }, [password]);

  const score = useMemo(() => {
      if (!password) return 0;
      return Object.values(validation).filter(Boolean).length;
  }, [password, validation]);


  if (!password) {
    return null; // Don't render anything if there's no password input yet
  }

  const strength = strengthLevels[score] || strengthLevels[0];

  const Criterion: React.FC<{ met: boolean; text: string }> = ({ met, text }) => (
    <li className={`flex items-center text-xs transition-colors ${met ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
      {met ? <Check size={14} className="mr-1.5" /> : <X size={14} className="mr-1.5" />}
      {text}
    </li>
  );

  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center space-x-2">
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 flex space-x-1 p-0.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className={`h-full w-1/4 rounded-full transition-colors duration-300 ${score > i ? strength.color : 'bg-transparent'}`}
            ></div>
          ))}
        </div>
        <span className="text-sm font-medium w-24 text-right">{strength.text}</span>
      </div>
       <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
          <Criterion met={validation.length} text="At least 8 characters" />
          <Criterion met={validation.lowercase} text="A lowercase letter" />
          <Criterion met={validation.uppercase} text="An uppercase letter" />
          <Criterion met={validation.number} text="A number" />
          <Criterion met={validation.special} text="A special character" />
      </ul>
    </div>
  );
};

export default PasswordStrengthIndicator;
