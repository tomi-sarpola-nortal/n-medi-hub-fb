"use client";

import type { User, UserRole } from '@/lib/types';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, role: UserRole) => Promise<void>;
  logout: () => void;
  loading: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for simulation
const mockUsers: Record<UserRole, Omit<User, 'email'>> = {
  dentist: { id: 'dentist1', name: 'Dr. Max Mustermann', role: 'dentist', region: 'Vienna', profileImage: 'https://placehold.co/100x100.png', approved: true, educationPoints: 150 },
  lk_member: { id: 'lk_member1', name: 'LK Anna Schmidt', role: 'lk_member', region: 'Tyrol', profileImage: 'https://placehold.co/100x100.png' },
  ozak_employee: { id: 'ozak_employee1', name: 'ÖZÄK Peter Maier', role: 'ozak_employee', region: 'National', profileImage: 'https://placehold.co/100x100.png' },
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Simulate checking for an existing session
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, role: UserRole) => {
    setLoading(true);
    // Simulate API call for login / OTP verification
    await new Promise(resolve => setTimeout(resolve, 1000)); 
    const baseUser = mockUsers[role];
    const loggedInUser: User = { ...baseUser, email };
    setUser(loggedInUser);
    localStorage.setItem('currentUser', JSON.stringify(loggedInUser));
    setLoading(false);
    router.push('/dashboard');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    router.push('/login');
  };


  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
