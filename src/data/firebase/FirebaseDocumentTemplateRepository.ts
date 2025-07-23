import { adminDb as db, adminStorage } from '@/lib/firebaseAdminConfig';
import {
  FieldValue,
  type Timestamp,
} from 'firebase-admin/firestore';
import { v4 as uuidv4 } from 'uuid';
import type { DocumentTemplate, DocumentTemplateCreationData } from '@/lib/types';
import { IDocumentTemplateRepository } from '../interfaces/IDocumentTemplateRepository';
import { 
  DatabaseError, 
  FileOperationError, 
  ConfigurationError 
} from '@/lib/errors';

const DOC_TEMPLATES_COLLECTION = 'document_templates';

export class FirebaseDocumentTemplateRepository implements IDocumentTemplateRepository {
  private db: any;
  private storage: any; // Add storage property

  constructor(dbInstance: any, storageInstance: any) { // Accept db and storage instances
    this.db = dbInstance;
    this.storage = storageInstance; // Assign storage instance
  }

  private checkServices() {
    if (!this.db) {
      throw new ConfigurationError("Firestore is not initialized. Please check your Firebase configuration.");
    }
    if (!this.storage) { // Check the instance property
      throw new ConfigurationError("Firebase Admin Storage is not initialized. Check bucket name in .env");
    }
  }

  private getFileFormat(fileName: string): string {
    const extension = fileName.split('.').pop()?.toUpperCase() || 'UNKNOWN';
    if (extension === 'DOC' || extension === 'DOCX') return 'Word';
    return extension;
  }

  /**
   * Uploads a document template and its metadata using the Admin SDK.
   * @param metadata - The document metadata (title, type, publisher).
   * @param file - The file to upload.
   * @returns The ID of the newly created document.
   */
  async add(
    metadata: Omit<DocumentTemplateCreationData, 'fileName' | 'fileUrl' | 'fileFormat'>,
    file: File
  ): Promise<string> {
    try {
      this.checkServices();

      const publisherPath = metadata.publisher.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      // Sanitize filename to prevent issues with special characters in storage path
      const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const uniqueFileName = `${uuidv4()}-${safeFileName}`;
      const storagePath = `${DOC_TEMPLATES_COLLECTION}/${publisherPath}/${uniqueFileName}`;
      
      const fileBuffer = Buffer.from(await file.arrayBuffer());

      // 1. Upload file to Storage using Admin SDK
      const fileUpload = this.storage!.file(storagePath);
      await fileUpload.save(fileBuffer, {
        public: true, // Make the file publicly readable. Firebase will infer content type.
      });

      // Get the public URL.
      const downloadURL = fileUpload.publicUrl();

      // 2. Create document in Firestore
      const docData: DocumentTemplateCreationData = {
        ...metadata,
        fileName: file.name, // Store the original filename for display
        fileUrl: downloadURL,
        fileFormat: this.getFileFormat(file.name),
      };
      
      const docRef = await this.db.collection(DOC_TEMPLATES_COLLECTION).add({
        ...docData,
        lastChange: FieldValue.serverTimestamp(),
      });

      return docRef.id;
    } catch (error) {
      console.error("Error in add document template:", error);
      if (error instanceof FileOperationError || error instanceof ConfigurationError) {
        throw error;
      }
      throw new DatabaseError(`Failed to add document template: ${metadata.title}`, error as Error);
    }
  }

  /**
   * Fetches all document templates from Firestore.
   * @returns An array of DocumentTemplate objects.
   */
  async getAll(): Promise<DocumentTemplate[]> {
    try {
      this.checkServices();
      const templatesCollection = this.db.collection(DOC_TEMPLATES_COLLECTION);
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
    } catch (error) {
      throw new DatabaseError("Failed to get document templates", error as Error);
    }
  }

  /**
   * Deletes a document template from Firestore and its file from Storage using Admin SDK.
   * @param templateId - The ID of the Firestore document to delete.
   * @param fileUrl - The full download URL of the file to delete from Storage.
   */
  async delete(templateId: string, fileUrl: string): Promise<void> {
    try {
      this.checkServices();
      
      // 1. Delete file from Storage using Admin SDK
      if (fileUrl) {
         try {
            // Extract the path from the URL. e.g., "document_templates/some_publisher/file.pdf"
            const bucketName = this.storage!.name;
            const prefix = `https://storage.googleapis.com/${bucketName}/`;
            if (fileUrl.startsWith(prefix)) {
                const filePath = decodeURIComponent(fileUrl.substring(prefix.length));
                await this.storage!.file(filePath).delete();
            } else {
                console.warn(`File URL ${fileUrl} does not match expected format for bucket ${bucketName}. Skipping deletion.`);
            }
        } catch (error: any) {
            // Log error but don't block Firestore deletion if file is already gone
            if (error.code === 404) { // GCS not found error code
                console.warn(`File was not found in Storage, proceeding to delete Firestore document: ${fileId}`);
            } else {
                throw new FileOperationError(`Failed to delete file from Storage: ${fileUrl}`, error);
            }
        }
      }
      
      // 2. Delete document from Firestore
      const docRef = this.db.collection(DOC_TEMPLATES_COLLECTION).doc(templateId);
      await docRef.delete();
    } catch (error) {
      if (error instanceof FileOperationError || error instanceof ConfigurationError) {
        throw error;
      }
      throw new DatabaseError(`Failed to delete document template with ID ${templateId}`, error as Error);
    }
  }
}
