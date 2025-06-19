
import { initializeApp, getApp, getApps, type FirebaseOptions } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
// Uncomment if you plan to use Firebase Authentication or Storage
// import { getAuth } from 'firebase/auth';
// import { getStorage } from 'firebase/storage';

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Validate critical Firebase configuration
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  const errorMessage = "CRITICAL: Firebase configuration is incomplete. 'apiKey' or 'projectId' is missing. Please ensure NEXT_PUBLIC_FIREBASE_API_KEY and NEXT_PUBLIC_FIREBASE_PROJECT_ID are correctly set in your .env file. Firestore cannot be initialized, and the application may not function correctly.";
  console.error(errorMessage);
  // Throwing an error here will stop the application from proceeding with an invalid Firebase setup,
  // making the root cause of issues like seeding errors more apparent.
  throw new Error(errorMessage);
}

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const db = getFirestore(app);
// Uncomment and initialize if you plan to use Firebase Authentication or Storage
// const auth = getAuth(app);
// const storage = getStorage(app);

export { db /*, auth, storage */ };

