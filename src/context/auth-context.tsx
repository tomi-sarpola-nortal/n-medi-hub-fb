
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
  register: (formData: RegistrationFormData) => Promise<{ success: boolean; error?: string; userId?: string }>;
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

  const register = async (formData: RegistrationFormData): Promise<{ success: boolean; error?: string; userId?: string }> => {
    if (!formData.password) {
      return { success: false, error: "Password is required for registration." };
    }
    setLoading(true);
    try {
      // Step 1: Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const firebaseUser = userCredential.user;

      // Step 2: Create user profile in Firestore
      // Prepare data for Firestore, excluding password
      const personDataToCreate: PersonCreationData & { email: string } = {
        name: formData.name,
        email: formData.email, // Store email in Firestore for easier querying/display
        role: formData.role,
        region: formData.region,
        dentistId: formData.dentistId,
        avatarUrl: formData.avatarUrl || `https://avatar.vercel.sh/${formData.email}.png?size=100`, // Default avatar
        status: formData.status || 'pending_approval', // Default status
        otpEnabled: formData.otpEnabled || false,
        // otpSecret will be handled if/when OTP is fully implemented
      };

      await createPerson(firebaseUser.uid, personDataToCreate);
      
      // onAuthStateChanged will handle setting the user from Firestore
      // For immediate UI update, we can manually set user if needed, but onAuthStateChanged is preferred for consistency
      // const newPersonProfile = await getPersonById(firebaseUser.uid);
      // if (newPersonProfile) setUser(newPersonProfile);

      setLoading(false);
      router.push('/dashboard'); // Redirect after successful registration
      return { success: true, userId: firebaseUser.uid };
    } catch (error: any) {
      console.error("Registration error:", error);
      setLoading(false);
      // Clean up Firebase Auth user if Firestore profile creation fails?
      // This is complex. For now, just return error.
      // if (auth.currentUser && error.code !== 'auth/email-already-in-use') {
      //   await auth.currentUser.delete();
      // }
      return { success: false, error: error.message || "Failed to register." };
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
    <AuthContext.Provider value={{ user, isAuthenticated: !!user && !loading, login, register, logout, loading, setUser }}>
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
