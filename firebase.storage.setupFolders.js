require('dotenv').config();

const admin = require('firebase-admin');

// Replace with your Firebase Admin SDK credentials
// You can get this from your Firebase Project Settings -> Service Accounts -> Generate new private key
// Ensure you have the FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY
// environment variables set, or replace with your actual credentials object.
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Handle newline characters
};

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET // Use your storage bucket name from .env
});

const bucket = admin.storage().bucket();

const foldersToCreate = [
  'users/.gitkeep',
  'document_templates/.gitkeep',
  'logos/.gitkeep',
  'users/dummyUserId/id_documents/.gitkeep', // Example subfolder path
  'users/dummyUserId/qualifications/.gitkeep' // Example subfolder path
];

async function createFolders() {
  for (const folderPath of foldersToCreate) {
    const file = bucket.file(folderPath);
    const contents = ''; // Empty content for a dummy file

    try {
      await file.save(contents);
      console.log(`Folder '${folderPath}' created.`);
    } catch (error) {
      console.error(`Error creating folder '${folderPath}':`, error);
    }
  }
  console.log('Folder creation process finished.');
}

createFolders();