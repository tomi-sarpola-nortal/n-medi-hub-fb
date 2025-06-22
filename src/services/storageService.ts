import { storage } from '@/lib/firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
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
