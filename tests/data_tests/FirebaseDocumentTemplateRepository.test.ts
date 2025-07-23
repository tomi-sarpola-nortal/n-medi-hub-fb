import { describe, test, expect, beforeEach, vi, afterEach } from 'vitest';
import { FirebaseDocumentTemplateRepository } from '@/data/firebase/FirebaseDocumentTemplateRepository';
import { 
  FileOperationError, 
  ConfigurationError, 
  DatabaseError 
} from '@/lib/errors';

// Mock the Firebase Admin SDK
vi.mock('@/lib/firebaseAdminConfig', () => ({
  adminDb: {
    collection: vi.fn(),
  }
}));

// Mock the Firebase client SDK
vi.mock('@/lib/firebaseConfig', () => ({
  storage: {
    ref: vi.fn(),
  }
}));

// Mock Firebase storage functions
vi.mock('firebase/storage', () => ({
  ref: vi.fn(),
  uploadBytes: vi.fn(),
  getDownloadURL: vi.fn(),
  deleteObject: vi.fn(),
}));

describe('FirebaseDocumentTemplateRepository', () => {
  let repository: FirebaseDocumentTemplateRepository;
  let mockCollection: any;
  let mockDoc: any;
  let mockGet: any;
  let mockAdd: any;
  let mockDelete: any;
  let mockOrderBy: any;
  let mockRef: any;
  let mockUploadBytes: any;
  let mockGetDownloadURL: any;
  let mockDeleteObject: any;

  beforeEach(() => {
    // Reset all mocks
    vi.resetAllMocks();

    // Set up the mock chain for Firestore operations
    mockGet = vi.fn();
    mockAdd = vi.fn();
    mockDelete = vi.fn();
    mockOrderBy = vi.fn().mockReturnValue({ get: mockGet });
    mockDoc = vi.fn().mockReturnValue({
      get: mockGet,
      delete: mockDelete
    });
    mockCollection = vi.fn().mockReturnValue({
      doc: mockDoc,
      add: mockAdd,
      orderBy: mockOrderBy,
      get: mockGet
    });

    // Set up the adminDb mock
    const { adminDb } = require('@/lib/firebaseAdminConfig');
    adminDb.collection.mockImplementation(mockCollection);

    // Set up the storage mocks
    mockRef = vi.fn();
    mockUploadBytes = vi.fn();
    mockGetDownloadURL = vi.fn();
    mockDeleteObject = vi.fn();

    const { storage } = require('@/lib/firebaseConfig');
    storage.ref = mockRef;

    const { ref, uploadBytes, getDownloadURL, deleteObject } = require('firebase/storage');
    ref.mockImplementation(() => ({ /* mock storage reference */ }));
    uploadBytes.mockResolvedValue({ ref: {} });
    getDownloadURL.mockResolvedValue('https://example.com/file.pdf');
    deleteObject.mockResolvedValue({});

    // Create a new repository instance for each test
    repository = new FirebaseDocumentTemplateRepository();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('add', () => {
    test('should upload file and create document with correct data', async () => {
      // Arrange
      const metadata = {
        title: 'Test Document',
        type: 'vorlage' as const,
        publisher: 'Test Publisher'
      };

      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
      
      const { ref, uploadBytes, getDownloadURL } = require('firebase/storage');
      uploadBytes.mockResolvedValueOnce({ ref: {} });
      getDownloadURL.mockResolvedValueOnce('https://example.com/test.pdf');
      
      mockAdd.mockResolvedValueOnce({ id: 'doc-id' });

      // Act
      const result = await repository.add(metadata, file);

      // Assert
      expect(result).toBe('doc-id');
      expect(ref).toHaveBeenCalled();
      expect(uploadBytes).toHaveBeenCalled();
      expect(getDownloadURL).toHaveBeenCalled();
      expect(mockCollection).toHaveBeenCalledWith('document_templates');
      expect(mockAdd).toHaveBeenCalled();
      
      // Check that the data passed to add includes our metadata
      const addArg = mockAdd.mock.calls[0][0];
      expect(addArg).toMatchObject({
        title: 'Test Document',
        type: 'vorlage',
        publisher: 'Test Publisher',
        fileName: 'test.pdf',
        fileUrl: 'https://example.com/test.pdf',
        fileFormat: 'PDF'
      });
      expect(addArg).toHaveProperty('lastChange');
    });

    test('should throw FileOperationError when upload fails', async () => {
      // Arrange
      const metadata = {
        title: 'Test Document',
        type: 'vorlage' as const,
        publisher: 'Test Publisher'
      };

      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
      
      const { uploadBytes } = require('firebase/storage');
      uploadBytes.mockRejectedValueOnce(new Error('Upload failed'));

      // Act & Assert
      await expect(repository.add(metadata, file)).rejects.toThrow(FileOperationError);
    });

    test('should throw DatabaseError when Firestore operation fails', async () => {
      // Arrange
      const metadata = {
        title: 'Test Document',
        type: 'vorlage' as const,
        publisher: 'Test Publisher'
      };

      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
      
      const { uploadBytes, getDownloadURL } = require('firebase/storage');
      uploadBytes.mockResolvedValueOnce({ ref: {} });
      getDownloadURL.mockResolvedValueOnce('https://example.com/test.pdf');
      
      mockAdd.mockRejectedValueOnce(new Error('Firestore error'));

      // Act & Assert
      await expect(repository.add(metadata, file)).rejects.toThrow(DatabaseError);
    });
  });

  describe('getAll', () => {
    test('should return all document templates', async () => {
      // Arrange
      const mockDocs = [
        {
          id: 'doc-1',
          data: () => ({
            title: 'Document 1',
            type: 'vorlage',
            publisher: 'Publisher 1',
            lastChange: { toDate: () => new Date('2025-01-01') },
            fileName: 'doc1.pdf',
            fileUrl: 'https://example.com/doc1.pdf',
            fileFormat: 'PDF'
          })
        },
        {
          id: 'doc-2',
          data: () => ({
            title: 'Document 2',
            type: 'leitlinie',
            publisher: 'Publisher 2',
            lastChange: { toDate: () => new Date('2025-01-02') },
            fileName: 'doc2.docx',
            fileUrl: 'https://example.com/doc2.docx',
            fileFormat: 'Word'
          })
        }
      ];
      
      mockGet.mockResolvedValueOnce({ docs: mockDocs });

      // Act
      const result = await repository.getAll();

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('doc-1');
      expect(result[0].title).toBe('Document 1');
      expect(result[1].id).toBe('doc-2');
      expect(result[1].title).toBe('Document 2');
      expect(mockCollection).toHaveBeenCalledWith('document_templates');
      expect(mockOrderBy).toHaveBeenCalledWith('lastChange', 'desc');
    });

    test('should throw DatabaseError when Firestore operation fails', async () => {
      // Arrange
      mockGet.mockRejectedValueOnce(new Error('Firestore error'));

      // Act & Assert
      await expect(repository.getAll()).rejects.toThrow(DatabaseError);
    });
  });

  describe('delete', () => {
    test('should delete document and file', async () => {
      // Arrange
      const { ref, deleteObject } = require('firebase/storage');
      deleteObject.mockResolvedValueOnce({});
      
      mockDelete.mockResolvedValueOnce({});

      // Act
      await repository.delete('doc-id', 'https://example.com/file.pdf');

      // Assert
      expect(ref).toHaveBeenCalled();
      expect(deleteObject).toHaveBeenCalled();
      expect(mockCollection).toHaveBeenCalledWith('document_templates');
      expect(mockDoc).toHaveBeenCalledWith('doc-id');
      expect(mockDelete).toHaveBeenCalled();
    });

    test('should continue with document deletion when file is not found', async () => {
      // Arrange
      const { ref, deleteObject } = require('firebase/storage');
      const storageError = new Error('File not found');
      storageError.code = 'storage/object-not-found';
      deleteObject.mockRejectedValueOnce(storageError);
      
      mockDelete.mockResolvedValueOnce({});

      // Act
      await repository.delete('doc-id', 'https://example.com/file.pdf');

      // Assert
      expect(ref).toHaveBeenCalled();
      expect(deleteObject).toHaveBeenCalled();
      expect(mockCollection).toHaveBeenCalledWith('document_templates');
      expect(mockDoc).toHaveBeenCalledWith('doc-id');
      expect(mockDelete).toHaveBeenCalled();
    });

    test('should throw FileOperationError when file deletion fails with non-not-found error', async () => {
      // Arrange
      const { ref, deleteObject } = require('firebase/storage');
      deleteObject.mockRejectedValueOnce(new Error('Storage error'));
      
      // Act & Assert
      await expect(repository.delete('doc-id', 'https://example.com/file.pdf')).rejects.toThrow(FileOperationError);
    });

    test('should throw DatabaseError when Firestore operation fails', async () => {
      // Arrange
      const { ref, deleteObject } = require('firebase/storage');
      deleteObject.mockResolvedValueOnce({});
      
      mockDelete.mockRejectedValueOnce(new Error('Firestore error'));

      // Act & Assert
      await expect(repository.delete('doc-id', 'https://example.com/file.pdf')).rejects.toThrow(DatabaseError);
    });
  });
});