import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = '2xl' }) => {
  const [isRendered, setIsRendered] = useState(isOpen);
  const [isShowing, setIsShowing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      // Timeout to allow the component to render before applying the 'show' class
      const timer = setTimeout(() => setIsShowing(true), 20);
      return () => clearTimeout(timer);
    } else {
      setIsShowing(false);
      // Timeout to allow the fade-out animation to complete before unmounting
      const timer = setTimeout(() => setIsRendered(false), 300); // match duration-300
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Effect to lock and unlock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      // A small delay to prevent the scrollbar from reappearing before the modal fade-out animation is complete.
      const timer = setTimeout(() => {
        document.body.style.overflow = 'auto';
      }, 300);
      return () => clearTimeout(timer);
    }

    // Cleanup function to ensure scroll is restored when the component unmounts
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);


  if (!isRendered) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
  };

  return (
    <div 
        className={`fixed inset-0 bg-black z-50 flex justify-center items-center p-4 transition-opacity duration-300 ${isShowing ? 'bg-opacity-50' : 'bg-opacity-0 pointer-events-none'}`} 
        onClick={onClose}
    >
        <div
            className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full ${sizeClasses[size]} transform transition-all duration-300 ease-out ${isShowing ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
            onClick={e => e.stopPropagation()}
        >
            <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                <h2 className="text-xl font-bold">{title}</h2>
                <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                    <X size={24} />
                </button>
            </div>
            <div className="p-6">
                {children}
            </div>
        </div>
    </div>
  );
};

export default Modal;