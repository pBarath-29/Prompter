import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Collection, User } from '../types';
import { getData, getRecentData, setData, updateData, deleteData, performMultiPathUpdate } from '../services/firebaseService';

interface CollectionContextType {
  collections: Collection[];
  collectionsLoading: boolean;
  addCollection: (collection: Collection) => void;
  updateCollectionStatus: (collectionId: string, status: 'approved' | 'rejected') => void;
  deleteCollection: (collectionId: string) => void;
  anonymizeUserCollections: (userId: string) => Promise<void>;
  propagateUserUpdates: (updatedUser: User) => Promise<void>;
}

const CollectionContext = createContext<CollectionContextType | undefined>(undefined);

export const CollectionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [collectionsLoading, setCollectionsLoading] = useState(true);

  useEffect(() => {
    const loadCollections = async () => {
        setCollectionsLoading(true);
        try {
            const collectionsData = await getData<{ [key: string]: Collection }>('collections');
            const collectionsArray = collectionsData ? Object.values(collectionsData) : [];
            setCollections(collectionsArray);
        } catch (error) {
            console.error("Failed to load collections:", error);
            setCollections([]);
        } finally {
            setCollectionsLoading(false);
        }
    }
    loadCollections();
  }, []);

  const addCollection = (collection: Collection) => {
    setCollections(prevCollections => [collection, ...prevCollections]);
    setData(`collections/${collection.id}`, collection).catch(error => {
        console.error("Failed to add collection to DB:", error);
        setCollections(prevCollections => prevCollections.filter(c => c.id !== collection.id));
    });
  };

  const updateCollectionStatus = (collectionId: string, status: 'approved' | 'rejected') => {
    setCollections(prevCollections =>
      prevCollections.map(c => (c.id === collectionId ? { ...c, status } : c))
    );
    updateData(`collections/${collectionId}`, { status }).catch(error => console.error("Failed to update collection status:", error));
  };
  
  const deleteCollection = (collectionId: string) => {
    setCollections(prevCollections => prevCollections.filter(c => c.id !== collectionId));
    deleteData(`collections/${collectionId}`).catch(error => console.error("Failed to delete collection:", error));
  };


  const anonymizeUserCollections = async (userId: string) => {
    const userCollections = collections.filter(c => c.creator.id === userId);
    if (userCollections.length === 0) return;

    const anonymizedCreator: User = {
        id: 'deleted-user',
        name: 'Deleted User',
        email: '',
        avatar: 'https://www.gravatar.com/avatar/?d=mp',
        subscriptionTier: 'free',
        role: 'user',
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

    const updatePromises = userCollections.map(collection => 
        updateData(`collections/${collection.id}`, { creator: anonymizedCreator })
    );
    
    await Promise.all(updatePromises);

    setCollections(prev => 
        prev.map(c => 
            c.creator.id === userId ? { ...c, creator: anonymizedCreator } : c
        )
    );
  };

  const propagateUserUpdates = async (updatedUser: User) => {
    const updates: { [key: string]: any } = {};
    let needsStateUpdate = false;

    const newCollections = collections.map(c => {
        if (c.creator.id === updatedUser.id) {
            needsStateUpdate = true;
            // Replace the entire stale creator object with the fresh, updated user object.
            updates[`/collections/${c.id}/creator`] = updatedUser;
            return { ...c, creator: updatedUser };
        }
        return c;
    });

    if (needsStateUpdate) {
        setCollections(newCollections);
        try {
            await performMultiPathUpdate(updates);
        } catch (error) {
            console.error("Failed to propagate user updates to collections.", error);
            // In a real app, you might want to revert the state change here.
        }
    }
  };


  return (
    <CollectionContext.Provider value={{ collections, collectionsLoading, addCollection, updateCollectionStatus, deleteCollection, anonymizeUserCollections, propagateUserUpdates }}>
      {children}
    </CollectionContext.Provider>
  );
};

export const useCollections = (): CollectionContextType => {
  const context = useContext(CollectionContext);
  if (!context) {
    throw new Error('useCollections must be used within a CollectionProvider');
  }
  return context;
};