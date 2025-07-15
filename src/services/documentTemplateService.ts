
'use server';

import { documentTemplateRepository } from '@/data';
import type { DocumentTemplate } from '@/lib/types';
import { withErrorHandling } from '@/app/actions/errorHandler';
import { ValidationError } from '@/lib/errors';

/**
 * Uploads a document template and its metadata using FormData.
 * This is a server action designed to be called from a client form.
 * @param formData - The FormData object containing file and metadata.
 * @returns An object indicating success or failure.
 */
export const addDocumentTemplate = withErrorHandling(
  async (
    formData: FormData
  ): Promise<{ success: boolean; message: string; templateId: string }> => {
    const file = formData.get('file') as File | null;
    const title = formData.get('title') as string | null;
    const type = formData.get('type') as 'vorlage' | 'leitlinie' | 'empfehlung' | null;
    const publisher = formData.get('publisher') as string | null;

    if (!file || !title || !type || !publisher) {
      throw new ValidationError('Missing required form data for document upload.');
    }
    
    const metadata = { title, type, publisher };
    const templateId = await documentTemplateRepository.add(metadata, file);

    return { success: true, message: 'Document uploaded successfully.', templateId };
  }
);

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
