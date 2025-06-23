
'use server';

import { db } from '@/lib/firebaseConfig';
import {
  collection,
  doc,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  type Timestamp,
} from 'firebase/firestore';
import type { TrainingHistory, TrainingHistoryCreationData } from '@/lib/types';

const PERSONS_COLLECTION = 'persons';
const TRAINING_HISTORY_SUBCOLLECTION = 'training_history';

const checkDb = () => {
  if (!db) {
    throw new Error("Firestore is not initialized.");
  }
};

/**
 * Adds a new training history record for a specific user.
 * @param userId The ID of the user.
 * @param historyData The training history data to add.
 * @returns The ID of the newly created history document.
 */
export async function addTrainingHistoryForUser(
  userId: string,
  historyData: TrainingHistoryCreationData
): Promise<string> {
  checkDb();
  const historyCollectionRef = collection(db, PERSONS_COLLECTION, userId, TRAINING_HISTORY_SUBCOLLECTION);
  const docRef = await addDoc(historyCollectionRef, {
    ...historyData,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}


/**
 * Fetches the training history for a specific user, ordered by date descending.
 * @param userId The ID of the user.
 * @returns An array of TrainingHistory objects.
 */
export async function getTrainingHistoryForUser(userId: string): Promise<TrainingHistory[]> {
  checkDb();
  const historyCollectionRef = collection(db, PERSONS_COLLECTION, userId, TRAINING_HISTORY_SUBCOLLECTION);
  const q = query(historyCollectionRef, orderBy('date', 'desc'));
  
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      date: data.date, // expecting YYYY-MM-DD string
      title: data.title,
      points: data.points,
      category: data.category,
      organizer: data.organizer,
    } as TrainingHistory;
  });
}
