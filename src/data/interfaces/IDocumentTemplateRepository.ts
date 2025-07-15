import type { DocumentTemplate, DocumentTemplateCreationData } from '@/lib/types';

export interface IDocumentTemplateRepository {
  add(metadata: Omit<DocumentTemplateCreationData, 'fileName' | 'fileUrl' | 'fileFormat'>, file: File): Promise<string>;
  getAll(): Promise<DocumentTemplate[]>;
  delete(templateId: string, fileUrl: string): Promise<void>;
}
