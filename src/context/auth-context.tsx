
"use client";

import type { Person } from '@/lib/types';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebaseConfig';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  type User as FirebaseUser // Alias to avoid naming conflict
} from 'firebase/auth';
import { getPersonById } from '@/services/personService';

interface AuthContextType {
  user: Person | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  deleteUserAccount: () => Promise<{ success: boolean; error?: string }>;
  sendPasswordReset: (email: string, locale?: string) => Promise<{ success: boolean; error?: string }>;
  loading: boolean;
  setUser: React.Dispatch<React.SetStateAction<Person | null>>; // Exposing setUser for flexibility e.g. profile updates
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Person | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // If auth is not configured, don't attempt to listen for state changes.
    if (!auth) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        const personProfile = await getPersonById(firebaseUser.uid);
        if (personProfile) {
          setUser(personProfile);
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
    if (!auth) {
      const error = "Firebase is not configured. Please check your environment variables.";
      return { success: false, error };
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // After successful authentication, fetch the user profile to check status
      const personProfile = await getPersonById(firebaseUser.uid);
      
      if (personProfile?.status === 'inactive') {
          await signOut(auth); // Log out the user
          return { success: false, error: "login_error_inactive" };
      }

      // Pending users are allowed to log in. The redirect logic is handled on the client-side (e.g., in DashboardPage).
      return { success: true };
    } catch (error: any) {
      console.error("Login error:", error);
      let errorMessage: string;
      switch (error.code) {
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
        case 'auth/user-not-found':
        case 'auth/invalid-email':
          errorMessage = "The email or password you entered is incorrect. Please try again.";
          break;
        case 'auth/internal-error':
          errorMessage = "An internal authentication error occurred. Please check that your Firebase project configuration is correct and that the Email/Password sign-in provider is enabled in the Firebase console.";
          break;
        default:
          errorMessage = "An unexpected error occurred during login. Please try again later.";
          break;
      }
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    if (!auth) {
      console.error("Firebase is not configured. Cannot log out.");
      return;
    }

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
  
  const sendPasswordReset = async (email: string, locale: string = 'en'): Promise<{ success: boolean; error?: string }> => {
    if (!auth) {
        return { success: false, error: "Firebase is not configured." };
    }
    try {
        const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:9002'; // Fallback for server-side
        const actionCodeSettings = {
          url: `${origin}/${locale}/login`, // Redirect user back to the login page after reset
          handleCodeInApp: true,
        };
        await sendPasswordResetEmail(auth, email, actionCodeSettings);
        console.log(`Password reset email initiated successfully from the app for: ${email}`);
        return { success: true };
    } catch (error: any) {
        console.error("Firebase SDK Password Reset Error:", {
            code: error.code,
            message: error.message,
        });
        return { success: false, error: error.message };
    }
  };

  const deleteUserAccount = async (): Promise<{ success: boolean; error?: string }> => {
    if (!auth || !auth.currentUser) {
        return { success: false, error: "No user is currently logged in." };
    }

    const userId = auth.currentUser.uid;
    const idToken = await auth.currentUser.getIdToken();

    try {
        setLoading(true);

        const response = await fetch(`https://deleteuserdata-dsey7ysrrq-uc.a.run.app/${userId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${idToken}`
            }
        });

        if (!response.ok) {
            // Try to parse error message from the API if available
            const errorData = await response.json().catch(() => ({ message: `API request failed with status ${response.status}` }));
            throw new Error(errorData.message);
        }

        // If the API call is successful, it means the user is deleted on the backend.
        // Sign the user out on the client to complete the process.
        await signOut(auth);
        setUser(null);
        router.push('/login');
        
        return { success: true };

    } catch (error: any) {
        console.error("Account deletion failed via API:", error);
        return { success: false, error: error.message || "An unexpected error occurred during account deletion." };
    } finally {
        setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user && !loading, login, logout, sendPasswordReset, deleteUserAccount, loading, setUser }}>
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
