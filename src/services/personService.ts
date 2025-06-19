
'use server';

import { db } from '@/lib/firebaseConfig';
import type { Person, PersonCreationData } from '@/types';
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
} from 'firebase/firestore';

const PERSONS_COLLECTION = 'persons';

// Helper to convert Firestore document snapshot to Person type
const snapshotToPerson = (snapshot: DocumentSnapshot<any> | QueryDocumentSnapshot<any>): Person => {
  const data = snapshot.data();
  if (!data) {
    throw new Error(`Document data is undefined for snapshot ID: ${snapshot.id}`);
  }
  return {
    id: snapshot.id,
    name: data.name,
    email: data.email, // email will be stored in Firestore document as well for querying/display
    // hashedPassword removed
    role: data.role,
    region: data.region,
    dentistId: data.dentistId,
    avatarUrl: data.avatarUrl,
    status: data.status,
    otpEnabled: data.otpEnabled,
    otpSecret: data.otpSecret,
    createdAt: data.createdAt as Timestamp,
    updatedAt: data.updatedAt as Timestamp,
  };
};

/**
 * Creates a new person document in Firestore.
 * The document ID will be the Firebase Auth UID.
 * @param uid - The Firebase Auth User ID.
 * @param personData - The data for the new person, including email.
 */
export async function createPerson(
  uid: string,
  personData: PersonCreationData & { email: string } // Ensure email is part of the data
): Promise<void> {
  const personDocRef = doc(db, PERSONS_COLLECTION, uid);
  await setDoc(personDocRef, {
    ...personData, // email is included here
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
  updates: Partial<PersonCreationData> // Updated to use PersonCreationData for updates
): Promise<void> {
  const docRef = doc(db, PERSONS_COLLECTION, id);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Deletes a person document from Firestore by its ID.
 * @param id - The ID of the person to delete.
 */
export async function deletePerson(id: string): Promise<void> {
  const docRef = doc(db, PERSONS_COLLECTION, id);
  await deleteDoc(docRef);
}

/**
 * Finds a person document by their email address.
 * @param email - The email address to search for.
 * @returns A Person object if found, otherwise null.
 */
export async function findPersonByEmail(email: string): Promise<Person | null> {
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
  const querySnapshot = await getDocs(collection(db, PERSONS_COLLECTION));
  return querySnapshot.docs.map(snapshotToPerson);
}
