
'use server';

import { db } from '@/lib/firebaseConfig';
import {
  collection,
  query,
  where,
  getDocs,
  type QuerySnapshot,
} from 'firebase/firestore';

const REPRESENTATIONS_COLLECTION = 'representations';

const checkDb = () => {
  if (!db) {
    throw new Error("Firestore is not initialized.");
  }
};

/**
 * Calculates the total confirmed representation hours for a given user.
 * @param userId The ID of the user who performed the representations.
 * @returns The total number of confirmed hours.
 */
export async function getConfirmedRepresentationHours(userId: string): Promise<number> {
  checkDb();
  const representationsRef = collection(db, REPRESENTATIONS_COLLECTION);
  const q = query(representationsRef, 
    where('representingPersonId', '==', userId), 
    where('status', '==', 'confirmed')
  );
  
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) {
    return 0;
  }

  let totalHours = 0;
  querySnapshot.forEach(doc => {
    const data = doc.data();
    totalHours += data.durationHours || 0;
  });

  return totalHours;
}
