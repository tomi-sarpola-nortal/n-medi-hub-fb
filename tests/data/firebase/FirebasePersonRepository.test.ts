import { describe, test, expect, beforeEach, vi, afterEach } from 'vitest';
import { FirebasePersonRepository } from '@/data/firebase/FirebasePersonRepository';
import { 
  NotFoundError, 
  ValidationError, 
  DatabaseError, 
  ConfigurationError 
} from '@/lib/errors';

// Mock the Firebase Admin SDK
vi.mock('@/lib/firebaseAdminConfig', () => ({
  adminDb: {
    collection: vi.fn(),
  }
}));

// Mock the services used by the repository
vi.mock('@/services/auditLogService', () => ({
  createAuditLog: vi.fn().mockResolvedValue('audit-log-id'),
}));

vi.mock('@/services/notificationService', () => ({
  createNotification: vi.fn().mockResolvedValue('notification-id'),
}));

vi.mock('@/services/emailService', () => ({
  sendEmail: vi.fn().mockResolvedValue('email-id'),
}));

vi.mock('@/lib/translations', () => ({
  getTranslations: vi.fn().mockReturnValue({
    notification_new_registration_review: 'New registration for "{targetName}" is ready for review.',
    email_subject_new_registration: 'New Member Registration for Review',
    email_body_new_registration: 'Dear {targetName},<br><br>A new member registration for {actorName} is ready for your review. Please log in to the portal.<br><br>Thank you.',
    notification_data_change_approved: 'Your recent data changes have been approved.',
    email_subject_data_change_approved: 'Your Data Changes have been Approved',
    email_body_data_change_approved: 'Dear {targetName},<br><br>Your recent data changes have been approved and are now active.<br><br>Thank you.',
    notification_data_change_rejected: 'Your recent data changes have been rejected.',
    email_subject_data_change_rejected: 'Update on Your Data Changes',
    email_body_data_change_rejected: 'Dear {targetName},<br><br>There has been an update regarding your recent data change request. Please log in to the portal for more details.<br><br>Thank you.',
    notification_registration_approved: 'Congratulations! Your registration has been approved.',
    email_subject_registration_approved: 'Your Registration has been Approved',
    email_body_registration_approved: 'Dear {targetName},<br><br>Congratulations! Your registration with the Medical Chamber has been approved. You can now access all portal features.<br><br>Thank you.',
    notification_registration_rejected: 'There has been an update on your registration review.',
    email_subject_registration_rejected: 'Update on Your Registration',
    email_body_registration_rejected: 'Dear {targetName},<br><br>There has been an update regarding your registration application. Please log in to the portal for more details.<br><br>Thank you.',
  }),
}));

describe('FirebasePersonRepository', () => {
  let repository: FirebasePersonRepository;
  let mockCollection: any;
  let mockDoc: any;
  let mockWhere: any;
  let mockOrderBy: any;
  let mockGet: any;
  let mockSet: any;
  let mockUpdate: any;
  let mockAdd: any;

  beforeEach(() => {
    // Reset all mocks
    vi.resetAllMocks();

    // Set up the mock chain for Firestore operations
    mockGet = vi.fn();
    mockSet = vi.fn();
    mockUpdate = vi.fn();
    mockAdd = vi.fn();
    mockOrderBy = vi.fn().mockReturnValue({ get: mockGet });
    mockWhere = vi.fn().mockReturnValue({ 
      get: mockGet,
      where: mockWhere,
      orderBy: mockOrderBy
    });
    mockDoc = vi.fn().mockReturnValue({
      get: mockGet,
      set: mockSet,
      update: mockUpdate,
      collection: mockCollection
    });
    mockCollection = vi.fn().mockReturnValue({
      doc: mockDoc,
      where: mockWhere,
      orderBy: mockOrderBy,
      add: mockAdd,
      get: mockGet
    });

    // Set up the adminDb mock
    const { adminDb } = require('@/lib/firebaseAdminConfig');
    adminDb.collection.mockImplementation(mockCollection);

    // Create a new repository instance for each test
    repository = new FirebasePersonRepository();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getById', () => {
    test('should return null when person is not found', async () => {
      // Arrange
      mockGet.mockResolvedValueOnce({ exists: false });

      // Act
      const result = await repository.getById('non-existent-id');

      // Assert
      expect(result).toBeNull();
      expect(mockCollection).toHaveBeenCalledWith('persons');
      expect(mockDoc).toHaveBeenCalledWith('non-existent-id');
      expect(mockGet).toHaveBeenCalled();
    });

    test('should return person when found', async () => {
      // Arrange
      const mockPerson = {
        name: 'John Doe',
        email: 'john@example.com',
        role: 'dentist',
        status: 'active',
        region: 'Wien',
        otpEnabled: false,
        notificationSettings: { inApp: true, email: false },
        createdAt: { toDate: () => new Date('2025-01-01') },
        updatedAt: { toDate: () => new Date('2025-01-02') }
      };
      
      mockGet.mockResolvedValueOnce({
        exists: true,
        id: 'test-id',
        data: () => mockPerson
      });

      // Act
      const result = await repository.getById('test-id');

      // Assert
      expect(result).not.toBeNull();
      expect(result?.id).toBe('test-id');
      expect(result?.name).toBe('John Doe');
      expect(result?.email).toBe('john@example.com');
      expect(mockCollection).toHaveBeenCalledWith('persons');
      expect(mockDoc).toHaveBeenCalledWith('test-id');
    });

    test('should throw DatabaseError when Firestore operation fails', async () => {
      // Arrange
      mockGet.mockRejectedValueOnce(new Error('Firestore error'));

      // Act & Assert
      await expect(repository.getById('test-id')).rejects.toThrow(DatabaseError);
    });
  });

  describe('create', () => {
    test('should create a person document with the correct data', async () => {
      // Arrange
      const personData = {
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'dentist' as const,
        status: 'active' as const,
        region: 'Wien',
        otpEnabled: false,
        notificationSettings: { inApp: true, email: false }
      };

      mockSet.mockResolvedValueOnce({});
      mockGet.mockResolvedValueOnce({ empty: true, docs: [] });

      // Act
      await repository.create('new-user-id', personData, 'en');

      // Assert
      expect(mockCollection).toHaveBeenCalledWith('persons');
      expect(mockDoc).toHaveBeenCalledWith('new-user-id');
      expect(mockSet).toHaveBeenCalled();
      
      // Check that the data passed to set includes our person data
      const setArg = mockSet.mock.calls[0][0];
      expect(setArg).toMatchObject(personData);
      expect(setArg).toHaveProperty('createdAt');
      expect(setArg).toHaveProperty('updatedAt');
    });

    test('should send notifications when creating a pending user', async () => {
      // Arrange
      const personData = {
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'dentist' as const,
        status: 'pending' as const,
        region: 'Wien',
        otpEnabled: false,
        notificationSettings: { inApp: true, email: false }
      };

      const mockLkMembers = [
        { 
          id: 'lk-member-1', 
          name: 'LK Member 1', 
          email: 'lk1@example.com',
          notificationSettings: { inApp: true, email: true }
        }
      ];

      mockSet.mockResolvedValueOnce({});
      
      // Mock getByRole to return LK members
      mockGet.mockResolvedValueOnce({ 
        empty: false, 
        docs: mockLkMembers.map(member => ({
          id: member.id,
          data: () => member
        }))
      });

      const { createNotification } = require('@/services/notificationService');
      const { sendEmail } = require('@/services/emailService');

      // Act
      await repository.create('new-user-id', personData, 'en');

      // Assert
      expect(mockCollection).toHaveBeenCalledWith('persons');
      expect(mockDoc).toHaveBeenCalledWith('new-user-id');
      expect(mockSet).toHaveBeenCalled();
      
      // Check that notifications were sent
      expect(createNotification).toHaveBeenCalled();
      expect(sendEmail).toHaveBeenCalled();
    });

    test('should throw DatabaseError when Firestore operation fails', async () => {
      // Arrange
      const personData = {
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'dentist' as const,
        status: 'active' as const,
        region: 'Wien',
        otpEnabled: false,
        notificationSettings: { inApp: true, email: false }
      };

      mockSet.mockRejectedValueOnce(new Error('Firestore error'));

      // Act & Assert
      await expect(repository.create('new-user-id', personData, 'en')).rejects.toThrow(DatabaseError);
    });
  });

  describe('update', () => {
    test('should update a person document with the correct data', async () => {
      // Arrange
      const updates = {
        name: 'Updated Name',
        email: 'updated@example.com'
      };

      mockUpdate.mockResolvedValueOnce({});

      // Act
      await repository.update('user-id', updates);

      // Assert
      expect(mockCollection).toHaveBeenCalledWith('persons');
      expect(mockDoc).toHaveBeenCalledWith('user-id');
      expect(mockUpdate).toHaveBeenCalled();
      
      // Check that the data passed to update includes our updates
      const updateArg = mockUpdate.mock.calls[0][0];
      expect(updateArg).toMatchObject(updates);
      expect(updateArg).toHaveProperty('updatedAt');
    });

    test('should throw DatabaseError when Firestore operation fails', async () => {
      // Arrange
      const updates = {
        name: 'Updated Name',
        email: 'updated@example.com'
      };

      mockUpdate.mockRejectedValueOnce(new Error('Firestore error'));

      // Act & Assert
      await expect(repository.update('user-id', updates)).rejects.toThrow(DatabaseError);
    });
  });

  describe('findByEmail', () => {
    test('should return null when person is not found', async () => {
      // Arrange
      mockGet.mockResolvedValueOnce({ empty: true });

      // Act
      const result = await repository.findByEmail('nonexistent@example.com');

      // Assert
      expect(result).toBeNull();
      expect(mockCollection).toHaveBeenCalledWith('persons');
      expect(mockWhere).toHaveBeenCalledWith('email', '==', 'nonexistent@example.com');
    });

    test('should return person when found by email', async () => {
      // Arrange
      const mockPerson = {
        name: 'John Doe',
        email: 'john@example.com',
        role: 'dentist',
        status: 'active',
        region: 'Wien',
        otpEnabled: false,
        notificationSettings: { inApp: true, email: false },
        createdAt: { toDate: () => new Date('2025-01-01') },
        updatedAt: { toDate: () => new Date('2025-01-02') }
      };
      
      mockGet.mockResolvedValueOnce({
        empty: false,
        docs: [{
          id: 'test-id',
          data: () => mockPerson
        }]
      });

      // Act
      const result = await repository.findByEmail('john@example.com');

      // Assert
      expect(result).not.toBeNull();
      expect(result?.id).toBe('test-id');
      expect(result?.email).toBe('john@example.com');
      expect(mockCollection).toHaveBeenCalledWith('persons');
      expect(mockWhere).toHaveBeenCalledWith('email', '==', 'john@example.com');
    });

    test('should throw DatabaseError when Firestore operation fails', async () => {
      // Arrange
      mockGet.mockRejectedValueOnce(new Error('Firestore error'));

      // Act & Assert
      await expect(repository.findByEmail('john@example.com')).rejects.toThrow(DatabaseError);
    });
  });

  describe('review', () => {
    test('should throw NotFoundError when person is not found', async () => {
      // Arrange
      mockGet.mockResolvedValueOnce({ exists: false });

      const auditor = {
        id: 'auditor-id',
        name: 'Auditor Name',
        role: 'lk_member' as const,
        chamber: 'wien'
      };

      // Act & Assert
      await expect(repository.review('non-existent-id', 'approve', undefined, auditor, 'en'))
        .rejects.toThrow(NotFoundError);
    });

    test('should throw ValidationError when there is no pending change to review', async () => {
      // Arrange
      const mockPerson = {
        id: 'test-id',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'dentist',
        status: 'active', // Not pending
        region: 'Wien',
        otpEnabled: false,
        pendingData: null, // No pending data
        notificationSettings: { inApp: true, email: false },
        createdAt: { toDate: () => new Date('2025-01-01') },
        updatedAt: { toDate: () => new Date('2025-01-02') }
      };
      
      mockGet.mockResolvedValueOnce({
        exists: true,
        id: 'test-id',
        data: () => mockPerson
      });

      const auditor = {
        id: 'auditor-id',
        name: 'Auditor Name',
        role: 'lk_member' as const,
        chamber: 'wien'
      };

      // Act & Assert
      await expect(repository.review('test-id', 'approve', undefined, auditor, 'en'))
        .rejects.toThrow(ValidationError);
    });

    test('should approve a pending registration', async () => {
      // Arrange
      const mockPerson = {
        id: 'test-id',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'dentist',
        status: 'pending', // Pending registration
        region: 'Wien',
        otpEnabled: false,
        notificationSettings: { inApp: true, email: true },
        createdAt: { toDate: () => new Date('2025-01-01') },
        updatedAt: { toDate: () => new Date('2025-01-02') }
      };
      
      mockGet.mockResolvedValueOnce({
        exists: true,
        id: 'test-id',
        data: () => mockPerson
      });

      mockUpdate.mockResolvedValueOnce({});

      const { createAuditLog } = require('@/services/auditLogService');
      const { createNotification } = require('@/services/notificationService');
      const { sendEmail } = require('@/services/emailService');

      const auditor = {
        id: 'auditor-id',
        name: 'Auditor Name',
        role: 'lk_member' as const,
        chamber: 'wien'
      };

      // Act
      await repository.review('test-id', 'approve', undefined, auditor, 'en');

      // Assert
      expect(mockUpdate).toHaveBeenCalled();
      expect(createAuditLog).toHaveBeenCalled();
      expect(createNotification).toHaveBeenCalled();
      expect(sendEmail).toHaveBeenCalled();
      
      // Check that the update includes setting status to active
      const updateArg = mockUpdate.mock.calls[0][0];
      expect(updateArg).toHaveProperty('status', 'active');
    });

    test('should approve pending data changes', async () => {
      // Arrange
      const pendingData = {
        name: 'Updated Name',
        email: 'updated@example.com'
      };
      
      const mockPerson = {
        id: 'test-id',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'dentist',
        status: 'active',
        region: 'Wien',
        otpEnabled: false,
        pendingData, // Has pending data changes
        hasPendingChanges: true,
        notificationSettings: { inApp: true, email: true },
        createdAt: { toDate: () => new Date('2025-01-01') },
        updatedAt: { toDate: () => new Date('2025-01-02') }
      };
      
      mockGet.mockResolvedValueOnce({
        exists: true,
        id: 'test-id',
        data: () => mockPerson
      });

      mockUpdate.mockResolvedValueOnce({});

      const { createAuditLog } = require('@/services/auditLogService');
      const { createNotification } = require('@/services/notificationService');
      const { sendEmail } = require('@/services/emailService');

      const auditor = {
        id: 'auditor-id',
        name: 'Auditor Name',
        role: 'lk_member' as const,
        chamber: 'wien'
      };

      // Act
      await repository.review('test-id', 'approve', undefined, auditor, 'en');

      // Assert
      expect(mockUpdate).toHaveBeenCalled();
      expect(createAuditLog).toHaveBeenCalled();
      expect(createNotification).toHaveBeenCalled();
      expect(sendEmail).toHaveBeenCalled();
      
      // Check that the update includes the pending data
      const updateArg = mockUpdate.mock.calls[0][0];
      expect(updateArg).toMatchObject(pendingData);
    });
  });
});