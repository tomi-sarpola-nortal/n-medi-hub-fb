
'use server';

import { adminDb as db } from '@/lib/firebaseAdminConfig';
import {
  type DocumentSnapshot,
  type QueryDocumentSnapshot,
} from 'firebase-admin/firestore';
import type { TrainingOrganizer, TrainingOrganizerCreationData } from '@/lib/types';

const TRAINING_ORGANIZERS_COLLECTION = 'training_organizers';

// Helper function to ensure Firestore is initialized
const checkDb = () => {
  if (!db) {
    throw new Error("Firestore is not initialized. Please check your Firebase configuration.");
  }
};

const snapshotToOrganizer = (snapshot: DocumentSnapshot<any> | QueryDocumentSnapshot<any>): TrainingOrganizer => {
  const data = snapshot.data();
  if (!data) {
    throw new Error(`Document data is undefined for snapshot ID: ${snapshot.id}`);
  }
  return {
    id: snapshot.id,
    name: data.name,
    isActive: data.isActive,
  } as TrainingOrganizer;
}

/**
 * Finds a training organizer by its name.
 * @param name The name to search for.
 * @returns A TrainingOrganizer object if found, otherwise null.
 */
export async function findTrainingOrganizerByName(name: string): Promise<TrainingOrganizer | null> {
  checkDb();
  // We search by the 'name' field, not the ID which might be formatted.
  const q = db.collection(TRAINING_ORGANIZERS_COLLECTION).where('name', '==', name);
  const querySnapshot = await q.get();
  if (querySnapshot.empty) {
    return null;
  }
  return snapshotToOrganizer(querySnapshot.docs[0]);
}

/**
 * Creates a new training organizer document in Firestore. A url-safe version of the name is used as the document ID.
 * @param organizerData The data for the new organizer.
 */
export async function createTrainingOrganizer(organizerData: TrainingOrganizerCreationData): Promise<void> {
  checkDb();
  const docId = organizerData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const organizerDocRef = db.collection(TRAINING_ORGANIZERS_COLLECTION).doc(docId);
  await organizerDocRef.set(organizerData);
}
