"use client";

import { storage } from '@/lib/firebaseConfig';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

// Helper function to ensure Storage is initialized
const checkStorage = () => {
  if (!storage) {
    throw new Error("Firebase Storage is not initialized. Please check your Firebase configuration.");
  }
};

/**
 * Uploads a file to a specified path in Firebase Storage.
 * @param file The file to upload.
 * @param path The directory path in the bucket where the file should be stored (e.g., 'id_documents').
 * @returns The public download URL of the uploaded file.
 */
export async function uploadFile(file: File, path: string): Promise<string> {
  checkStorage();

  // Create a unique filename to avoid overwrites
  const uniqueFileName = `${uuidv4()}-${file.name}`;
  const storageRef = ref(storage, `${path}/${uniqueFileName}`);

  // Upload the file
  const snapshot = await uploadBytes(storageRef, file);

  // Get the public URL
  const downloadURL = await getDownloadURL(snapshot.ref);

  return downloadURL;
}

/**
 * Deletes a file from Firebase Storage using its download URL.
 * @param fileUrl The full gs:// or https:// download URL of the file to delete.
 */
export async function deleteFileByUrl(fileUrl: string): Promise<void> {
  if (!fileUrl) {
    console.log("No file URL provided, skipping deletion.");
    return;
  }

  checkStorage();

  try {
    // Create a reference from the file URL.
    // This works for both gs:// and https:// URLs.
    const fileRef = ref(storage, fileUrl);
    
    // Delete the file
    await deleteObject(fileRef);
    console.log(`Successfully deleted file at: ${fileUrl}`);
  } catch (error: any) {
    // It's common for this to fail if the file doesn't exist, so we can often ignore that.
    if (error.code === 'storage/object-not-found') {
      console.warn(`File not found, could not delete. This may not be an error: ${fileUrl}`);
    } else {
      console.error(`Error deleting file ${fileUrl}:`, error);
      // We don't re-throw the error to prevent the main operation (like updating a profile) from failing.
    }
  }
}