import React from 'react';
import { Zap } from 'lucide-react';

interface LogoSpinnerProps {
  size?: number;
  className?: string;
}

const LogoSpinner: React.FC<LogoSpinnerProps> = ({ size = 48, className = '' }) => {
  return (
    <Zap
      size={size}
      className={`animate-spin text-primary-500 ${className}`}
      style={{ animationDuration: '0.5s' }}
    />
  );
};

export default LogoSpinner;
