import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { FeedbackItem, User } from '../types';
import { getData, setData, pushData, updateData, deleteData, performMultiPathUpdate } from '../services/firebaseService';

interface FeedbackContextType {
  feedback: FeedbackItem[];
  addFeedback: (newFeedback: Omit<FeedbackItem, 'id' | 'createdAt' | 'status'>) => void;
  updateFeedbackStatus: (feedbackId: string, status: 'pending' | 'reviewed') => void;
  deleteUserFeedback: (userId: string) => Promise<void>;
  deleteFeedback: (feedbackId: string) => void;
  propagateUserUpdates: (updatedUser: User) => Promise<void>;
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

export const FeedbackProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  
  useEffect(() => {
    const loadFeedback = async () => {
        try {
            const feedbackData = await getData<{ [key: string]: FeedbackItem }>('feedback');
            const feedbackArray = feedbackData ? Object.values(feedbackData).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) : [];
            setFeedback(feedbackArray);
        } catch (error) {
            console.error("Failed to load feedback:", error);
            setFeedback([]);
        }
    }
    loadFeedback();
  }, []);


  const addFeedback = async (newFeedback: Omit<FeedbackItem, 'id' | 'createdAt' | 'status'>) => {
    const feedbackItem: Omit<FeedbackItem, 'id'> = {
      ...newFeedback,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };
    
    try {
        const response = await pushData('feedback', feedbackItem);
        const newId = response.key;
        if (!newId) throw new Error("Failed to get new key from Firebase");
        const finalFeedbackItem = { ...feedbackItem, id: newId };
        await updateData(`feedback/${newId}`, { id: newId });
        setFeedback(prevFeedback => [finalFeedbackItem, ...prevFeedback]);
    } catch (error) {
        console.error("Failed to add feedback to DB:", error);
    }
  };
  
  const updateFeedbackStatus = (feedbackId: string, status: 'pending' | 'reviewed') => {
    setFeedback(prevFeedback =>
      prevFeedback.map(f => (f.id === feedbackId ? { ...f, status } : f))
    );
    updateData(`feedback/${feedbackId}`, { status }).catch(error => console.error("Failed to update feedback status:", error));
  };

  const deleteFeedback = (feedbackId: string) => {
    const originalFeedback = [...feedback];
    setFeedback(prevFeedback => prevFeedback.filter(f => f.id !== feedbackId));
    deleteData(`feedback/${feedbackId}`).catch(error => {
        console.error("Failed to delete feedback:", error);
        setFeedback(originalFeedback);
    });
  };

  const deleteUserFeedback = async (userId: string) => {
    const userFeedback = feedback.filter(f => f.user.id === userId);
    if (userFeedback.length === 0) return;

    const deletePromises = userFeedback.map(f => deleteData(`feedback/${f.id}`));

    await Promise.all(deletePromises);

    setFeedback(prev => prev.filter(f => f.user.id !== userId));
  };

  const propagateUserUpdates = async (updatedUser: User) => {
    const updates: { [key: string]: any } = {};
    let needsStateUpdate = false;

    const newFeedback = feedback.map(f => {
        if (f.user.id === updatedUser.id) {
            needsStateUpdate = true;
            // Replace the entire stale user object with the fresh, updated user object.
            updates[`/feedback/${f.id}/user`] = updatedUser;
            return { ...f, user: updatedUser };
        }
        return f;
    });
    
    if (needsStateUpdate) {
        setFeedback(newFeedback);
        try {
            await performMultiPathUpdate(updates);
        } catch (error) {
            console.error("Failed to propagate user updates to feedback.", error);
            // In a real app, you might want to revert the state change here.
        }
    }
  };


  return (
    <FeedbackContext.Provider value={{ feedback, addFeedback, updateFeedbackStatus, deleteUserFeedback, deleteFeedback, propagateUserUpdates }}>
      {children}
    </FeedbackContext.Provider>
  );
};

export const useFeedback = (): FeedbackContextType => {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedback must be used within a FeedbackProvider');
  }
  return context;
};