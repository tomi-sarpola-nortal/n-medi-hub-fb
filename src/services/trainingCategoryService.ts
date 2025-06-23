
'use server';

import { db } from '@/lib/firebaseConfig';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  type DocumentSnapshot,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
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
    zfdGroupName: data.zfdGroupName,
    zfdGroupPoints: data.zfdGroupPoints,
  } as TrainingCategory;
}

/**
 * Finds a training category by its abbreviation.
 * @param abbreviation The abbreviation to search for.
 * @returns A TrainingCategory object if found, otherwise null.
 */
export async function findTrainingCategoryByAbbreviation(abbreviation: string): Promise<TrainingCategory | null> {
  checkDb();
  const q = query(collection(db, TRAINING_CATEGORIES_COLLECTION), where('abbreviation', '==', abbreviation));
  const querySnapshot = await getDocs(q);
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
  const categoryDocRef = doc(db, TRAINING_CATEGORIES_COLLECTION, categoryData.abbreviation);
  await setDoc(categoryDocRef, categoryData);
}

/**
 * Retrieves all training categories from Firestore.
 * @returns An array of TrainingCategory objects.
 */
export async function getAllTrainingCategories(): Promise<TrainingCategory[]> {
    checkDb();
    const querySnapshot = await getDocs(collection(db, TRAINING_CATEGORIES_COLLECTION));
    return querySnapshot.docs.map(snapshotToCategory);
}
