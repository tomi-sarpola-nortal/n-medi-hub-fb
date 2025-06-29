import admin from 'firebase-admin';
import { ConfigurationError } from './errors';

// This function checks if the required environment variables are set.
const hasFirebaseAdminConfig = () => {
    return (
        process.env.FIREBASE_PROJECT_ID &&
        process.env.FIREBASE_CLIENT_EMAIL &&
        process.env.FIREBASE_PRIVATE_KEY
    );
};

if (!admin.apps.length) {
    if (hasFirebaseAdminConfig()) {
        try {
            const serviceAccount: admin.ServiceAccount = {
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                // Replace escaped newlines from environment variable
                privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
            };

            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
            console.log("Firebase Admin SDK initialized successfully.");
        } catch (error: any) {
            console.error("Firebase Admin SDK initialization error:", error.message);
            throw new ConfigurationError(`Firebase Admin SDK initialization failed: ${error.message}`);
        }
    } else {
        console.warn("Firebase Admin SDK credentials are not set in environment variables. Admin features will be unavailable.");
    }
}

// Export auth and db services, which will be functional only if initialization succeeded.
export const adminAuth = admin.apps.length ? admin.auth() : ({} as admin.auth.Auth);
export const adminDb = admin.apps.length ? admin.firestore() : ({} as admin.firestore.Firestore);
export const adminStorage = admin.apps.length && process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET 
    ? admin.storage().bucket(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) 
    : null;