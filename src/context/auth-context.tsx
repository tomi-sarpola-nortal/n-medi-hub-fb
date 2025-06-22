
"use client";

import type { User, UserRole, RegistrationFormData, PersonCreationData } from '@/lib/types';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebaseConfig';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  type User as FirebaseUser // Alias to avoid naming conflict
} from 'firebase/auth';
import { getPersonById, createPerson, findPersonByEmail } from '@/services/personService'; // findPersonByEmail for seeding if needed

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  loading: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>; // Exposing setUser for flexibility e.g. profile updates
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        const personProfile = await getPersonById(firebaseUser.uid);
        if (personProfile) {
          setUser(personProfile); // Our User type matches Person structure
        } else {
          // This case might happen if Firestore document creation failed after auth user creation
          // Or if it's a new user whose profile isn't created yet (should be handled during registration)
          console.warn(`No Firestore profile found for UID: ${firebaseUser.uid}. Logging out.`);
          await signOut(auth); // Log out to prevent inconsistent state
          setUser(null);
        }
      } else {
        // User is signed out
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged will handle setting the user state after fetching profile
      // No need to manually setUser here if onAuthStateChanged is robust
      setLoading(false);
      router.push('/dashboard'); // Redirect after successful login
      return { success: true };
    } catch (error: any) {
      console.error("Login error:", error);
      setLoading(false);
      return { success: false, error: error.message || "Failed to login." };
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      // onAuthStateChanged will set user to null
      router.push('/login'); // Redirect to login page after logout
    } catch (error: any) {
      console.error("Logout error:", error);
    } finally {
        setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user && !loading, login, logout, loading, setUser }}>
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
