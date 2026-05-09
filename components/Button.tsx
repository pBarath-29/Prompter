import React from 'react';
import LogoSpinner from './LogoSpinner';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  icon,
  variant = 'primary',
  isLoading = false,
  className = '',
  ...props
}) => {
  const baseClasses = 'group inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:-translate-y-px';

  const variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
  };

  const spinnerColorClass = {
      primary: 'text-white',
      secondary: 'text-gray-800 dark:text-gray-200',
      danger: 'text-white',
      success: 'text-white'
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <LogoSpinner size={20} className={`-ml-1 mr-3 ${spinnerColorClass[variant]}`} />
      ) : icon && <span className="mr-2 group-[.flex-row-reverse]:mr-0 group-[.flex-row-reverse]:ml-2">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
