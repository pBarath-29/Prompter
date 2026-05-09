import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

export interface DropdownOption<T> {
  value: T;
  label: string;
  icon?: ReactNode;
}

interface CustomDropdownProps<T extends string | number> {
  options: DropdownOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label?: string;
  className?: string;
  disabled?: boolean;
}

const CustomDropdown = <T extends string | number>({ options, value, onChange, label, className = '', disabled = false }: CustomDropdownProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && focusedIndex >= 0) {
      const items = listRef.current?.querySelectorAll<HTMLLIElement>('[role="option"]');
      items?.[focusedIndex]?.focus();
    }
  }, [isOpen, focusedIndex]);

  const handleOptionClick = (newValue: T) => {
    onChange(newValue);
    setIsOpen(false);
    setFocusedIndex(-1);
  };

  const handleTriggerKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen(o => !o);
      setFocusedIndex(0);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIsOpen(true);
      setFocusedIndex(0);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleOptionKeyDown = (e: React.KeyboardEvent, idx: number, optionValue: T) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleOptionClick(optionValue);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex(Math.min(idx + 1, options.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (idx === 0) {
        setIsOpen(false);
        (dropdownRef.current?.querySelector('button') as HTMLButtonElement)?.focus();
      } else {
        setFocusedIndex(idx - 1);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      (dropdownRef.current?.querySelector('button') as HTMLButtonElement)?.focus();
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>}
      <button
        type="button"
        onClick={() => { setIsOpen(!isOpen); setFocusedIndex(0); }}
        onKeyDown={handleTriggerKeyDown}
        disabled={disabled}
        className="w-full flex items-center justify-between p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-200 dark:disabled:bg-gray-700/50 disabled:cursor-not-allowed transition-colors"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={label}
      >
        <span className="flex items-center text-sm">
          {selectedOption?.icon && <span className="mr-2">{selectedOption.icon}</span>}
          {selectedOption?.label || 'Select...'}
        </span>
        <ChevronDown size={20} className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 max-h-60 overflow-y-auto animate-dropdown-in origin-top">
          <ul role="listbox" ref={listRef} aria-label={label}>
            {options.map((option, idx) => (
              <li
                key={String(option.value)}
                onClick={() => handleOptionClick(option.value)}
                onKeyDown={(e) => handleOptionKeyDown(e, idx, option.value)}
                tabIndex={0}
                className={`flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700 ${value === option.value ? 'font-semibold bg-gray-100 dark:bg-gray-700' : ''}`}
                role="option"
                aria-selected={value === option.value}
              >
                {option.icon && <span className="mr-2">{option.icon}</span>}
                {option.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;
