import { describe, test, expect, beforeEach, vi, afterEach } from 'vitest';
import { FirebasePersonRepository } from '@/data/firebase/FirebasePersonRepository';
import { 
  NotFoundError, 
  ValidationError, 
  DatabaseError, 
} from '@/lib/errors';
import { createAuditLog } from '@/services/auditLogService';
import { createNotification } from '@/services/notificationService';
import { sendEmail } from '@/services/emailService';
import { getTranslations } from '@/lib/translations';

// Mock the services used by the repository
vi.mock('@/services/auditLogService');
vi.mock('@/services/notificationService');
vi.mock('@/services/emailService');
vi.mock('@/lib/translations');

describe('FirebasePersonRepository', () => {
  let repository: FirebasePersonRepository;
  let mockCollection: any;
  let mockDoc: any;
  let mockWhere: any;
  let mockOrderBy: any;
  let mockGet: any;
  let mockSet: any;
  let mockUpdate: any;
  let mockDelete: any;
  let mockAdminDb: any;

  beforeEach(() => {
    vi.resetAllMocks();

    mockGet = vi.fn();
    mockSet = vi.fn(() => Promise.resolve());
    mockUpdate = vi.fn(() => Promise.resolve());
    mockDelete = vi.fn(() => Promise.resolve());
    mockOrderBy = vi.fn(() => ({ get: mockGet }));
    mockWhere = vi.fn(() => ({ get: mockGet, orderBy: mockOrderBy, where: vi.fn() }));

    mockDoc = vi.fn(() => ({
      get: mockGet,
      set: mockSet,
      update: mockUpdate,
      delete: mockDelete,
      collection: vi.fn(),
    }));

    mockCollection = vi.fn(() => ({
      doc: mockDoc,
      where: mockWhere,
      orderBy: mockOrderBy,
      get: mockGet
    }));

    mockAdminDb = {
      collection: mockCollection,
    };
    
    (getTranslations as vi.Mock).mockReturnValue({
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
    });

    repository = new FirebasePersonRepository(mockAdminDb);
  });

   describe('getById', () => {
    test('should return null when person is not found', async () => {
      mockGet.mockResolvedValueOnce({ exists: false });
      const result = await repository.getById('non-existent-id');
      expect(result).toBeNull();
    });

    test('should return person when found', async () => {
      const mockPersonData = { name: 'John Doe', email: 'john@example.com' };
      mockGet.mockResolvedValueOnce({ exists: true, id: 'test-id', data: () => mockPersonData });
      const result = await repository.getById('test-id');
      expect(result).not.toBeNull();
      expect(result?.id).toBe('test-id');
      expect(result?.name).toBe('John Doe');
    });

    test('should throw DatabaseError on failure', async () => {
      mockGet.mockRejectedValueOnce(new Error('Firestore error'));
      await expect(repository.getById('test-id')).rejects.toThrow(DatabaseError);
    });
  });

  describe('create', () => {
    test('should create a person document', async () => {
      const personData = { name: 'Jane Smith', email: 'jane@example.com', role: 'dentist' as const, status: 'active' as const, region: 'Wien', otpEnabled: false, notificationSettings: { inApp: true, email: false } };
      await repository.create('new-user-id', personData, 'en');
      expect(mockSet).toHaveBeenCalled();
      const setArg = mockSet.mock.calls[0][0];
      expect(setArg).toMatchObject(personData);
    });

    test('should send notifications for pending users', async () => {
        const personData = { name: 'Pending User', email: 'pending@example.com', role: 'dentist' as const, status: 'pending' as const, region: 'Wien', otpEnabled: false, notificationSettings: { inApp: true, email: false } };
        
        // Temporarily mock getByRole for this test
        const originalGetByRole = repository.getByRole;
        repository.getByRole = vi.fn().mockResolvedValue([{ id: 'lk-member-1', name: 'LK Member', email: 'lk@example.com', notificationSettings: { inApp: true, email: true } }]);

        await repository.create('pending-id', personData, 'en');

        expect(createNotification).toHaveBeenCalled();
        expect(sendEmail).toHaveBeenCalled();

        repository.getByRole = originalGetByRole; // Restore
    });
  });
  
  describe('review', () => {
    test('should throw NotFoundError if person does not exist', async () => {
        mockGet.mockResolvedValueOnce({ exists: false });
        const auditor = { id: 'auditor-id', name: 'Auditor', role: 'lk_member' as const, bureau: 'wien' };
        await expect(repository.review('non-existent-id', 'approve', undefined, auditor, 'en')).rejects.toThrow(NotFoundError);
    });

    test('should throw ValidationError if no pending changes exist', async () => {
        const mockPersonData = { status: 'active', pendingData: null };
        mockGet.mockResolvedValueOnce({ exists: true, data: () => mockPersonData });
        const auditor = { id: 'auditor-id', name: 'Auditor', role: 'lk_member' as const, bureau: 'wien' };
        await expect(repository.review('test-id', 'approve', undefined, auditor, 'en')).rejects.toThrow(ValidationError);
    });

    test('should approve a pending registration', async () => {
        const mockPersonData = { status: 'pending', name: 'Newbie', notificationSettings: { inApp: true, email: true } };
        mockGet.mockResolvedValueOnce({ exists: true, id: 'test-id', data: () => mockPersonData });
        await repository.review('test-id', 'approve', undefined, { id: 'auditor-id', name: 'Auditor', role: 'lk_member' as const, bureau: 'wien' }, 'en');
        expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ status: 'active' }));
        expect(createAuditLog).toHaveBeenCalled();
        expect(sendEmail).toHaveBeenCalled();
    });

    test('should approve pending data changes', async () => {
        const pendingData = { name: 'Updated Name' };
        const mockPersonData = { status: 'active', name: 'Old Name', pendingData, hasPendingChanges: true, notificationSettings: { inApp: true, email: true } };
        mockGet.mockResolvedValueOnce({ exists: true, id: 'test-id', data: () => mockPersonData });
        await repository.review('test-id', 'approve', undefined, { id: 'auditor-id', name: 'Auditor', role: 'lk_member' as const, bureau: 'wien' }, 'en');
        expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ name: 'Updated Name', hasPendingChanges: expect.anything() }));
        expect(createAuditLog).toHaveBeenCalled();
    });
  });
});
