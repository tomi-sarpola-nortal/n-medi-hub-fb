
'use server';

import { adminDb as db } from '@/lib/firebaseAdminConfig';
import {
  type DocumentSnapshot,
  type QueryDocumentSnapshot,
} from 'firebase-admin/firestore';
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
  const chamberDocRef = db.collection(STATE_CHAMBERS_COLLECTION).doc(id);
  await chamberDocRef.set(chamberData);
}

/**
 * Finds a state chamber by its ID.
 * @param id The ID to search for.
 * @returns A StateChamber object if found, otherwise null.
 */
export async function getStateChamberById(id: string): Promise<StateChamber | null> {
  checkDb();
  const docRef = db.collection(STATE_CHAMBERS_COLLECTION).doc(id);
  const docSnap = await docRef.get();
  if (!docSnap.exists) {
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
  const querySnapshot = await db.collection(STATE_CHAMBERS_COLLECTION).get();
  return querySnapshot.docs.map(snapshotToStateChamber);
}
