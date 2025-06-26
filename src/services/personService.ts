
'use server';

import { db } from '@/lib/firebaseConfig';
import type { Person, PersonCreationData, AuditLogCreationData, UserRole } from '@/lib/types';
import {
  collection,
  doc,
  setDoc, // Changed from addDoc to use specific UID as doc ID
  getDoc,
  updateDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  type Timestamp,
  type DocumentSnapshot,
  type QueryDocumentSnapshot,
  orderBy,
  limit,
  deleteField,
  or,
} from 'firebase/firestore';
import { createAuditLog } from './auditLogService';
import { createNotification } from './notificationService';
import { sendEmail } from './emailService';
import { getTranslations } from '@/lib/translations';


const PERSONS_COLLECTION = 'persons';

// Helper function to ensure Firestore is initialized
const checkDb = () => {
  if (!db) {
    throw new Error("Firestore is not initialized. Please check your Firebase configuration in the .env file.");
  }
};

// Helper to convert Firestore document snapshot to Person type
const snapshotToPerson = (snapshot: DocumentSnapshot<any> | QueryDocumentSnapshot<any>): Person => {
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
};

/**
 * Creates a new person document in Firestore.
 * The document ID will be the Firebase Auth UID.
 * @param uid - The Firebase Auth User ID.
 * @param personData - The data for the new person, including all registration steps data.
 * @param locale - The locale for sending notifications.
 */
export async function createPerson(
  uid: string,
  personData: PersonCreationData,
  locale: string
): Promise<void> {
  checkDb();
  const personDocRef = doc(db, PERSONS_COLLECTION, uid);
  
  const dataToSet = Object.fromEntries(
    Object.entries(personData).filter(([_, v]) => v !== undefined && v !== null)
  );

  await setDoc(personDocRef, {
    ...dataToSet, 
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  if (personData.status === 'pending') {
    const t = getTranslations(locale);
    const chamberMembers = await getPersonsByRole('lk_member');
    
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
export async function getPersonById(id: string): Promise<Person | null> {
  checkDb();
  const docRef = doc(db, PERSONS_COLLECTION, id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    return null;
  }
  return snapshotToPerson(docSnap);
}

/**
 * Updates an existing person document in Firestore.
 * @param id - The ID of the person to update (Firebase Auth UID).
 * @param updates - An object containing the fields to update.
 */
export async function updatePerson(
  id: string,
  updates: Partial<Person> 
): Promise<void> {
  checkDb();
  const docRef = doc(db, PERSONS_COLLECTION, id);
  
  const dataToUpdate = Object.fromEntries(
    Object.entries(updates).filter(([_, v]) => v !== undefined)
  );

  await updateDoc(docRef, {
    ...dataToUpdate,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Finds a person document by their email address.
 * @param email - The email address to search for.
 * @returns A Person object if found, otherwise null.
 */
export async function findPersonByEmail(email: string): Promise<Person | null> {
  checkDb();
  const q = query(collection(db, PERSONS_COLLECTION), where('email', '==', email));
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) {
    return null;
  }
  return snapshotToPerson(querySnapshot.docs[0]);
}

/**
 * Finds a person document by their dentist ID.
 * @param dentistId - The dentist ID to search for.
 * @returns A Person object if found, otherwise null.
 */
export async function findPersonByDentistId(dentistId: string): Promise<Person | null> {
  checkDb();
  const q = query(collection(db, PERSONS_COLLECTION), where('dentistId', '==', dentistId));
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) {
    return null;
  }
  return snapshotToPerson(querySnapshot.docs[0]);
}

/**
 * Retrieves all persons from the Firestore collection.
 * @returns An array of Person objects.
 */
export async function getAllPersons(): Promise<Person[]> {
  checkDb();
  const querySnapshot = await getDocs(collection(db, PERSONS_COLLECTION));
  return querySnapshot.docs.map(snapshotToPerson);
}

/**
 * Retrieves all persons with a specific role.
 * @param role The role to filter by.
 * @returns An array of Person objects.
 */
export async function getPersonsByRole(role: UserRole): Promise<Person[]> {
  checkDb();
  const q = query(collection(db, PERSONS_COLLECTION), where('role', '==', role));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(snapshotToPerson);
}

/**
 * Processes a review for a pending person registration or data change.
 * @param personId The ID of the person to review.
 * @param decision The review decision: 'approve', 'deny', or 'reject'.
 * @param justification An optional reason for denial or rejection.
 * @param auditor The LK member performing the review.
 * @param locale The locale for email translations.
 */
export async function reviewPerson(
    personId: string, 
    decision: 'approve' | 'deny' | 'reject', 
    justification: string | undefined,
    auditor: { id: string; name: string; role: UserRole; chamber: string; },
    locale: string
): Promise<void> {
    'use server';
    checkDb();
    const person = await getPersonById(personId);
    if (!person) throw new Error("Person not found");

    const t = getTranslations(locale);
    const isNewRegistration = person.status === 'pending';
    const isDataChange = person.status === 'active' && !!person.pendingData;

    // Log the action
    const logData: AuditLogCreationData = { /* ... as before ... */ };
    await createAuditLog(logData);

    let updates: Partial<Person> = {};
    let notificationKey: string = '';
    let emailSubjectKey: string = '';
    let emailBodyKey: string = '';

    if (isDataChange) {
        updates.hasPendingChanges = deleteField() as any;
        updates.pendingData = deleteField() as any;
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
        updates.hasPendingChanges = deleteField() as any;
        if (decision === 'approve') {
            updates.status = 'active';
            if (!person.dentistId) {
                updates.dentistId = `ZA-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
            }
            updates.rejectionReason = deleteField() as any;
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
    
    await updatePerson(personId, updates);

    // Send notifications
    if (person.notificationSettings?.inApp) {
        await createNotification({ userId: person.id, message: t[notificationKey], link: `/settings`, isRead: false });
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


export async function getPersonsToReview(limitValue?: number): Promise<Person[]> {
    'use server';
    checkDb();
    const personsCollection = collection(db, PERSONS_COLLECTION);
    
    const pendingQuery = query(
        personsCollection,
        where('status', '==', 'pending')
    );

    const changesQuery = query(
        personsCollection,
        where('hasPendingChanges', '==', true)
    );

    const [pendingSnapshot, changesSnapshot] = await Promise.all([
        getDocs(pendingQuery),
        getDocs(changesQuery)
    ]);

    const personsMap = new Map<string, Person>();

    pendingSnapshot.docs.forEach(doc => {
        const person = snapshotToPerson(doc);
        personsMap.set(person.id, person);
    });

    changesSnapshot.docs.forEach(doc => {
        const person = snapshotToPerson(doc);
        personsMap.set(person.id, person);
    });
    
    const allPersons = Array.from(personsMap.values());

    const sortedPersons = allPersons.sort((a, b) => {
        const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        return dateB - dateA;
    });

    return limitValue ? sortedPersons.slice(0, limitValue) : sortedPersons;
}
