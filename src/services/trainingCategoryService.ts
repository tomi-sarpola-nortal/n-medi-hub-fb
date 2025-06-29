
'use server';

import { adminDb as db } from '@/lib/firebaseAdminConfig';
import {
  type DocumentSnapshot,
  type QueryDocumentSnapshot,
} from 'firebase-admin/firestore';
import type { TrainingCategory, TrainingCategoryCreationData } from '@/lib/types';

const TRAINING_CATEGORIES_COLLECTION = 'training_categories';

// Helper function to ensure Firestore is initialized
const checkDb = () => {
  if (!db) {
    throw new Error("Firestore is not initialized. Please check your Firebase configuration.");
  }
};

const snapshotToCategory = (snapshot: DocumentSnapshot<any> | QueryDocumentSnapshot<any>): TrainingCategory => {
  const data = snapshot.data();
  if (!data) {
    throw new Error(`Document data is undefined for snapshot ID: ${snapshot.id}`);
  }
  return {
    id: snapshot.id,
    name: data.name,
    abbreviation: data.abbreviation,
    isActive: data.isActive,
    zfdGroupId: data.zfdGroupId,
  } as TrainingCategory;
}

/**
 * Finds a training category by its abbreviation.
 * @param abbreviation The abbreviation to search for.
 * @returns A TrainingCategory object if found, otherwise null.
 */
export async function findTrainingCategoryByAbbreviation(abbreviation: string): Promise<TrainingCategory | null> {
  checkDb();
  const q = db.collection(TRAINING_CATEGORIES_COLLECTION).where('abbreviation', '==', abbreviation);
  const querySnapshot = await q.get();
  if (querySnapshot.empty) {
    return null;
  }
  return snapshotToCategory(querySnapshot.docs[0]);
}

/**
 * Creates a new training category document in Firestore. The abbreviation is used as the document ID.
 * @param categoryData The data for the new category.
 */
export async function createTrainingCategory(categoryData: TrainingCategoryCreationData): Promise<void> {
  checkDb();
  const categoryDocRef = db.collection(TRAINING_CATEGORIES_COLLECTION).doc(categoryData.abbreviation);
  await categoryDocRef.set(categoryData);
}

/**
 * Retrieves all training categories from Firestore.
 * @returns An array of TrainingCategory objects.
 */
export async function getAllTrainingCategories(): Promise<TrainingCategory[]> {
    checkDb();
    const querySnapshot = await db.collection(TRAINING_CATEGORIES_COLLECTION).get();
    return querySnapshot.docs.map(snapshotToCategory);
}
