
'use server';

import { db } from '@/lib/firebaseConfig';
import {
  collection,
  doc,
  addDoc,
  getDocs,
  getDoc,
  query,
  orderBy,
  serverTimestamp,
  type Timestamp,
  type DocumentSnapshot,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import type { TrainingHistory, TrainingHistoryCreationData } from '@/lib/types';

const PERSONS_COLLECTION = 'persons';
const TRAINING_HISTORY_SUBCOLLECTION = 'training_history';

const checkDb = () => {
  if (!db) {
    throw new Error("Firestore is not initialized.");
  }
};

// Helper function to map snapshot to TrainingHistory type
const snapshotToTrainingHistory = (snapshot: DocumentSnapshot<any> | QueryDocumentSnapshot<any>): TrainingHistory => {
    const data = snapshot.data();
    if (!data) {
        throw new Error(`Document data is undefined for snapshot ID: ${snapshot.id}`);
    }
    return {
        id: snapshot.id,
        date: data.date, // expecting YYYY-MM-DD string
        title: data.title,
        points: data.points,
        category: data.category,
        organizer: data.organizer,
        zfdGroupId: data.zfdGroupId,
    } as TrainingHistory;
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

  return snapshot.docs.map(snapshotToTrainingHistory);
}

/**
 * Fetches a single training history item for a specific user.
 * @param userId The ID of the user.
 * @param itemId The ID of the training history item.
 * @returns A TrainingHistory object if found, otherwise null.
 */
export async function getTrainingHistoryItem(userId: string, itemId: string): Promise<TrainingHistory | null> {
    checkDb();
    const docRef = doc(db, PERSONS_COLLECTION, userId, TRAINING_HISTORY_SUBCOLLECTION, itemId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        return null;
    }
    
    return snapshotToTrainingHistory(docSnap);
}
