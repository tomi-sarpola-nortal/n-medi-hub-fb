import { adminDb as db } from '@/lib/firebaseAdminConfig';
import {
  type DocumentSnapshot,
  type QueryDocumentSnapshot,
} from 'firebase-admin/firestore';
import type { TrainingOrganizer, TrainingOrganizerCreationData } from '@/lib/types';
import { ITrainingOrganizerRepository } from '../interfaces/ITrainingOrganizerRepository';

const TRAINING_ORGANIZERS_COLLECTION = 'training_organizers';

export class FirebaseTrainingOrganizerRepository implements ITrainingOrganizerRepository {
  private checkDb() {
    if (!db) {
      throw new Error("Firestore is not initialized. Please check your Firebase configuration.");
    }
  }

  private snapshotToOrganizer(snapshot: DocumentSnapshot<any> | QueryDocumentSnapshot<any>): TrainingOrganizer {
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
  async findByName(name: string): Promise<TrainingOrganizer | null> {
    this.checkDb();
    // We search by the 'name' field, not the ID which might be formatted.
    const q = db.collection(TRAINING_ORGANIZERS_COLLECTION).where('name', '==', name);
    const querySnapshot = await q.get();
    if (querySnapshot.empty) {
      return null;
    }
    return this.snapshotToOrganizer(querySnapshot.docs[0]);
  }

  /**
   * Creates a new training organizer document in Firestore. A url-safe version of the name is used as the document ID.
   * @param organizerData The data for the new organizer.
   */
  async create(organizerData: TrainingOrganizerCreationData): Promise<void> {
    this.checkDb();
    const docId = organizerData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const organizerDocRef = db.collection(TRAINING_ORGANIZERS_COLLECTION).doc(docId);
    await organizerDocRef.set(organizerData);
  }

  /**
   * Retrieves all training organizers from Firestore.
   * @returns An array of TrainingOrganizer objects.
   */
  async getAll(): Promise<TrainingOrganizer[]> {
    this.checkDb();
    const querySnapshot = await db.collection(TRAINING_ORGANIZERS_COLLECTION).get();
    return querySnapshot.docs.map(doc => this.snapshotToOrganizer(doc));
  }
}