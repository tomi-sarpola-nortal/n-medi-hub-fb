
import { db } from '@/lib/firebaseConfig';
import { storage } from '@/lib/firebaseConfig';
import {
  collection,
  doc,
  addDoc,
  getDocs,
  deleteDoc,
  serverTimestamp,
  orderBy,
  query,
  type Timestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import type { DocumentTemplate, DocumentTemplateCreationData } from '@/lib/types';
import { format } from 'date-fns';


const DOC_TEMPLATES_COLLECTION = 'document_templates';

// Helper to check for Firebase services
const checkServices = () => {
    if (!db || !storage) {
        throw new Error("Firebase is not initialized. Please check your Firebase configuration.");
    }
};

const getFileFormat = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toUpperCase() || 'UNKNOWN';
    if (extension === 'DOC' || extension === 'DOCX') return 'Word';
    return extension;
};

/**
 * Uploads a document template and its metadata.
 * @param metadata - The document metadata (title, type, publisher).
 * @param file - The file to upload.
 * @returns The ID of the newly created document.
 */
export async function addDocumentTemplate(
  metadata: Omit<DocumentTemplateCreationData, 'fileName' | 'fileUrl' | 'fileFormat'>,
  file: File
): Promise<string> {
  checkServices();

  const uniqueFileName = `${uuidv4()}-${file.name}`;
  const storageRef = ref(storage, `${DOC_TEMPLATES_COLLECTION}/${uniqueFileName}`);
  
  // 1. Upload file to Storage
  const snapshot = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);

  // 2. Create document in Firestore
  const docData: DocumentTemplateCreationData = {
    ...metadata,
    fileName: file.name,
    fileUrl: downloadURL,
    fileFormat: getFileFormat(file.name),
  };
  
  const docRef = await addDoc(collection(db, DOC_TEMPLATES_COLLECTION), {
      ...docData,
      lastChange: serverTimestamp(),
  });

  return docRef.id;
}


/**
 * Fetches all document templates from Firestore.
 * @returns An array of DocumentTemplate objects.
 */
export async function getDocumentTemplates(): Promise<DocumentTemplate[]> {
    checkServices();
    const templatesCollection = collection(db, DOC_TEMPLATES_COLLECTION);
    const q = query(templatesCollection, orderBy('lastChange', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => {
        const data = doc.data();
        const lastChangeTimestamp = data.lastChange as Timestamp;
        return {
            id: doc.id,
            title: data.title,
            type: data.type,
            publisher: data.publisher,
            lastChange: lastChangeTimestamp ? format(lastChangeTimestamp.toDate(), 'dd.MM.yyyy') : 'N/A',
            fileName: data.fileName,
            fileUrl: data.fileUrl,
            fileFormat: data.fileFormat,
        } as DocumentTemplate;
    });
}


/**
 * Deletes a document template from Firestore and its file from Storage.
 * @param templateId - The ID of the Firestore document to delete.
 * @param fileUrl - The full download URL of the file to delete from Storage.
 */
export async function deleteDocumentTemplate(templateId: string, fileUrl: string): Promise<void> {
    checkServices();

    // 1. Delete file from Storage
    if (fileUrl) {
        const fileRef = ref(storage, fileUrl);
        try {
            await deleteObject(fileRef);
        } catch (error: any) {
            // Log error but don't block Firestore deletion if file is already gone
            console.error(`Failed to delete file from Storage (${fileUrl}):`, error);
            if (error.code === 'storage/object-not-found') {
                console.warn('File was not found in Storage, proceeding to delete Firestore document.');
            } else {
                 throw error; // Re-throw if it's not a 'not found' error
            }
        }
    }

    // 2. Delete document from Firestore
    const docRef = doc(db, DOC_TEMPLATES_COLLECTION, templateId);
    await deleteDoc(docRef);
}
