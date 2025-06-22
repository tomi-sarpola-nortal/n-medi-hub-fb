
"use client";

import type { Person } from '@/lib/types';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebaseConfig';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  deleteUser,
  type User as FirebaseUser // Alias to avoid naming conflict
} from 'firebase/auth';
import { getPersonById, deletePerson } from '@/services/personService';
import { deleteFileByUrl } from '@/services/storageService';

interface AuthContextType {
  user: Person | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  deleteUserAccount: () => Promise<{ success: boolean; error?: string }>;
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
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged will handle setting the user state.
      // The component calling login will handle UI changes (loading state, redirect).
      return { success: true };
    } catch (error: any) {
      console.error("Login error:", error);
      let errorMessage: string;
      switch (error.code) {
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
        case 'auth/user-not-found':
        case 'auth/invalid-email':
          errorMessage = "Invalid email or password. Please try again.";
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

  const deleteUserAccount = async (): Promise<{ success: boolean; error?: string }> => {
    if (!auth?.currentUser || !user) {
        return { success: false, error: "No user is currently logged in." };
    }

    const firebaseUser = auth.currentUser;
    const userDataForCleanup = user; // Capture user data before any operations

    try {
        setLoading(true);

        // 1. Attempt to delete the Auth User FIRST. This is the critical operation that might require re-authentication.
        await deleteUser(firebaseUser);
        console.log("Firebase Auth user deleted successfully.");

        // 2. If Auth deletion succeeds, proceed to delete Firestore Document and Storage files.
        // These operations are less likely to fail and don't require re-authentication.
        try {
            await deletePerson(userDataForCleanup.id);
            console.log("User document deleted from Firestore.");

            const filesToDelete = [
                userDataForCleanup.idDocumentUrl,
                userDataForCleanup.diplomaUrl,
                userDataForCleanup.approbationCertificateUrl,
                userDataForCleanup.specialistRecognitionUrl,
            ].filter(Boolean) as string[];

            if (filesToDelete.length > 0) {
                await Promise.all(filesToDelete.map(url => deleteFileByUrl(url)));
                console.log("Associated files in Storage deleted.");
            }
        } catch (cleanupError) {
            console.error("Error during post-auth-deletion cleanup:", cleanupError);
            // The main account is deleted, but we log that cleanup failed.
            // The user is effectively deleted from an auth perspective, so we still treat it as a success.
        }

        setUser(null); // Clear local state
        router.push('/login');
        
        return { success: true };

    } catch (error: any) {
        console.error("Account deletion failed:", error);
        let errorMessage = "Failed to delete account. Please try again.";

        if (error.code === 'auth/requires-recent-login') {
            errorMessage = "This operation is sensitive and requires a recent login. Please log out and log back in before trying to delete your account.";
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        // IMPORTANT: Because the auth deletion failed, we did not delete Firestore or Storage data.
        return { success: false, error: errorMessage };

    } finally {
        setLoading(false);
    }
};

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user && !loading, login, logout, deleteUserAccount, loading, setUser }}>
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
