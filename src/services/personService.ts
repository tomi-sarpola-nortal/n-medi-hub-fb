
'use server';

import { db } from '@/lib/firebaseConfig';
import type { Person, PersonCreationData, AuditLogCreationData, UserRole } from '@/lib/types';
import {
  collection,
  doc,
  setDoc, // Changed from addDoc to use specific UID as doc ID
  getDoc,
  updateDoc,
  deleteDoc,
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
 */
export async function createPerson(
  uid: string,
  personData: PersonCreationData
): Promise<void> {
  checkDb();
  const personDocRef = doc(db, PERSONS_COLLECTION, uid);
  
  // Sanitize data: Firestore cannot store `undefined` values.
  // Create a new object by filtering out any keys with `undefined` values.
  const dataToSet = Object.fromEntries(
    Object.entries(personData).filter(([_, v]) => v !== undefined && v !== null)
  );

  await setDoc(personDocRef, {
    ...dataToSet, 
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
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
  
  // Sanitize updates: Remove any keys with `undefined` values before updating.
  const dataToUpdate = Object.fromEntries(
    Object.entries(updates).filter(([_, v]) => v !== undefined)
  );

  await updateDoc(docRef, {
    ...dataToUpdate,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Deletes a person document from Firestore by its ID.
 * @param id - The ID of the person to delete.
 */
export async function deletePerson(id: string): Promise<void> {
  checkDb();
  const docRef = doc(db, PERSONS_COLLECTION, id);
  await deleteDoc(docRef);
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
  // Assuming email is unique, so take the first document.
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
  // Assuming dentistId is unique, take the first document.
  return snapshotToPerson(querySnapshot.docs[0]);
}

/**
 * Retrieves all persons from the Firestore collection.
 * Use with caution on large datasets.
 * @returns An array of Person objects.
 */
export async function getAllPersons(): Promise<Person[]> {
  checkDb();
  const querySnapshot = await getDocs(collection(db, PERSONS_COLLECTION));
  return querySnapshot.docs.map(snapshotToPerson);
}

/**
 * Processes a review for a pending person registration or data change.
 * @param personId The ID of the person to review.
 * @param decision The review decision: 'approve', 'deny', or 'reject'.
 * @param justification An optional reason for denial or rejection.
 */
export async function reviewPerson(
    personId: string, 
    decision: 'approve' | 'deny' | 'reject', 
    justification: string | undefined,
    auditor: { id: string; name: string; role: UserRole; chamber: string; }
): Promise<void> {
    'use server';
    checkDb();
    const person = await getPersonById(personId);
    if (!person) throw new Error("Person not found");

    const baseDetails = `Decision: ${decision}. Justification: ${justification || 'N/A'}`;

    // Create Audit Log
    const logData: AuditLogCreationData = {
        userId: auditor.id,
        userName: auditor.name,
        userRole: auditor.role,
        userChamber: auditor.chamber,
        collectionName: PERSONS_COLLECTION,
        documentId: personId,
        impactedPersonId: personId,
        impactedPersonName: person.name,
        operation: 'update',
        fieldName: 'status', // Default field being changed
        details: baseDetails
    };

    if (person.status === 'active' && person.pendingData) {
        // Data change review
        logData.fieldName = Object.keys(person.pendingData);
        logData.details = `Data change review. ${baseDetails}`;
    } else if (person.status === 'pending') {
        // New registration review
        logData.details = `New registration review. ${baseDetails}`;
    }

    await createAuditLog(logData);


    // Perform the update logic
    // Case 1: Reviewing a data change for an active user
    if (person.status === 'active' && person.pendingData) {
        if (decision === 'approve') {
            const updatesToApply = person.pendingData;
            await updatePerson(personId, { ...updatesToApply, pendingData: deleteField() as any, hasPendingChanges: deleteField() as any, rejectionReason: deleteField() as any });
        } else { // deny or reject
            await updatePerson(personId, { pendingData: deleteField() as any, hasPendingChanges: deleteField() as any, rejectionReason: justification });
        }
        return;
    }

    // Case 2: Reviewing a new registration
    if (person.status === 'pending') {
        const updates: Partial<Person> = {};
        switch (decision) {
            case 'approve':
                updates.status = 'active';
                if (!person.dentistId) {
                    updates.dentistId = `ZA-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
                }
                updates.rejectionReason = deleteField() as any;
                break;
            case 'deny':
                updates.status = 'inactive';
                updates.rejectionReason = justification;
                break;
            case 'reject':
                updates.status = 'rejected';
                updates.rejectionReason = justification;
                break;
        }
        // Also clear the hasPendingChanges flag if it exists for some reason
        updates.hasPendingChanges = deleteField() as any;
        await updatePerson(personId, updates);
        return;
    }

    throw new Error("No pending registration or data change to review for this user.");
}

/**
 * Retrieves persons needing review: new registrations OR those with data changes.
 * This is done with two separate queries to avoid needing a complex composite index.
 * @param limitValue - The maximum number of persons to retrieve.
 * @returns An array of Person objects, sorted by most recently updated.
 */
export async function getPersonsToReview(limitValue?: number): Promise<Person[]> {
    'use server';
    checkDb();
    const personsCollection = collection(db, PERSONS_COLLECTION);
    
    // Query 1: Get users with 'pending' status
    const pendingQuery = query(
        personsCollection,
        where('status', '==', 'pending')
    );

    // Query 2: Get users with pending data changes
    const changesQuery = query(
        personsCollection,
        where('hasPendingChanges', '==', true)
    );

    const [pendingSnapshot, changesSnapshot] = await Promise.all([
        getDocs(pendingQuery),
        getDocs(changesQuery)
    ]);

    const personsMap = new Map<string, Person>();

    // Add pending users to the map
    pendingSnapshot.docs.forEach(doc => {
        const person = snapshotToPerson(doc);
        personsMap.set(person.id, person);
    });

    // Add users with changes to the map (will overwrite duplicates)
    changesSnapshot.docs.forEach(doc => {
        const person = snapshotToPerson(doc);
        personsMap.set(person.id, person);
    });
    
    // Combine, sort, and apply limit
    const allPersons = Array.from(personsMap.values());

    const sortedPersons = allPersons.sort((a, b) => {
        const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        return dateB - dateA; // Descending order
    });

    return limitValue ? sortedPersons.slice(0, limitValue) : sortedPersons;
}


    