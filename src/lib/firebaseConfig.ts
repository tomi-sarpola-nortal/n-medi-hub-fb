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

// Initialize Firebase
let app;
if (!getApps().length) {
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.warn("Firebase config is missing. Please ensure all NEXT_PUBLIC_FIREBASE_ environment variables are set.");
    // Potentially throw an error or handle this state appropriately for your app
    // For now, we'll proceed, but Firestore/Auth/Storage will not work.
    app = {} as any; // Avoid crashing during initialization if config is missing
  } else {
     app = initializeApp(firebaseConfig);
  }
} else {
  app = getApp();
}

let db;
// let auth;
// let storage;

if (firebaseConfig.apiKey && firebaseConfig.projectId) {
  db = getFirestore(app);
  // auth = getAuth(app);
  // storage = getStorage(app);
} else {
  // Mock or disable Firestore if config is not available
  db = {} as any; // Avoid crashing if db is used without proper init
  console.warn("Firestore could not be initialized due to missing Firebase config.");
}


export { db /*, auth, storage */ };
