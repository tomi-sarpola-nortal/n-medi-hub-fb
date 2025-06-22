
"use client";

import { storage } from '@/lib/firebaseConfig';
import { ref, uploadBytes, getDownloadURL, deleteObject, getBlob } from 'firebase/storage';
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

  // Use the original file name for registrations, as it's more descriptive
  const storageRef = ref(storage, `${path}/${file.name}`);

  // Upload the file
  const snapshot = await uploadBytes(storageRef, file);

  // Get the public URL
  const downloadURL = await getDownloadURL(snapshot.ref);

  return downloadURL;
}


/**
 * Copies a file from a source URL to a new path in Firebase Storage.
 * This is effectively a "move" when combined with delete, but it's a copy operation.
 * @param sourceUrl The full download URL of the source file.
 * @param targetPathWithFileName The full path in storage for the new file (e.g., 'users/userId/qualifications/diploma.pdf').
 * @returns The download URL of the newly created file.
 */
export async function copyFileToNewLocation(sourceUrl: string, targetPathWithFileName: string): Promise<string> {
  checkStorage();
  
  // 1. Get reference to the source file
  const sourceRef = ref(storage, sourceUrl);
  
  // 2. Download the file's data as a Blob
  const blob = await getBlob(sourceRef);

  // 3. Create a reference to the new location
  const targetRef = ref(storage, targetPathWithFileName);

  // 4. Upload the blob to the new location
  await uploadBytes(targetRef, blob);

  // 5. Get and return the new download URL
  const newDownloadURL = await getDownloadURL(targetRef);
  return newDownloadURL;
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
