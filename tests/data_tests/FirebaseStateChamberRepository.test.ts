import { describe, test, expect, beforeEach, vi, afterEach } from 'vitest';
import { FirebaseStateBureauRepository } from '@/data/firebase/FirebaseStateChamberRepository';
import { 
  DatabaseError, 
  ConfigurationError 
} from '@/lib/errors';

describe('FirebaseStateBureauRepository', () => {
  let repository: FirebaseStateBureauRepository;
  let mockCollection: any;
  let mockDoc: any;
  let mockGet: any;
  let mockSet: any;
  let mockAdminDb: any;

  beforeEach(() => {
    vi.resetAllMocks();

    mockGet = vi.fn();
    mockSet = vi.fn(() => Promise.resolve());
    mockDoc = vi.fn(() => ({
      get: mockGet,
      set: mockSet
    }));
    mockCollection = vi.fn(() => ({
      doc: mockDoc,
      get: mockGet
    }));

    mockAdminDb = {
      collection: mockCollection,
    };

    repository = new FirebaseStateBureauRepository(mockAdminDb);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getById', () => {
    test('should return null when bureau is not found', async () => {
      mockGet.mockResolvedValueOnce({ exists: false });
      const result = await repository.getById('non-existent-id');
      expect(result).toBeNull();
      expect(mockAdminDb.collection).toHaveBeenCalledWith('state_bureaus');
      expect(mockDoc).toHaveBeenCalledWith('non-existent-id');
    });

    test('should return bureau when found', async () => {
      const mockBureau = {
        name: 'Ärztebüro Wien',
        address: 'Wipplingerstraße 2, 1010 Wien',
        phone: '+43 1 53751-0',
        email: 'aekwien@aekwien.at',
        officeHours: 'Mo-Do: 8:00 - 16:30 Uhr\nFr: 8:00 - 14:00 Uhr'
      };
      mockGet.mockResolvedValueOnce({ exists: true, id: 'wien', data: () => mockBureau });
      const result = await repository.getById('wien');
      expect(result).not.toBeNull();
      expect(result?.id).toBe('wien');
      expect(result?.name).toBe('Ärztebüro Wien');
    });

    test('should throw DatabaseError when Firestore operation fails', async () => {
      mockGet.mockRejectedValueOnce(new Error('Firestore error'));
      await expect(repository.getById('wien')).rejects.toThrow(DatabaseError);
    });
  });

  describe('create', () => {
    test('should create a bureau document with the correct data', async () => {
      const bureauData = {
        name: 'Ärztebüro Wien',
        address: 'Wipplingerstraße 2, 1010 Wien',
        phone: '+43 1 53751-0',
        email: 'aekwien@aekwien.at',
        officeHours: 'Mo-Do: 8:00 - 16:30 Uhr\nFr: 8:00 - 14:00 Uhr'
      };
      await repository.create('wien', bureauData);
      expect(mockAdminDb.collection).toHaveBeenCalledWith('state_bureaus');
      expect(mockDoc).toHaveBeenCalledWith('wien');
      expect(mockSet).toHaveBeenCalledWith(bureauData);
    });

    test('should throw DatabaseError when Firestore operation fails', async () => {
      const bureauData = { name: 'Ärztebüro Wien', address: 'Wipplingerstraße 2, 1010 Wien' };
      mockSet.mockRejectedValueOnce(new Error('Firestore error'));
      await expect(repository.create('wien', bureauData as any)).rejects.toThrow(DatabaseError);
    });
  });

  describe('getAll', () => {
    test('should return all bureaus', async () => {
      const mockBureaus = [
        { id: 'wien', data: () => ({ name: 'Ärztebüro Wien' }) },
        { id: 'noe', data: () => ({ name: 'Ärztekammer für Niederösterreich' }) }
      ];
      mockGet.mockResolvedValueOnce({ docs: mockBureaus });
      const result = await repository.getAll();
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('wien');
    });
  });

  describe('error handling', () => {
    test('should throw ConfigurationError when db is not initialized', async () => {
      repository = new FirebaseStateBureauRepository(null);
      await expect(repository.getById('wien')).rejects.toThrow(ConfigurationError);
    });
  });
});
