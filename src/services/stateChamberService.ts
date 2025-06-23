
'use server';

import { db } from '@/lib/firebaseConfig';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  type DocumentSnapshot,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import type { StateChamber, StateChamberCreationData } from '@/lib/types';

const STATE_CHAMBERS_COLLECTION = 'state_chambers';

const checkDb = () => {
  if (!db) {
    throw new Error("Firestore is not initialized. Please check your Firebase configuration.");
  }
};

const snapshotToStateChamber = (snapshot: DocumentSnapshot<any> | QueryDocumentSnapshot<any>): StateChamber => {
  const data = snapshot.data();
  if (!data) {
    throw new Error(`Document data is undefined for snapshot ID: ${snapshot.id}`);
  }
  return {
    id: snapshot.id,
    name: data.name,
    address: data.address,
    phone: data.phone,
    email: data.email,
    officeHours: data.officeHours,
  } as StateChamber;
};

/**
 * Creates a new state chamber document in Firestore. The ID is provided explicitly.
 * @param id The document ID for the new chamber (e.g., 'wien').
 * @param chamberData The data for the new chamber.
 */
export async function createStateChamber(id: string, chamberData: StateChamberCreationData): Promise<void> {
  checkDb();
  const chamberDocRef = doc(db, STATE_CHAMBERS_COLLECTION, id);
  await setDoc(chamberDocRef, chamberData);
}

/**
 * Finds a state chamber by its ID.
 * @param id The ID to search for.
 * @returns A StateChamber object if found, otherwise null.
 */
export async function getStateChamberById(id: string): Promise<StateChamber | null> {
  checkDb();
  const docRef = doc(db, STATE_CHAMBERS_COLLECTION, id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    return null;
  }
  return snapshotToStateChamber(docSnap);
}


/**
 * Retrieves all state chambers from Firestore.
 * @returns An array of StateChamber objects.
 */
export async function getAllStateChambers(): Promise<StateChamber[]> {
  checkDb();
  const querySnapshot = await getDocs(collection(db, STATE_CHAMBERS_COLLECTION));
  return querySnapshot.docs.map(snapshotToStateChamber);
}
