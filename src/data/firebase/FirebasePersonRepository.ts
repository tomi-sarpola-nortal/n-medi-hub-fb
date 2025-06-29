import { adminDb as db } from '@/lib/firebaseAdminConfig';
import {
  FieldValue,
  type Timestamp,
  type DocumentSnapshot,
  type QueryDocumentSnapshot,
} from 'firebase-admin/firestore';
import type { Person, PersonCreationData, AuditLogCreationData, UserRole } from '@/lib/types';
import { createAuditLog } from '@/services/auditLogService';
import { createNotification } from '@/services/notificationService';
import { sendEmail } from '@/services/emailService';
import { getTranslations } from '@/lib/translations';
import { IPersonRepository } from '../interfaces/IPersonRepository';

const PERSONS_COLLECTION = 'persons';

export class FirebasePersonRepository implements IPersonRepository {
  private checkDb() {
    if (!db) {
      throw new Error("Firestore is not initialized. Please check your Firebase configuration in the .env file.");
    }
  }

  private snapshotToPerson(snapshot: DocumentSnapshot<any> | QueryDocumentSnapshot<any>): Person {
    const data = snapshot.data();
    if (!data) {
      throw new Error(`Document data is undefined for snapshot ID: ${snapshot.id}`);
    }

    // Helper to safely convert Firestore Timestamps or date strings to YYYY-MM-DD strings
    const toDateString = (dateValue: any): string | undefined => {
      if (!dateValue) return undefined;
      // If it's a Firestore Timestamp, convert it
      if (dateValue && typeof dateValue.toDate === 'function') {
        return dateValue.toDate().toISOString().split('T')[0];
      }
      // If it's already a string, return it
      if (typeof dateValue === 'string') {
        return dateValue;
      }
      // Otherwise, it's an unknown format
      return undefined;
    }

    const createdAtTimestamp = data.createdAt as Timestamp;
    const updatedAtTimestamp = data.updatedAt as Timestamp;

    return {
      id: snapshot.id,
      name: data.name,
      email: data.email,
      role: data.role,
      region: data.region,
      dentistId: data.dentistId,
      avatarUrl: data.avatarUrl,
      status: data.status,
      otpEnabled: data.otpEnabled,
      otpSecret: data.otpSecret,
      stateChamberId: data.stateChamberId || 'wien',
      
      // Add missing fields to make it a complete user representation
      approved: data.approved,
      educationPoints: data.educationPoints,
      notificationSettings: data.notificationSettings || { inApp: true, email: false },

      // Personal Data from Step 3
      title: data.title,
      firstName: data.firstName,
      lastName: data.lastName,
      dateOfBirth: toDateString(data.dateOfBirth),
      placeOfBirth: data.placeOfBirth,
      nationality: data.nationality,
      streetAddress: data.streetAddress,
      postalCode: data.postalCode,
      city: data.city,
      stateOrProvince: data.stateOrProvince,
      phoneNumber: data.phoneNumber,
      idDocumentUrl: data.idDocumentUrl,
      idDocumentName: data.idDocumentName,

      // Professional Qualifications from Step 4
      currentProfessionalTitle: data.currentProfessionalTitle,
      specializations: data.specializations,
      languages: data.languages,
      graduationDate: toDateString(data.graduationDate),
      university: data.university,
      approbationNumber: data.approbationNumber,
      approbationDate: toDateString(data.approbationDate),
      diplomaUrl: data.diplomaUrl,
      diplomaName: data.diplomaName,
      approbationCertificateUrl: data.approbationCertificateUrl,
      approbationCertificateName: data.approbationCertificateName,
      specialistRecognitionUrl: data.specialistRecognitionUrl,
      specialistRecognitionName: data.specialistRecognitionName,
      
      // Practice Information from Step 5
      practiceName: data.practiceName,
      practiceStreetAddress: data.practiceStreetAddress,
      practicePostalCode: data.practicePostalCode,
      practiceCity: data.practiceCity,
      practicePhoneNumber: data.practicePhoneNumber,
      practiceFaxNumber: data.practiceFaxNumber,
      practiceEmail: data.practiceEmail,
      practiceWebsite: data.practiceWebsite,
      healthInsuranceContracts: data.healthInsuranceContracts,

      rejectionReason: data.rejectionReason,

      // Pending data changes
      pendingData: data.pendingData,
      hasPendingChanges: data.hasPendingChanges,

      createdAt: createdAtTimestamp?.toDate().toISOString(),
      updatedAt: updatedAtTimestamp?.toDate().toISOString(),
    };
  }

  /**
   * Creates a new person document in Firestore.
   * The document ID will be the Firebase Auth UID.
   * @param uid - The Firebase Auth User ID.
   * @param personData - The data for the new person, including all registration steps data.
   * @param locale - The locale for sending notifications.
   */
  async create(
    uid: string,
    personData: PersonCreationData,
    locale: string
  ): Promise<void> {
    this.checkDb();
    const personDocRef = db.collection(PERSONS_COLLECTION).doc(uid);
    
    const dataToSet = Object.fromEntries(
      Object.entries(personData).filter(([_, v]) => v !== undefined && v !== null)
    );

    await personDocRef.set({
      ...dataToSet, 
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    if (personData.status === 'pending') {
      const t = getTranslations(locale);
      const chamberMembers = await this.getByRole('lk_member');
      
      const notificationPromises = chamberMembers.map(async (member) => {
        if (member.notificationSettings?.inApp) {
          await createNotification({
            userId: member.id,
            message: t.notification_new_registration_review.replace('{targetName}', personData.name),
            link: `/member-overview/${uid}/review`,
            isRead: false,
          });
        }
        if (member.notificationSettings?.email && member.email) {
          await sendEmail({
            to: [member.email],
            message: {
              subject: t.email_subject_new_registration,
              html: t.email_body_new_registration
                .replace('{targetName}', member.name)
                .replace('{actorName}', personData.name)
            }
          });
        }
      });
      await Promise.all(notificationPromises);
    }
  }

  /**
   * Retrieves a person document from Firestore by its ID (which should be Firebase Auth UID).
   * @param id - The ID of the person to retrieve (Firebase Auth UID).
   * @returns A Person object if found, otherwise null.
   */
  async getById(id: string): Promise<Person | null> {
    this.checkDb();
    const docRef = db.collection(PERSONS_COLLECTION).doc(id);
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      return null;
    }
    return this.snapshotToPerson(docSnap);
  }

  /**
   * Updates an existing person document in Firestore.
   * @param id - The ID of the person to update (Firebase Auth UID).
   * @param updates - An object containing the fields to update.
   */
  async update(
    id: string,
    updates: Partial<Person> 
  ): Promise<void> {
    this.checkDb();
    const docRef = db.collection(PERSONS_COLLECTION).doc(id);
    
    const dataToUpdate = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );

    await docRef.update({
      ...dataToUpdate,
      updatedAt: FieldValue.serverTimestamp(),
    });
  }

  /**
   * Finds a person document by their email address.
   * @param email - The email address to search for.
   * @returns A Person object if found, otherwise null.
   */
  async findByEmail(email: string): Promise<Person | null> {
    this.checkDb();
    const q = db.collection(PERSONS_COLLECTION).where('email', '==', email);
    const querySnapshot = await q.get();
    if (querySnapshot.empty) {
      return null;
    }
    return this.snapshotToPerson(querySnapshot.docs[0]);
  }

  /**
   * Finds a person document by their dentist ID.
   * @param dentistId - The dentist ID to search for.
   * @returns A Person object if found, otherwise null.
   */
  async findByDentistId(dentistId: string): Promise<Person | null> {
    this.checkDb();
    const q = db.collection(PERSONS_COLLECTION).where('dentistId', '==', dentistId);
    const querySnapshot = await q.get();
    if (querySnapshot.empty) {
      return null;
    }
    return this.snapshotToPerson(querySnapshot.docs[0]);
  }

  /**
   * Retrieves all persons from the Firestore collection.
   * @returns An array of Person objects.
   */
  async getAll(): Promise<Person[]> {
    this.checkDb();
    const querySnapshot = await db.collection(PERSONS_COLLECTION).get();
    return querySnapshot.docs.map(doc => this.snapshotToPerson(doc));
  }

  /**
   * Retrieves all persons with a specific role.
   * @param role The role to filter by.
   * @returns An array of Person objects.
   */
  async getByRole(role: UserRole): Promise<Person[]> {
    this.checkDb();
    const q = db.collection(PERSONS_COLLECTION).where('role', '==', role);
    const querySnapshot = await q.get();
    return querySnapshot.docs.map(doc => this.snapshotToPerson(doc));
  }

  /**
   * Processes a review for a pending person registration or data change.
   * @param personId The ID of the person to review.
   * @param decision The review decision: 'approve', 'deny', or 'reject'.
   * @param justification An optional reason for denial or rejection.
   * @param auditor The LK member performing the review.
   * @param locale The locale for email translations.
   */
  async review(
    personId: string, 
    decision: 'approve' | 'deny' | 'reject', 
    justification: string | undefined,
    auditor: { id: string; name: string; role: UserRole; chamber: string; },
    locale: string = 'en'
  ): Promise<void> {
    this.checkDb();
    const person = await this.getById(personId);
    if (!person) throw new Error("Person not found");

    const t = getTranslations(locale);
    const isNewRegistration = person.status === 'pending';
    const isDataChange = person.status === 'active' && !!person.pendingData;

    // Log the action
    const logData: AuditLogCreationData = {
      userId: auditor.id,
      userName: auditor.name,
      userRole: auditor.role,
      userChamber: auditor.chamber,
      collectionName: 'persons',
      documentId: personId,
      fieldName: isNewRegistration ? 'status' : 'pendingData',
      operation: 'update',
      impactedPersonId: personId,
      impactedPersonName: person.name,
      details: `${isNewRegistration ? 'Registration' : 'Data change'} ${decision}ed by ${auditor.name}${justification ? `: ${justification}` : ''}`,
    };
    await createAuditLog(logData);

    let updates: Partial<Person> = {};
    let notificationKey: string = '';
    let emailSubjectKey: string = '';
    let emailBodyKey: string = '';

    if (isDataChange) {
      updates.hasPendingChanges = FieldValue.delete() as any;
      updates.pendingData = FieldValue.delete() as any;
      if (decision === 'approve') {
        updates = { ...updates, ...person.pendingData! };
        notificationKey = 'notification_data_change_approved';
        emailSubjectKey = 'email_subject_data_change_approved';
        emailBodyKey = 'email_body_data_change_approved';
      } else {
        updates.rejectionReason = justification;
        notificationKey = 'notification_data_change_rejected';
        emailSubjectKey = 'email_subject_data_change_rejected';
        emailBodyKey = 'email_body_data_change_rejected';
      }
    } else if (isNewRegistration) {
      if (decision === 'approve') {
        updates.status = 'active';
        if (!person.dentistId) {
          updates.dentistId = `ZA-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        }
        updates.rejectionReason = FieldValue.delete() as any;
        notificationKey = 'notification_registration_approved';
        emailSubjectKey = 'email_subject_registration_approved';
        emailBodyKey = 'email_body_registration_approved';
      } else {
        updates.status = decision === 'deny' ? 'inactive' : 'rejected';
        updates.rejectionReason = justification;
        notificationKey = 'notification_registration_rejected';
        emailSubjectKey = 'email_subject_registration_rejected';
        emailBodyKey = 'email_body_registration_rejected';
      }
    } else {
      throw new Error("No pending registration or data change to review for this user.");
    }
    
    await this.update(personId, updates);

    // Send notifications
    if (person.notificationSettings?.inApp) {
      await createNotification({ 
        userId: person.id, 
        message: t[notificationKey], 
        link: `/settings`, 
        isRead: false 
      });
    }
    if (person.notificationSettings?.email && person.email) {
      await sendEmail({
        to: [person.email],
        message: {
          subject: t[emailSubjectKey],
          html: t[emailBodyKey].replace('{targetName}', person.name)
        }
      });
    }
  }

  /**
   * Retrieves persons that need to be reviewed (pending status or with pending data changes).
   * @returns An array of Person objects that need review.
   */
  async getPersonsToReview(): Promise<Person[]> {
    this.checkDb();
    const personsCollection = db.collection(PERSONS_COLLECTION);
    
    const q = personsCollection.where('status', 'in', ['pending', 'hasPendingChanges']);
    const querySnapshot = await q.get();

    const personsMap = new Map<string, Person>();

    querySnapshot.docs.forEach(doc => {
      const person = this.snapshotToPerson(doc);
      personsMap.set(person.id, person);
    });
    
    const allPersons = Array.from(personsMap.values());

    return allPersons.sort((a, b) => {
      const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return dateB - dateA;
    });
  }
}