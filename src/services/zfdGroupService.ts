
'use server';

import { adminDb as db } from '@/lib/firebaseAdminConfig';
import {
  type DocumentSnapshot,
  type QueryDocumentSnapshot,
} from 'firebase-admin/firestore';
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
  const groupDocRef = db.collection(ZFD_GROUPS_COLLECTION).doc(id);
  await groupDocRef.set(groupData);
}

/**
 * Retrieves all ZFD groups from Firestore.
 * @returns An array of ZfdGroup objects.
 */
export async function getAllZfdGroups(): Promise<ZfdGroup[]> {
  checkDb();
  const groupsCollection = db.collection(ZFD_GROUPS_COLLECTION);
  const q = groupsCollection.orderBy('totalPoints', 'desc');
  const snapshot = await q.get();
  return snapshot.docs.map(snapshotToZfdGroup);
}
