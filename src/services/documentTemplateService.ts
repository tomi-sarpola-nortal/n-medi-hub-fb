'use server';

import { documentTemplateRepository } from '@/data';
import type { DocumentTemplate, DocumentTemplateCreationData } from '@/lib/types';

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
  return documentTemplateRepository.add(metadata, file);
}

/**
 * Fetches all document templates from Firestore.
 * @returns An array of DocumentTemplate objects.
 */
export async function getDocumentTemplates(): Promise<DocumentTemplate[]> {
  return documentTemplateRepository.getAll();
}

/**
 * Deletes a document template from Firestore and its file from Storage.
 * @param templateId - The ID of the Firestore document to delete.
 * @param fileUrl - The full download URL of the file to delete from Storage.
 */
export async function deleteDocumentTemplate(templateId: string, fileUrl: string): Promise<void> {
  return documentTemplateRepository.delete(templateId, fileUrl);
}