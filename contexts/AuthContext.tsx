import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo } from 'react';
import { User as AppUser, BannedEmail } from '../types';
import { getCurrentMonthYear } from '../utils/dateUtils';
import { FREE_TIER_LIMIT, FREE_TIER_POST_LIMIT, PRO_TIER_POST_LIMIT } from '../config';
import { getData, setData, updateData, deleteData } from '../services/firebaseService';
import { auth, db } from '../services/firebase';
import { 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  sendEmailVerification,
  User as FirebaseUser,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser,
} from 'firebase/auth';
import { ref, onValue, Unsubscribe } from 'firebase/database';


interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  signup: (name: string, email: string, password?: string) => Promise<void>;
  logout: () => void;
  resendVerificationEmail: (user: FirebaseUser) => Promise<void>;
  updateUserProfile: (data: { bio?: string; avatar?: string }) => Promise<AppUser | null>;
  purchaseCollection: (collectionId: string) => void;
  addSubmittedPrompt: (promptId: string) => void;
  removeSubmittedPrompt: (promptId: string) => void;
  toggleSavePrompt: (promptId: string) => void;
  handleVote: (promptId: string, voteType: 'up' | 'down') => void;
  addCreatedCollection: (collectionId: string) => void;
  incrementGenerationCount: () => void;
  upgradeToPro: () => void;
  getGenerationsLeft: () => number;
  getSubmissionsLeft: () => number;
  incrementSubmissionCount: () => void;
  completeTutorial: () => void;
  cancelSubscription: () => void;
  getUserById: (userId: string) => Promise<AppUser | undefined>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
  updateUserThemePreference: (theme: 'light' | 'dark') => void;
  getAllUsers: () => Promise<AppUser[]>;
  updateUserStatus: (userId: string, status: 'active' | 'banned') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const checkAndResetGenerationCount = (currentUser: AppUser | null): AppUser | null => {
    if (!currentUser || currentUser.subscriptionTier === 'pro') return currentUser;

    const currentMonthYear = getCurrentMonthYear();

    if (currentUser.lastGenerationReset !== currentMonthYear) {
        return {
            ...currentUser,
            promptGenerations: 0,
            lastGenerationReset: currentMonthYear,
        };
    }
    return currentUser;
};

const checkAndResetSubmissionCount = (currentUser: AppUser | null): AppUser | null => {
    if (!currentUser) return currentUser;

    const today = new Date().toISOString().split('T')[0];

    if (currentUser.lastSubmissionDate !== today) {
        return {
            ...currentUser,
            promptsSubmittedToday: 0,
            lastSubmissionDate: today,
        };
    }
    return currentUser;
};

// Helper to sanitize email for Firebase keys
const sanitizeEmail = (email: string) => email.toLowerCase().replace(/\./g, ',');


// Helper to ensure user object is consistent, especially for users from older localStorage versions.
const normalizeUser = (userToNormalize: AppUser | any): AppUser | null => {
    if (!userToNormalize) return null;

    let normalizedUser = { ...userToNormalize };
    
    if (typeof normalizedUser.hasCompletedTutorial === 'undefined') {
        normalizedUser.hasCompletedTutorial = true;
    }

    if (typeof normalizedUser.votes === 'undefined') {
      normalizedUser.votes = {};
    }

    if (typeof normalizedUser.themePreference === 'undefined') {
        normalizedUser.themePreference = 'light';
    }

    if (typeof normalizedUser.status === 'undefined') {
      normalizedUser.status = 'active';
    }

    const userWithGenReset = checkAndResetGenerationCount(normalizedUser);
    const userWithSubReset = checkAndResetSubmissionCount(userWithGenReset);
    
    return userWithSubReset;
};


export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeFromDb: Unsubscribe | undefined;

    const unsubscribeFromAuth = onAuthStateChanged(auth, (firebaseUser) => {
      // When auth state changes, first unsubscribe from any existing database listener.
      if (unsubscribeFromDb) {
        unsubscribeFromDb();
      }

      if (firebaseUser && firebaseUser.emailVerified) {
        const userRef = ref(db, `users/${firebaseUser.uid}`);
        
        // Set up a new listener for the user's profile data.
        unsubscribeFromDb = onValue(userRef, (snapshot) => {
          const userProfile = snapshot.val();
          if (userProfile) {
            setUser(normalizeUser(userProfile));
          } else {
            // Edge case: auth user exists but no profile in DB. Safest to sign out.
            signOut(auth);
            setUser(null);
          }
          // Only set loading to false after we've got the profile data.
          setLoading(false);
        }, (error) => {
          console.error("Error fetching user profile:", error);
          setUser(null);
          setLoading(false);
        });
      } else {
        // User is not logged in or not verified.
        setUser(null);
        setLoading(false);
      }
    });

    // Cleanup function for the effect.
    return () => {
      unsubscribeFromAuth();
      if (unsubscribeFromDb) {
        unsubscribeFromDb();
      }
    };
  }, []);

  const login = useCallback(async (email: string, password?: string): Promise<void> => {
      if (!password) throw new Error("Password is required for login.");
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      if (!userCredential.user.emailVerified) {
        await signOut(auth);
        const error = new Error("Please verify your email before logging in. Check your inbox for the verification link.");
        (error as any).code = "auth/email-not-verified";
        (error as any).unverifiedUser = userCredential.user;
        throw error;
      }
      
      // The onAuthStateChanged listener will handle setting the user state.
  }, []);

  const signup = useCallback(async (name: string, email: string, password?: string): Promise<void> => {
      if (!password) throw new Error("Password is required for signup.");

      const sanitized = sanitizeEmail(email);
      const isBanned = await getData<BannedEmail>(`bannedEmails/${sanitized}`);
      if (isBanned) {
        throw new Error("This email address has been banned and cannot be used to create new accounts.");
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      await sendEmailVerification(firebaseUser);
      
      const isAdminByEmail = email.toLowerCase() === (process.env.ADMIN_EMAIL || '').toLowerCase();

      const newUser: AppUser = {
          id: firebaseUser.uid,
          name,
          email,
          avatar: `https://www.gravatar.com/avatar/?d=mp`,
          bio: "Hey there! I'm using Prompter.",
          submittedPrompts: [],
          purchasedCollections: [],
          savedPrompts: [],
          createdCollections: [],
          subscriptionTier: isAdminByEmail ? 'pro' : 'free',
          role: isAdminByEmail ? 'admin' : 'user',
          status: 'active',
          promptGenerations: isAdminByEmail ? 999 : 0,
          lastGenerationReset: getCurrentMonthYear(),
          promptsSubmittedToday: 0,
          lastSubmissionDate: new Date().toISOString().split('T')[0],
          hasCompletedTutorial: false,
          votes: {},
          themePreference: 'light',
      };
      
      await setData(`users/${firebaseUser.uid}`, newUser);
      await signOut(auth); // Force user to login after verifying email
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
  }, []);

  const resendVerificationEmail = useCallback(async (unverifiedUser: FirebaseUser) => {
    await sendEmailVerification(unverifiedUser);
  }, []);
  
  const updateUserProfile = useCallback(async (data: { bio?: string; avatar?: string }): Promise<AppUser | null> => {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      await updateData(`users/${user.id}`, data);
      return updatedUser;
    }
    return null;
  }, [user]);

  const purchaseCollection = useCallback((collectionId: string) => {
    if (user && !user.purchasedCollections?.includes(collectionId)) {
      const prev = user.purchasedCollections || [];
      const updatedCollections = [...prev, collectionId];
      setUser({ ...user, purchasedCollections: updatedCollections });
      updateData(`users/${user.id}`, { purchasedCollections: updatedCollections }).catch(err => {
        console.error("Failed to sync purchase", err);
        setUser(u => u ? { ...u, purchasedCollections: prev } : u);
      });
    }
  }, [user]);
  
  const addSubmittedPrompt = useCallback((promptId: string) => {
      if (user) {
          const prev = user.submittedPrompts || [];
          const updatedPrompts = [...prev, promptId];
          setUser({ ...user, submittedPrompts: updatedPrompts });
          updateData(`users/${user.id}`, { submittedPrompts: updatedPrompts }).catch(err => {
            console.error("Failed to sync submitted prompt", err);
            setUser(u => u ? { ...u, submittedPrompts: prev } : u);
          });
      }
  }, [user]);

  const removeSubmittedPrompt = useCallback((promptId: string) => {
    if (user) {
      const prev = user.submittedPrompts || [];
      const updatedPrompts = prev.filter(id => id !== promptId);
      setUser({ ...user, submittedPrompts: updatedPrompts });
      updateData(`users/${user.id}`, { submittedPrompts: updatedPrompts }).catch(err => {
        console.error("Failed to sync prompt removal", err);
        setUser(u => u ? { ...u, submittedPrompts: prev } : u);
      });
    }
  }, [user]);

  const toggleSavePrompt = useCallback((promptId: string) => {
    if (!user) return;
    
    const savedPrompts = user.savedPrompts || [];
    const isSaved = savedPrompts.includes(promptId);
    const newSavedPrompts = isSaved ? savedPrompts.filter(id => id !== promptId) : [...savedPrompts, promptId];
    
    setUser({ ...user, savedPrompts: newSavedPrompts });
    updateData(`users/${user.id}`, { savedPrompts: newSavedPrompts }).catch(err => {
      console.error("Failed to sync saved prompt", err);
      setUser(u => u ? { ...u, savedPrompts } : u);
    });
  }, [user]);

  const handleVote = useCallback((promptId: string, voteType: 'up' | 'down') => {
    if (!user) return;
    
    const currentVotes = { ...(user.votes || {}) };
    const currentVote = currentVotes[promptId];
    if (currentVote === voteType) delete currentVotes[promptId];
    else currentVotes[promptId] = voteType;
    
    const prevVotes = user.votes || {};
    setUser({ ...user, votes: currentVotes });
    updateData(`users/${user.id}`, { votes: currentVotes }).catch(err => {
      console.error("Failed to sync vote", err);
      setUser(u => u ? { ...u, votes: prevVotes } : u);
    });
  }, [user]);

  const addCreatedCollection = useCallback((collectionId: string) => {
    if (user) {
      const updatedCollections = [...(user.createdCollections || []), collectionId];
      const prevCollections = user.createdCollections || [];
      setUser({ ...user, createdCollections: updatedCollections });
      updateData(`users/${user.id}`, { createdCollections: updatedCollections }).catch(err => {
        console.error("Failed to sync created collection", err);
        setUser(u => u ? { ...u, createdCollections: prevCollections } : u);
      });
    }
  }, [user]);

  const getGenerationsLeft = useCallback((): number => {
    if (!user || user.subscriptionTier === 'pro') return Infinity;
    const currentMonthYear = getCurrentMonthYear();
    const generations = user.lastGenerationReset === currentMonthYear ? user.promptGenerations : 0;
    return FREE_TIER_LIMIT - generations;
  }, [user]);

  const incrementGenerationCount = useCallback(() => {
    if (user && user.subscriptionTier === 'free') {
      const currentMonthYear = getCurrentMonthYear();
      let currentGenerations = user.lastGenerationReset === currentMonthYear ? user.promptGenerations : 0;
      const updatedUser = { ...user, promptGenerations: currentGenerations + 1, lastGenerationReset: currentMonthYear };
      setUser(updatedUser);
      updateData(`users/${user.id}`, { promptGenerations: updatedUser.promptGenerations, lastGenerationReset: updatedUser.lastGenerationReset });
    }
  }, [user]);

  const upgradeToPro = useCallback(() => {
    if (user) {
      const updatedUser = {
        ...user,
        subscriptionTier: 'pro' as const,
        promptGenerations: 0, // Reset as it's not needed for Pro
        lastGenerationReset: '', // Reset as it's not needed for Pro
      };
      setUser(updatedUser);
      updateData(`users/${user.id}`, {
        subscriptionTier: 'pro',
        promptGenerations: 0,
        lastGenerationReset: ''
      });
    }
  }, [user]);

  const cancelSubscription = useCallback(() => {
    if (user && user.subscriptionTier === 'pro') {
        setUser({ ...user, subscriptionTier: 'free' });
        updateData(`users/${user.id}`, { subscriptionTier: 'free' });
    }
  }, [user]);

  const getSubmissionsLeft = useCallback((): number => {
    if (!user) return 0;
    const limit = user.subscriptionTier === 'pro' ? PRO_TIER_POST_LIMIT : FREE_TIER_POST_LIMIT;
    const today = new Date().toISOString().split('T')[0];
    const submissions = user.lastSubmissionDate === today ? user.promptsSubmittedToday : 0;
    return limit - submissions;
  }, [user]);

  const incrementSubmissionCount = useCallback(() => {
    if (user) {
      const today = new Date().toISOString().split('T')[0];
      const currentSubmissions = user.lastSubmissionDate === today ? user.promptsSubmittedToday : 0;
      const updatedUser = { ...user, promptsSubmittedToday: currentSubmissions + 1, lastSubmissionDate: today };
      setUser(updatedUser);
      updateData(`users/${user.id}`, { promptsSubmittedToday: updatedUser.promptsSubmittedToday, lastSubmissionDate: updatedUser.lastSubmissionDate });
    }
  }, [user]);

  const completeTutorial = useCallback(() => {
      if (user) {
          setUser({ ...user, hasCompletedTutorial: true });
          updateData(`users/${user.id}`, { hasCompletedTutorial: true });
      }
  }, [user]);
  
  const getUserById = useCallback(async (userId: string): Promise<AppUser | undefined> => {
      const user = await getData<AppUser>(`users/${userId}`);
      return user || undefined;
  }, []);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser || !firebaseUser.email) {
        throw new Error("No user is currently signed in or user email is not available.");
    }
    
    const credential = EmailAuthProvider.credential(firebaseUser.email, currentPassword);
    
    // Re-authenticate the user to ensure they know their current password
    await reauthenticateWithCredential(firebaseUser, credential);
    
    // If re-authentication is successful, update the password
    await updatePassword(firebaseUser, newPassword);
  }, []);

  const deleteAccount = useCallback(async (password: string) => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser || !firebaseUser.email) {
        throw new Error("No user is currently signed in.");
    }
    
    const credential = EmailAuthProvider.credential(firebaseUser.email, password);
    
    // Re-authenticate before sensitive operation
    await reauthenticateWithCredential(firebaseUser, credential);
    
    const appUser = await getData<AppUser>(`users/${firebaseUser.uid}`);
    if (appUser?.status === 'banned') {
      const sanitized = sanitizeEmail(appUser.email);
      const bannedEmail: BannedEmail = { email: appUser.email, bannedAt: new Date().toISOString() };
      await setData(`bannedEmails/${sanitized}`, bannedEmail);
    }

    // Delete user's DB records
    await deleteData(`users/${firebaseUser.uid}`);
    await deleteData(`user-history/${firebaseUser.uid}`);
    
    // Finally, delete the auth user
    await deleteUser(firebaseUser); // This will trigger onAuthStateChanged
  }, []);

  const updateUserThemePreference = useCallback((theme: 'light' | 'dark') => {
    if (user) {
      const updatedUser = { ...user, themePreference: theme };
      setUser(updatedUser);
      const prevTheme = user.themePreference;
      updateData(`users/${user.id}`, { themePreference: theme }).catch(err => {
        console.error("Failed to sync theme preference", err);
        setUser(u => u ? { ...u, themePreference: prevTheme } : u);
      });
    }
  }, [user]);

  const getAllUsers = useCallback(async (): Promise<AppUser[]> => {
    const usersData = await getData<{ [key: string]: AppUser }>('users');
    return usersData ? Object.values(usersData) : [];
  }, []);

  const updateUserStatus = useCallback(async (userId: string, status: 'active' | 'banned') => {
    await updateData(`users/${userId}`, { status });
  }, []);

  const contextValue = useMemo(() => ({
    user,
    loading,
    login,
    signup,
    logout,
    resendVerificationEmail,
    updateUserProfile,
    purchaseCollection,
    addSubmittedPrompt,
    removeSubmittedPrompt,
    toggleSavePrompt,
    handleVote,
    addCreatedCollection,
    incrementGenerationCount,
    upgradeToPro,
    getGenerationsLeft,
    getSubmissionsLeft,
    incrementSubmissionCount,
    completeTutorial,
    cancelSubscription,
    getUserById,
    changePassword,
    deleteAccount,
    updateUserThemePreference,
    getAllUsers,
    updateUserStatus,
  }), [
    user,
    loading,
    login,
    signup,
    logout,
    resendVerificationEmail,
    updateUserProfile,
    purchaseCollection,
    addSubmittedPrompt,
    removeSubmittedPrompt,
    toggleSavePrompt,
    handleVote,
    addCreatedCollection,
    incrementGenerationCount,
    upgradeToPro,
    getGenerationsLeft,
    getSubmissionsLeft,
    incrementSubmissionCount,
    completeTutorial,
    cancelSubscription,
    getUserById,
    changePassword,
    deleteAccount,
    updateUserThemePreference,
    getAllUsers,
    updateUserStatus
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
