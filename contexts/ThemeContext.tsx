import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, updateUserThemePreference } = useAuth();
  const [theme, setTheme] = useState<Theme>('light'); // Start with a default

  // This effect syncs theme changes to the DOM.
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  // This effect sets the initial theme and updates it when the user logs in/out.
  useEffect(() => {
    if (user) {
      // User is logged in, use their preference. Default to 'light' if not set.
      setTheme(user.themePreference || 'light');
    } else {
      // User is logged out, use localStorage. Default to 'light'.
      const savedTheme = localStorage.getItem('theme') as Theme;
      setTheme(savedTheme || 'light');
    }
  }, [user]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme); // Update local state for immediate UI change.
    
    if (user) {
      updateUserThemePreference(newTheme); // Persist to backend for logged-in user.
    } else {
      localStorage.setItem('theme', newTheme); // Persist to localStorage for logged-out user.
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};