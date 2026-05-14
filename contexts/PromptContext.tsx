import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import { Prompt, Comment, User } from '../types';
import { getData, getRecentData, setData, updateData, deleteData, performMultiPathUpdate } from '../services/firebaseService';
import { auth } from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface PromptContextType {
  prompts: Prompt[];
  promptsLoading: boolean;
  addPrompt: (prompt: Prompt) => void;
  updatePrompt: (updatedPrompt: Prompt) => void;
  deletePrompt: (promptId: string) => void;
  handlePromptVote: (promptId: string, voteType: 'up' | 'down', previousVote?: 'up' | 'down' | null) => void;
  addComment: (promptId: string, comment: { author: User; text: string }) => void;
  updatePromptStatus: (promptId: string, status: 'approved' | 'rejected') => void;
  anonymizeUserPrompts: (userId: string) => Promise<void>;
  propagateUserUpdates: (updatedUser: User) => Promise<void>;
}

const PromptContext = createContext<PromptContextType | undefined>(undefined);

export const PromptProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [promptsLoading, setPromptsLoading] = useState(true);
  const hasLoaded = useRef(false);

  useEffect(() => {
    const loadPrompts = async () => {
      setPromptsLoading(true);
      try {
        const promptsData = await getData<{ [key: string]: Prompt }>('prompts');
        const promptsArray = promptsData
          ? Object.values(promptsData).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          : [];
        setPrompts(promptsArray);
      } catch (error) {
        console.error("Failed to load prompts:", error);
        setPrompts([]);
      } finally {
        setPromptsLoading(false);
      }
    };

    // Wait for Firebase auth to be confirmed before fetching.
    // Without this, the fetch fires before auth is restored on a new device,
    // the security rules reject it (auth == null), and the list stays empty.
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser && !hasLoaded.current) {
        hasLoaded.current = true;
        loadPrompts();
      } else if (!firebaseUser) {
        hasLoaded.current = false;
        setPrompts([]);
        setPromptsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const addPrompt = (prompt: Prompt) => {
    // Optimistic update
    setPrompts(prevPrompts => [prompt, ...prevPrompts]);
    setData(`prompts/${prompt.id}`, prompt).catch(error => {
        console.error("Failed to add prompt to DB:", error);
        // Revert state if API call fails
        setPrompts(prevPrompts => prevPrompts.filter(p => p.id !== prompt.id));
    });
  };
  
  const updatePrompt = (updatedPrompt: Prompt) => {
    setPrompts(prevPrompts =>
      prevPrompts.map(p => (p.id === updatedPrompt.id ? updatedPrompt : p))
    );
    updateData(`prompts/${updatedPrompt.id}`, updatedPrompt).catch(error => console.error("Failed to update prompt:", error));
  };

  const deletePrompt = (promptId: string) => {
    setPrompts(prevPrompts => prevPrompts.filter(p => p.id !== promptId));
    deleteData(`prompts/${promptId}`).catch(error => console.error("Failed to delete prompt:", error));
  };

  const handlePromptVote = (promptId: string, voteType: 'up' | 'down', previousVote?: 'up' | 'down' | null) => {
    const originalPrompts = [...prompts];
    const updatedPrompts = prompts.map(p => {
        if (p.id === promptId) {
            let newUpvotes = p.upvotes;
            let newDownvotes = p.downvotes;
            if (previousVote === 'up') newUpvotes--;
            if (previousVote === 'down') newDownvotes--;
            if (previousVote !== voteType) {
                if (voteType === 'up') newUpvotes++;
                if (voteType === 'down') newDownvotes++;
            }
            const updatedPrompt = { ...p, upvotes: Math.max(0, newUpvotes), downvotes: Math.max(0, newDownvotes) };
            updateData(`prompts/${promptId}`, { upvotes: updatedPrompt.upvotes, downvotes: updatedPrompt.downvotes }).catch(err => {
                console.error("Failed to sync vote:", err);
                setPrompts(originalPrompts); // Revert on failure
            });
            return updatedPrompt;
        }
        return p;
    });
    setPrompts(updatedPrompts);
  };

  const addComment = (promptId: string, comment: { author: User; text: string }) => {
    const newComment: Comment = {
      ...comment,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    
    const originalPrompts = [...prompts];
    const updatedPrompts = prompts.map(p => {
        if (p.id === promptId) {
            const updatedComments = [newComment, ...(p.comments || [])];
            const updatedPrompt = { ...p, comments: updatedComments };
            updateData(`prompts/${promptId}`, { comments: updatedComments }).catch(err => {
                console.error("Failed to sync comment:", err);
                setPrompts(originalPrompts); // Revert
            });
            return updatedPrompt;
        }
        return p;
    });
    setPrompts(updatedPrompts);
  };

  const updatePromptStatus = (promptId: string, status: 'approved' | 'rejected') => {
    setPrompts(prevPrompts =>
      prevPrompts.map(p => (p.id === promptId ? { ...p, status } : p))
    );
    updateData(`prompts/${promptId}`, { status }).catch(error => console.error("Failed to update prompt status:", error));
  };
  
  const anonymizeUserPrompts = async (userId: string) => {
    const userPrompts = prompts.filter(p => p.author.id === userId);
    if (userPrompts.length === 0) return;

    const anonymizedAuthor: User = {
        id: 'deleted-user',
        name: 'Deleted User',
        email: '',
        avatar: 'https://www.gravatar.com/avatar/?d=mp',
        subscriptionTier: 'free',
        role: 'user',
        // FIX: Added missing 'status' property to conform to the User type.
        status: 'active',
        bio: '',
        submittedPrompts: [],
        purchasedCollections: [],
        savedPrompts: [],
        createdCollections: [],
        promptGenerations: 0,
        lastGenerationReset: '',
        promptsSubmittedToday: 0,
        lastSubmissionDate: '',
        hasCompletedTutorial: true,
        votes: {},
        themePreference: 'light',
    };

    const updatePromises = userPrompts.map(prompt => 
        updateData(`prompts/${prompt.id}`, { author: anonymizedAuthor })
    );

    await Promise.all(updatePromises);

    setPrompts(prevPrompts => 
        prevPrompts.map(p => 
            p.author.id === userId ? { ...p, author: anonymizedAuthor } : p
        )
    );
  };

  const propagateUserUpdates = async (updatedUser: User) => {
    const updates: { [key: string]: any } = {};
    let needsStateUpdate = false;

    const newPrompts = prompts.map(p => {
        let promptWasModified = false;
        let newAuthor = p.author;
        let newComments = p.comments;

        if (p.author.id === updatedUser.id) {
            // Replace the entire stale author object with the fresh, updated user object.
            newAuthor = updatedUser;
            updates[`/prompts/${p.id}/author`] = updatedUser;
            promptWasModified = true;
        }

        if (p.comments && p.comments.length > 0) {
            let commentsWereModified = false;
            const updatedCommentsList = p.comments.map((comment, index) => {
                if (comment.author.id === updatedUser.id) {
                    commentsWereModified = true;
                    // Replace the stale author object on the comment.
                    updates[`/prompts/${p.id}/comments/${index}/author`] = updatedUser;
                    return { ...comment, author: updatedUser };
                }
                return comment;
            });
            
            if (commentsWereModified) {
                newComments = updatedCommentsList;
                promptWasModified = true;
            }
        }
        
        if (promptWasModified) {
            needsStateUpdate = true;
            return { ...p, author: newAuthor, comments: newComments };
        }
        return p;
    });

    if (needsStateUpdate) {
        setPrompts(newPrompts);
        try {
            await performMultiPathUpdate(updates);
        } catch (error) {
            console.error("Failed to propagate user updates to prompts.", error);
            // In a real app, you might want to revert the state change here.
        }
    }
  };


  return (
    <PromptContext.Provider value={{ prompts, promptsLoading, addPrompt, updatePrompt, deletePrompt, handlePromptVote, addComment, updatePromptStatus, anonymizeUserPrompts, propagateUserUpdates }}>
      {children}
    </PromptContext.Provider>
  );
};

export const usePrompts = (): PromptContextType => {
  const context = useContext(PromptContext);
  if (!context) {
    throw new Error('usePrompts must be used within a PromptProvider');
  }
  return context;
};
