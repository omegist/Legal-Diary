import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LawyerProfile, PartnerProfile } from '@/types';
import { getCurrentUser, setCurrentUser as setStorageUser, logout as storageLogout } from '@/lib/storage';

interface AuthContextType {
  user: LawyerProfile | PartnerProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: LawyerProfile | PartnerProfile | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<LawyerProfile | PartnerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = getCurrentUser();
    setUserState(storedUser);
    setIsLoading(false);
  }, []);

  const setUser = (newUser: LawyerProfile | PartnerProfile | null) => {
    setUserState(newUser);
    setStorageUser(newUser);
  };

  const logout = () => {
    storageLogout();
    setUserState(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        setUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
