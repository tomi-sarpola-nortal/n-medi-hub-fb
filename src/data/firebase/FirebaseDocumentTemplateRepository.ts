import { storage } from '@/lib/firebaseConfig';
import { adminDb as db } from '@/lib/firebaseAdminConfig';
import {
  FieldValue,
  type Timestamp,
} from 'firebase-admin/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import type { DocumentTemplate, DocumentTemplateCreationData } from '@/lib/types';
import { IDocumentTemplateRepository } from '../interfaces/IDocumentTemplateRepository';

const DOC_TEMPLATES_COLLECTION = 'document_templates';

export class FirebaseDocumentTemplateRepository implements IDocumentTemplateRepository {
  private checkServices() {
    if (!db || !storage) {
      throw new Error("Firebase is not initialized. Please check your Firebase configuration.");
    }
  }

  private getFileFormat(fileName: string): string {
    const extension = fileName.split('.').pop()?.toUpperCase() || 'UNKNOWN';
    if (extension === 'DOC' || extension === 'DOCX') return 'Word';
    return extension;
  }

  /**
   * Uploads a document template and its metadata.
   * @param metadata - The document metadata (title, type, publisher).
   * @param file - The file to upload.
   * @returns The ID of the newly created document.
   */
  async add(
    metadata: Omit<DocumentTemplateCreationData, 'fileName' | 'fileUrl' | 'fileFormat'>,
    file: File
  ): Promise<string> {
    this.checkServices();

    // Sanitize publisher name to create a valid path segment.
    // Replaces non-alphanumeric characters with underscores and converts to lowercase.
    const publisherPath = metadata.publisher.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const uniqueFileName = `${uuidv4()}-${file.name}`;
    const storagePath = `${DOC_TEMPLATES_COLLECTION}/${publisherPath}/${uniqueFileName}`;
    const storageRef = ref(storage, storagePath);
    
    // 1. Upload file to Storage
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);

    // 2. Create document in Firestore
    const docData: DocumentTemplateCreationData = {
      ...metadata,
      fileName: file.name,
      fileUrl: downloadURL,
      fileFormat: this.getFileFormat(file.name),
    };
    
    const docRef = await db.collection(DOC_TEMPLATES_COLLECTION).add({
      ...docData,
      lastChange: FieldValue.serverTimestamp(),
    });

    return docRef.id;
  }

  /**
   * Fetches all document templates from Firestore.
   * @returns An array of DocumentTemplate objects.
   */
  async getAll(): Promise<DocumentTemplate[]> {
    this.checkServices();
    const templatesCollection = db.collection(DOC_TEMPLATES_COLLECTION);
    const q = templatesCollection.orderBy('lastChange', 'desc');
    const snapshot = await q.get();

    return snapshot.docs.map(doc => {
      const data = doc.data();
      const lastChangeTimestamp = data.lastChange as Timestamp;
      return {
        id: doc.id,
        title: data.title,
        type: data.type,
        publisher: data.publisher,
        lastChange: lastChangeTimestamp ? lastChangeTimestamp.toDate().toISOString() : new Date(0).toISOString(),
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
  async delete(templateId: string, fileUrl: string): Promise<void> {
    this.checkServices();

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
    const docRef = db.collection(DOC_TEMPLATES_COLLECTION).doc(templateId);
    await docRef.delete();
  }
}