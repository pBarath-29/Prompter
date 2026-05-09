import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { HistoryItem } from '../types';
import { useAuth } from './AuthContext';
import { getData, setData } from '../services/firebaseService';

interface HistoryContextType {
  history: HistoryItem[];
  addToHistory: (promptData: { title: string; prompt: string; tags: string[] }) => void;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export const HistoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const loadHistory = async () => {
      if (user) {
        try {
          const userHistory = await getData<HistoryItem[] | { [key: string]: HistoryItem }>(`user-history/${user.id}`);
          if (userHistory) {
            const historyArray = Array.isArray(userHistory) ? userHistory : Object.values(userHistory);
            const sortedHistory = historyArray.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setHistory(sortedHistory);
          } else {
            setHistory([]);
          }
        } catch (error) {
          console.error("Failed to load user history from Firebase", error);
          setHistory([]);
        }
      } else {
        // User logged out, clear history
        setHistory([]);
      }
    };

    loadHistory();
  }, [user]);

  const addToHistory = (promptData: { title: string; prompt: string; tags: string[] }) => {
    if (!user) return; // Don't add history for non-logged-in users

    const newItem: HistoryItem = {
      id: `hist-${Date.now()}`,
      ...promptData,
      createdAt: new Date().toISOString(),
    };

    const MAX_HISTORY = 100;
    const newHistory = [newItem, ...history].slice(0, MAX_HISTORY);
    setHistory(newHistory);

    // Save to Firebase
    setData(`user-history/${user.id}`, newHistory).catch(error => {
      console.error("Failed to save history to Firebase", error);
      // Revert state on failure
      setHistory(history);
    });
  };

  return (
    <HistoryContext.Provider value={{ history, addToHistory }}>
      {children}
    </HistoryContext.Provider>
  );
};

export const useHistory = (): HistoryContextType => {
  const context = useContext(HistoryContext);
  if (!context) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
};
