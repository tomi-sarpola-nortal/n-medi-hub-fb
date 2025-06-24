
'use server';

import { db } from '@/lib/firebaseConfig';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  orderBy,
  type DocumentSnapshot,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import type { ZfdGroup, ZfdGroupCreationData } from '@/lib/types';

const ZFD_GROUPS_COLLECTION = 'zfd_groups';

const checkDb = () => {
  if (!db) {
    throw new Error("Firestore is not initialized.");
  }
};

const snapshotToZfdGroup = (snapshot: DocumentSnapshot<any> | QueryDocumentSnapshot<any>): ZfdGroup => {
  const data = snapshot.data();
  if (!data) {
    throw new Error(`Document data is undefined for snapshot ID: ${snapshot.id}`);
  }
  return {
    id: snapshot.id,
    nameKey: data.nameKey,
    totalPoints: data.totalPoints,
  } as ZfdGroup;
};

/**
 * Creates a new ZFD Group document in Firestore.
 * @param id The document ID for the new group (e.g., 'berufsbezogen').
 * @param groupData The data for the new group.
 */
export async function createZfdGroup(id: string, groupData: ZfdGroupCreationData): Promise<void> {
  checkDb();
  const groupDocRef = doc(db, ZFD_GROUPS_COLLECTION, id);
  await setDoc(groupDocRef, groupData);
}

/**
 * Retrieves all ZFD groups from Firestore.
 * @returns An array of ZfdGroup objects.
 */
export async function getAllZfdGroups(): Promise<ZfdGroup[]> {
  checkDb();
  const groupsCollection = collection(db, ZFD_GROUPS_COLLECTION);
  const q = query(groupsCollection, orderBy('totalPoints', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(snapshotToZfdGroup);
}
