import { initializeApp, getApp, getApps, type FirebaseOptions } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { ConfigurationError } from './errors';

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app;
let db: ReturnType<typeof getFirestore> | null = null;
let auth: ReturnType<typeof getAuth> | null = null;
let storage: ReturnType<typeof getStorage> | null = null;

// Only initialize if the critical config values are present
if (firebaseConfig.apiKey && firebaseConfig.projectId) {
  try {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }
    db = getFirestore(app);
    auth = getAuth(app);
    
    if (firebaseConfig.storageBucket) {
      storage = getStorage(app);
    } else {
      throw new ConfigurationError("Firebase Storage configuration is missing `storageBucket`. File uploads will fail. Ensure NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET is set in your environment file.");
    }
  } catch (error) {
    console.error("Firebase initialization error:", error);
    throw new ConfigurationError(`Failed to initialize Firebase: ${error instanceof Error ? error.message : String(error)}`);
  }
} else {
    // This warning will appear in the browser's console if the .env file is not set up
    console.warn("Firebase configuration is incomplete or missing from .env file. Firebase services will be unavailable.");
    throw new ConfigurationError("Firebase configuration is incomplete or missing. Please check your environment variables.");
}

export { db, auth, storage };