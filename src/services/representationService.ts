
'use server';

import { db } from '@/lib/firebaseConfig';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  type Timestamp,
  or,
  orderBy,
} from 'firebase/firestore';
import type { Representation, RepresentationCreationData } from '@/lib/types';


const REPRESENTATIONS_COLLECTION = 'representations';

const checkDb = () => {
  if (!db) {
    throw new Error("Firestore is not initialized.");
  }
};

const snapshotToRepresentation = (snapshot: any): Representation => {
    const data = snapshot.data();
    if (!data) {
        throw new Error(`Document data is undefined for snapshot ID: ${snapshot.id}`);
    }
    const createdAtTimestamp = data.createdAt as Timestamp;
    const confirmedAtTimestamp = data.confirmedAt as Timestamp;
    const startDateTimestamp = data.startDate as Timestamp;
    const endDateTimestamp = data.endDate as Timestamp;

    return {
        id: snapshot.id,
        representingPersonId: data.representingPersonId,
        representedPersonId: data.representedPersonId,
        representingPersonName: data.representingPersonName,
        representedPersonName: data.representedPersonName,
        // Ensure dates are converted to ISO strings
        startDate: startDateTimestamp?.toDate ? startDateTimestamp.toDate().toISOString() : data.startDate,
        endDate: endDateTimestamp?.toDate ? endDateTimestamp.toDate().toISOString() : data.endDate,
        durationHours: data.durationHours,
        status: data.status,
        createdAt: createdAtTimestamp?.toDate ? createdAtTimestamp.toDate().toISOString() : data.createdAt,
        confirmedAt: confirmedAtTimestamp?.toDate ? confirmedAtTimestamp.toDate().toISOString() : data.confirmedAt,
    };
};

/**
 * Creates a new representation document.
 * @param data The data for the new representation.
 * @returns The ID of the newly created document.
 */
export async function createRepresentation(data: RepresentationCreationData): Promise<string> {
  checkDb();
  const representationsRef = collection(db, REPRESENTATIONS_COLLECTION);
  const docRef = await addDoc(representationsRef, {
    ...data,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}


/**
 * Calculates the total confirmed representation hours for a given user.
 * This function calculates the hours where the user was THE PERSON BEING REPRESENTED.
 * @param userId The ID of the user who was represented.
 * @returns The total number of confirmed hours.
 */
export async function getConfirmedRepresentationHours(userId: string): Promise<number> {
  checkDb();
  const representationsRef = collection(db, REPRESENTATIONS_COLLECTION);
  const q = query(representationsRef, 
    where('representedPersonId', '==', userId),
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

/**
 * Fetches all representations related to a user.
 * @param userId The ID of the user.
 * @returns An object containing arrays for performed, pending confirmation, and received representations.
 */
export async function getRepresentationsForUser(userId: string): Promise<{
    performed: Representation[],
    pendingConfirmation: Representation[],
    wasRepresented: Representation[],
}> {
    checkDb();
    const representationsRef = collection(db, REPRESENTATIONS_COLLECTION);
    const q = query(representationsRef, 
        or(
            where('representingPersonId', '==', userId),
            where('representedPersonId', '==', userId)
        )
    );

    const querySnapshot = await getDocs(q);
    
    const allRepresentations: Representation[] = querySnapshot.docs.map(snapshotToRepresentation);

    const performed = allRepresentations.filter(r => r.representingPersonId === userId);
    const wasRepresented = allRepresentations.filter(r => r.representedPersonId === userId);
    const pendingConfirmation = wasRepresented.filter(r => r.status === 'pending');

    return {
        performed,
        pendingConfirmation,
        wasRepresented,
    };
}


/**
 * Updates the status of a representation request.
 * @param representationId The ID of the representation document.
 * @param status The new status: 'confirmed' or 'declined'.
 */
export async function updateRepresentationStatus(representationId: string, status: 'confirmed' | 'declined'): Promise<void> {
    checkDb();
    const representationRef = doc(db, REPRESENTATIONS_COLLECTION, representationId);
    
    const updateData: { status: 'confirmed' | 'declined', confirmedAt?: any } = { status };

    if (status === 'confirmed') {
        updateData.confirmedAt = serverTimestamp();
    }
    
    await updateDoc(representationRef, updateData);
}

/**
 * Fetches all representation documents from Firestore.
 * @returns An array of Representation objects.
 */
export async function getAllRepresentations(): Promise<Representation[]> {
    checkDb();
    const representationsRef = collection(db, REPRESENTATIONS_COLLECTION);
    const snapshot = await getDocs(representationsRef);
    return snapshot.docs.map(snapshotToRepresentation);
}


/**
 * Fetches all pending representation requests older than a certain number of days based on their START DATE.
 * @param daysOld The number of days old a request's start date must be to be included.
 * @returns An array of old, pending Representation objects.
 */
export async function getOldPendingRepresentations(daysOld: number = 5): Promise<Representation[]> {
  checkDb();
  const representationsRef = collection(db, REPRESENTATIONS_COLLECTION);
  
  const thresholdDate = new Date();
  thresholdDate.setDate(thresholdDate.getDate() - daysOld);

  const q = query(representationsRef, 
    where('status', '==', 'pending'),
    where('startDate', '<=', thresholdDate.toISOString()),
    orderBy('startDate', 'asc') // Oldest first
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(snapshotToRepresentation);
}
