import { adminDb as db } from '@/lib/firebaseAdminConfig';
import {
  type DocumentSnapshot,
  type QueryDocumentSnapshot,
} from 'firebase-admin/firestore';
import type { StateChamber, StateChamberCreationData } from '@/lib/types';
import { IStateChamberRepository } from '../interfaces/IStateChamberRepository';
import { 
  DatabaseError, 
  NotFoundError, 
  ConfigurationError 
} from '@/lib/errors';

const STATE_CHAMBERS_COLLECTION = 'state_chambers';

export class FirebaseStateChamberRepository implements IStateChamberRepository {
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
   * Converts a Firestore document snapshot to a StateChamber object
   * @param snapshot The document snapshot to convert
   * @returns A StateChamber object
   * @throws Error if document data is undefined
   */
  private snapshotToStateChamber(snapshot: DocumentSnapshot<any> | QueryDocumentSnapshot<any>): StateChamber {
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
    } as StateChamber;
  }

  /**
   * Creates a new state chamber document in Firestore. The ID is provided explicitly.
   * @param id The document ID for the new chamber (e.g., 'wien').
   * @param chamberData The data for the new chamber.
   * @throws DatabaseError if the operation fails
   */
  async create(id: string, chamberData: StateChamberCreationData): Promise<void> {
    try {
      this.checkDb();
      const chamberDocRef = db.collection(STATE_CHAMBERS_COLLECTION).doc(id);
      await chamberDocRef.set(chamberData);
    } catch (error) {
      console.error(`Error creating state chamber with ID ${id}:`, error);
      throw new DatabaseError(`Failed to create state chamber with ID ${id}`, error as Error);
    }
  }

  /**
   * Finds a state chamber by its ID.
   * @param id The ID to search for.
   * @returns A StateChamber object if found, otherwise null.
   * @throws DatabaseError if the operation fails
   */
  async getById(id: string): Promise<StateChamber | null> {
    try {
      this.checkDb();
      const docRef = db.collection(STATE_CHAMBERS_COLLECTION).doc(id);
      const docSnap = await docRef.get();
      if (!docSnap.exists) {
        return null;
      }
      return this.snapshotToStateChamber(docSnap);
    } catch (error) {
      console.error(`Error getting state chamber with ID ${id}:`, error);
      throw new DatabaseError(`Failed to get state chamber with ID ${id}`, error as Error);
    }
  }

  /**
   * Retrieves all state chambers from Firestore.
   * @returns An array of StateChamber objects.
   * @throws DatabaseError if the operation fails
   */
  async getAll(): Promise<StateChamber[]> {
    try {
      this.checkDb();
      const querySnapshot = await db.collection(STATE_CHAMBERS_COLLECTION).get();
      return querySnapshot.docs.map(doc => this.snapshotToStateChamber(doc));
    } catch (error) {
      console.error("Error getting all state chambers:", error);
      throw new DatabaseError("Failed to get all state chambers", error as Error);
    }
  }
}