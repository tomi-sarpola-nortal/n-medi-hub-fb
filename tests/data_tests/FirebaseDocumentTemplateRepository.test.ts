import { describe, test, expect, beforeEach, vi, afterEach } from 'vitest';
import { FirebaseDocumentTemplateRepository } from '@/data/firebase/FirebaseDocumentTemplateRepository';
import { 
  FileOperationError, 
  ConfigurationError, 
  DatabaseError 
} from '@/lib/errors';
import { v4 as uuidv4 } from 'uuid';

// Mock uuid to return a predictable value
vi.mock('uuid', () => ({
  v4: () => 'mock-uuid'
}));

describe('FirebaseDocumentTemplateRepository', () => {
  let repository: FirebaseDocumentTemplateRepository;
  let mockCollection: any;
  let mockDoc: any;
  let mockGet: any;
  let mockAdd: any;
  let mockDelete: any;
  let mockOrderBy: any;
  let mockAdminDb: any;
  let mockAdminStorage: any;
  let mockFile: any;

  beforeEach(() => {
    // Reset all mocks before each test
    vi.resetAllMocks();

    // Mock Firestore
    mockGet = vi.fn();
    mockAdd = vi.fn(() => Promise.resolve({ id: 'new-doc-id' }));
    mockDelete = vi.fn(() => Promise.resolve());
    mockOrderBy = vi.fn(() => ({ get: mockGet }));
    mockDoc = vi.fn(() => ({ delete: mockDelete }));
    mockCollection = vi.fn(() => ({
      doc: mockDoc,
      add: mockAdd,
      orderBy: mockOrderBy,
      get: mockGet
    }));
    mockAdminDb = {
      collection: mockCollection,
    };

    // Mock Storage
    mockFile = {
        save: vi.fn(() => Promise.resolve()),
        publicUrl: vi.fn(() => 'https://example.com/mock-file-url'),
        delete: vi.fn(() => Promise.resolve()),
    };
    mockAdminStorage = {
        file: vi.fn(() => mockFile),
        name: 'test-bucket',
    };

    // Instantiate repository with mocks
    repository = new FirebaseDocumentTemplateRepository(mockAdminDb, mockAdminStorage);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('add', () => {
    test('should upload file and create document with correct data', async () => {
      const metadata = {
        title: 'Test Document',
        type: 'vorlage' as const,
        publisher: 'Test Publisher'
      };
      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });

      const result = await repository.add(metadata, file);

      expect(result).toBe('new-doc-id');
      expect(mockAdminStorage.file).toHaveBeenCalledWith('document_templates/test_publisher/mock-uuid-test.pdf');
      expect(mockFile.save).toHaveBeenCalled();
      expect(mockAdminDb.collection).toHaveBeenCalledWith('document_templates');
      expect(mockAdd).toHaveBeenCalled();
      
      const addArg = mockAdd.mock.calls[0][0];
      expect(addArg).toMatchObject({
        title: 'Test Document',
        type: 'vorlage',
        publisher: 'Test Publisher',
        fileName: 'test.pdf',
        fileUrl: 'https://example.com/mock-file-url',
        fileFormat: 'PDF'
      });
      expect(addArg).toHaveProperty('lastChange');
    });

    test('should throw FileOperationError when upload fails', async () => {
      const metadata = { title: 'Test Document', type: 'vorlage' as const, publisher: 'Test Publisher' };
      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
      mockFile.save.mockRejectedValueOnce(new Error('Upload failed'));

      await expect(repository.add(metadata, file)).rejects.toThrow(FileOperationError);
    });

    test('should throw DatabaseError when Firestore operation fails', async () => {
      const metadata = { title: 'Test Document', type: 'vorlage' as const, publisher: 'Test Publisher' };
      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
      mockAdd.mockRejectedValueOnce(new Error('Firestore error'));

      await expect(repository.add(metadata, file)).rejects.toThrow(DatabaseError);
    });
  });

  describe('getAll', () => {
    test('should return all document templates', async () => {
      const mockDocs = [
        { id: 'doc-1', data: () => ({ title: 'Document 1', type: 'vorlage', publisher: 'Publisher 1', lastChange: { toDate: () => new Date('2025-01-01') }, fileName: 'doc1.pdf', fileUrl: 'https://example.com/doc1.pdf', fileFormat: 'PDF' }) },
        { id: 'doc-2', data: () => ({ title: 'Document 2', type: 'leitlinie', publisher: 'Publisher 2', lastChange: { toDate: () => new Date('2025-01-02') }, fileName: 'doc2.docx', fileUrl: 'https://example.com/doc2.docx', fileFormat: 'Word' }) }
      ];
      mockGet.mockResolvedValueOnce({ docs: mockDocs });

      const result = await repository.getAll();

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('doc-1');
      expect(result[1].id).toBe('doc-2');
    });

     test('should throw DatabaseError on failure', async () => {
        mockGet.mockRejectedValueOnce(new Error('Firestore error'));
        await expect(repository.getAll()).rejects.toThrow(DatabaseError);
    });
  });

  describe('delete', () => {
    test('should delete document and file', async () => {
      const fileUrlToDelete = 'https://storage.googleapis.com/test-bucket/document_templates/some_publisher/file.pdf';
      
      await repository.delete('doc-id', fileUrlToDelete);

      expect(mockAdminStorage.file).toHaveBeenCalledWith('document_templates/some_publisher/file.pdf');
      expect(mockFile.delete).toHaveBeenCalled();
      expect(mockDoc).toHaveBeenCalledWith('doc-id');
      expect(mockDelete).toHaveBeenCalled();
    });

    test('should continue with doc deletion if file not found (404)', async () => {
      const fileUrlToDelete = 'https://storage.googleapis.com/test-bucket/document_templates/some_publisher/file.pdf';
      const storageError = new Error('File not found') as any;
      storageError.code = 404;
      mockFile.delete.mockRejectedValueOnce(storageError);

      await repository.delete('doc-id', fileUrlToDelete);

      expect(mockDelete).toHaveBeenCalled(); // Ensure Firestore delete is still called
    });

    test('should throw FileOperationError for other storage errors', async () => {
      const fileUrlToDelete = 'https://storage.googleapis.com/test-bucket/document_templates/some_publisher/file.pdf';
      mockFile.delete.mockRejectedValueOnce(new Error('Storage permission error'));

      await expect(repository.delete('doc-id', fileUrlToDelete)).rejects.toThrow(FileOperationError);
    });
  });
});
