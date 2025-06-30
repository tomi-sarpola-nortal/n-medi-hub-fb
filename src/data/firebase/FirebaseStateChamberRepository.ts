import { adminDb as db } from '@/lib/firebaseAdminConfig';
import {
  type DocumentSnapshot,
  type QueryDocumentSnapshot,
} from 'firebase-admin/firestore';
import type { StateBureau, StateBureauCreationData } from '@/lib/types';
import { IStateBureauRepository } from '../interfaces/IStateChamberRepository';
import { 
  DatabaseError, 
  NotFoundError, 
  ConfigurationError 
} from '@/lib/errors';

const STATE_BUREAUS_COLLECTION = 'state_bureaus';

export class FirebaseStateBureauRepository implements IStateBureauRepository {
  /**
   * Checks if the database is initialized
   * @throws ConfigurationError if Firestore is not initialized
   */
  private checkDb() {
    if (!db) {
      throw new ConfigurationError("Firestore is not initialized. Please check your Firebase configuration.");
    }
  }

  /**
   * Converts a Firestore document snapshot to a StateBureau object
   * @param snapshot The document snapshot to convert
   * @returns A StateBureau object
   * @throws Error if document data is undefined
   */
  private snapshotToStateBureau(snapshot: DocumentSnapshot<any> | QueryDocumentSnapshot<any>): StateBureau {
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
    } as StateBureau;
  }

  /**
   * Creates a new state bureau document in Firestore. The ID is provided explicitly.
   * @param id The document ID for the new bureau (e.g., 'wien').
   * @param bureauData The data for the new bureau.
   * @throws DatabaseError if the operation fails
   */
  async create(id: string, bureauData: StateBureauCreationData): Promise<void> {
    try {
      this.checkDb();
      const bureauDocRef = db.collection(STATE_BUREAUS_COLLECTION).doc(id);
      await bureauDocRef.set(bureauData);
    } catch (error) {
      console.error(`Error creating state bureau with ID ${id}:`, error);
      throw new DatabaseError(`Failed to create state bureau with ID ${id}`, error as Error);
    }
  }

  /**
   * Finds a state bureau by its ID.
   * @param id The ID to search for.
   * @returns A StateBureau object if found, otherwise null.
   * @throws DatabaseError if the operation fails
   */
  async getById(id: string): Promise<StateBureau | null> {
    try {
      this.checkDb();
      const docRef = db.collection(STATE_BUREAUS_COLLECTION).doc(id);
      const docSnap = await docRef.get();
      if (!docSnap.exists) {
        return null;
      }
      return this.snapshotToStateBureau(docSnap);
    } catch (error) {
      console.error(`Error getting state bureau with ID ${id}:`, error);
      throw new DatabaseError(`Failed to get state bureau with ID ${id}`, error as Error);
    }
  }

  /**
   * Retrieves all state bureaus from Firestore.
   * @returns An array of StateBureau objects.
   * @throws DatabaseError if the operation fails
   */
  async getAll(): Promise<StateBureau[]> {
    try {
      this.checkDb();
      const querySnapshot = await db.collection(STATE_BUREAUS_COLLECTION).get();
      return querySnapshot.docs.map(doc => this.snapshotToStateBureau(doc));
    } catch (error) {
      console.error("Error getting all state bureaus:", error);
      throw new DatabaseError("Failed to get all state bureaus", error as Error);
    }
  }
}
