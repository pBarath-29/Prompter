import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { PromoCode } from '../types';
import { getData, setData, updateData, deleteData } from '../services/firebaseService';

interface PromoCodeContextType {
  promoCodes: PromoCode[];
  addPromoCode: (codeData: Omit<PromoCode, 'timesUsed' | 'createdAt'>) => Promise<void>;
  deletePromoCode: (codeId: string) => Promise<void>;
  validatePromoCode: (codeId: string) => Promise<{ success: boolean; message: string; discount: number }>;
  incrementPromoCodeUsage: (codeId: string) => Promise<void>;
}

const PromoCodeContext = createContext<PromoCodeContextType | undefined>(undefined);

export const PromoCodeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);

  useEffect(() => {
    const loadPromoCodes = async () => {
        try {
            const codesData = await getData<{ [key: string]: PromoCode }>('promoCodes');
            const codesArray = codesData ? Object.values(codesData).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) : [];
            setPromoCodes(codesArray);
        } catch (error) {
            console.error("Failed to load promo codes:", error);
            setPromoCodes([]);
        }
    }
    loadPromoCodes();
  }, []);

  const addPromoCode = async (codeData: Omit<PromoCode, 'timesUsed' | 'createdAt'>) => {
    const newCode: PromoCode = {
        ...codeData,
        id: codeData.id.toUpperCase(),
        timesUsed: 0,
        createdAt: new Date().toISOString(),
    };
    
    setPromoCodes(prev => [newCode, ...prev]);
    try {
        await setData(`promoCodes/${newCode.id}`, newCode);
    } catch (error) {
        setPromoCodes(prev => prev.filter(c => c.id !== newCode.id));
        throw error;
    }
  };

  const deletePromoCode = async (codeId: string) => {
    setPromoCodes(prev => prev.filter(c => c.id !== codeId));
    try {
        await deleteData(`promoCodes/${codeId}`);
    } catch (error) {
        // In a real app, might need to refetch or show error.
        console.error("Failed to delete promo code from DB:", error);
        throw error;
    }
  };
  
  const validatePromoCode = async (codeId: string): Promise<{ success: boolean; message: string; discount: number }> => {
    const code = promoCodes.find(c => c.id === codeId.toUpperCase());

    if (!code) {
      return { success: false, message: 'Invalid promotional code.', discount: 0 };
    }

    if (code.timesUsed >= code.usageLimit) {
      return { success: false, message: 'This promotional code has reached its usage limit.', discount: 0 };
    }
    
    return { success: true, message: `Success! ${code.discountPercentage}% discount applied.`, discount: code.discountPercentage / 100 };
  };

  const incrementPromoCodeUsage = async (codeId: string) => {
      const upperCaseCodeId = codeId.toUpperCase();
      const code = promoCodes.find(c => c.id === upperCaseCodeId);
      if (!code) return;

      const newTimesUsed = code.timesUsed + 1;
      
      setPromoCodes(prev => prev.map(c => c.id === upperCaseCodeId ? { ...c, timesUsed: newTimesUsed } : c));
      try {
          await updateData(`promoCodes/${upperCaseCodeId}`, { timesUsed: newTimesUsed });
      } catch (error) {
          console.error("Failed to increment promo code usage:", error);
          setPromoCodes(prev => prev.map(c => c.id === upperCaseCodeId ? { ...c, timesUsed: code.timesUsed } : c));
      }
  };
  
  return (
    <PromoCodeContext.Provider value={{ promoCodes, addPromoCode, deletePromoCode, validatePromoCode, incrementPromoCodeUsage }}>
      {children}
    </PromoCodeContext.Provider>
  );
};

export const usePromoCodes = (): PromoCodeContextType => {
  const context = useContext(PromoCodeContext);
  if (!context) {
    throw new Error('usePromoCodes must be used within a PromoCodeProvider');
  }
  return context;
};