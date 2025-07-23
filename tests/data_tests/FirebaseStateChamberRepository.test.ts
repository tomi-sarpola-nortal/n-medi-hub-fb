import { describe, test, expect, beforeEach, vi, afterEach } from 'vitest';
import { FirebaseStateChamberRepository } from '@/data/firebase/FirebaseStateChamberRepository';
import { 
  DatabaseError, 
  ConfigurationError 
} from '@/lib/errors';

// Mock the Firebase Admin SDK
vi.mock('@/lib/firebaseAdminConfig', () => ({
  adminDb: {
    collection: vi.fn(),
  }
}));

describe('FirebaseStateChamberRepository', () => {
  let repository: FirebaseStateChamberRepository;
  let mockCollection: any;
  let mockDoc: any;
  let mockGet: any;
  let mockSet: any;

  beforeEach(() => {
    // Reset all mocks
    vi.resetAllMocks();

    // Set up the mock chain for Firestore operations
    mockGet = vi.fn();
    mockSet = vi.fn();
    mockDoc = vi.fn().mockReturnValue({
      get: mockGet,
      set: mockSet
    });
    mockCollection = vi.fn().mockReturnValue({
      doc: mockDoc,
      get: mockGet
    });

    // Set up the adminDb mock
    const { adminDb } = require('@/lib/firebaseAdminConfig');
    adminDb.collection.mockImplementation(mockCollection);

    // Create a new repository instance for each test
    repository = new FirebaseStateChamberRepository();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getById', () => {
    test('should return null when chamber is not found', async () => {
      // Arrange
      mockGet.mockResolvedValueOnce({ exists: false });

      // Act
      const result = await repository.getById('non-existent-id');

      // Assert
      expect(result).toBeNull();
      expect(mockCollection).toHaveBeenCalledWith('state_chambers');
      expect(mockDoc).toHaveBeenCalledWith('non-existent-id');
      expect(mockGet).toHaveBeenCalled();
    });

    test('should return chamber when found', async () => {
      // Arrange
      const mockChamber = {
        name: 'Vienna Medical Bureau',
        address: 'Kohlmarkt 11/6
1010 Wien',
        phone: '+43 1 513 37 31',
        email: 'office@wr.aerztekammer.at',
        officeHours: 'Mo-Do: 8:00 - 16:30 Uhr
Fr: 8:00 - 14:00 Uhr'
      };
      
      mockGet.mockResolvedValueOnce({
        exists: true,
        id: 'wien',
        data: () => mockChamber
      });

      // Act
      const result = await repository.getById('wien');

      // Assert
      expect(result).not.toBeNull();
      expect(result?.id).toBe('wien');
      expect(result?.name).toBe('Vienna Medical Bureau');
      expect(mockCollection).toHaveBeenCalledWith('state_chambers');
      expect(mockDoc).toHaveBeenCalledWith('wien');
    });

    test('should throw DatabaseError when Firestore operation fails', async () => {
      // Arrange
      mockGet.mockRejectedValueOnce(new Error('Firestore error'));

      // Act & Assert
      await expect(repository.getById('wien')).rejects.toThrow(DatabaseError);
    });
  });

  describe('create', () => {
    test('should create a chamber document with the correct data', async () => {
      // Arrange
      const chamberData = {
        name: 'Vienna Medical Bureau',
        address: 'Kohlmarkt 11/6
1010 Wien',
        phone: '+43 1 513 37 31',
        email: 'office@wr.aerztekammer.at',
        officeHours: 'Mo-Do: 8:00 - 16:30 Uhr
Fr: 8:00 - 14:00 Uhr'
      };

      mockSet.mockResolvedValueOnce({});

      // Act
      await repository.create('wien', chamberData);

      // Assert
      expect(mockCollection).toHaveBeenCalledWith('state_chambers');
      expect(mockDoc).toHaveBeenCalledWith('wien');
      expect(mockSet).toHaveBeenCalledWith(chamberData);
    });

    test('should throw DatabaseError when Firestore operation fails', async () => {
      // Arrange
      const chamberData = {
        name: 'Vienna Medical Bureau',
        address: 'Kohlmarkt 11/6
1010 Wien',
        phone: '+43 1 513 37 31',
        email: 'office@wr.aerztekammer.at',
        officeHours: 'Mo-Do: 8:00 - 16:30 Uhr
Fr: 8:00 - 14:00 Uhr'
      };

      mockSet.mockRejectedValueOnce(new Error('Firestore error'));

      // Act & Assert
      await expect(repository.create('wien', chamberData)).rejects.toThrow(DatabaseError);
    });
  });

  describe('getAll', () => {
    test('should return empty array when no chambers exist', async () => {
      // Arrange
      mockGet.mockResolvedValueOnce({ empty: true, docs: [] });

      // Act
      const result = await repository.getAll();

      // Assert
      expect(result).toEqual([]);
      expect(mockCollection).toHaveBeenCalledWith('state_chambers');
      expect(mockGet).toHaveBeenCalled();
    });

    test('should return all chambers', async () => {
      // Arrange
      const mockChambers = [
        {
          id: 'wien',
          data: () => ({
            name: 'Vienna Medical Bureau',
            address: 'Kohlmarkt 11/6
1010 Wien',
            phone: '+43 1 513 37 31',
            email: 'office@wr.aerztekammer.at',
            officeHours: 'Mo-Do: 8:00 - 16:30 Uhr
Fr: 8:00 - 14:00 Uhr'
          })
        },
        {
          id: 'noe',
          data: () => ({
            name: 'Lower Austria Medical Bureau',
            address: 'Kremser Gasse 20
3100 St. Pölten',
            phone: '+43 2742 35 35 70',
            email: 'office@noe.aerztekammer.at',
            officeHours: 'Mo-Do: 8:00 - 17:00 Uhr
Fr: 8:00 - 12:00 Uhr'
          })
        }
      ];
      
      mockGet.mockResolvedValueOnce({ empty: false, docs: mockChambers });

      // Act
      const result = await repository.getAll();

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('wien');
      expect(result[1].id).toBe('noe');
      expect(mockCollection).toHaveBeenCalledWith('state_chambers');
      expect(mockGet).toHaveBeenCalled();
    });

    test('should throw DatabaseError when Firestore operation fails', async () => {
      // Arrange
      mockGet.mockRejectedValueOnce(new Error('Firestore error'));

      // Act & Assert
      await expect(repository.getAll()).rejects.toThrow(DatabaseError);
    });
  });

  describe('error handling', () => {
    test('should throw ConfigurationError when db is not initialized', async () => {
      // Arrange
      const { adminDb } = require('@/lib/firebaseAdminConfig');
      adminDb.collection = null;

      // Act & Assert
      await expect(repository.getById('wien')).rejects.toThrow(ConfigurationError);
    });
  });
});