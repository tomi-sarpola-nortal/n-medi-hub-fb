import { adminDb as db } from '@/lib/firebaseAdminConfig';
import {
  type DocumentSnapshot,
  type QueryDocumentSnapshot,
} from 'firebase-admin/firestore';
import type { TrainingCategory, TrainingCategoryCreationData } from '@/lib/types';
import { ITrainingCategoryRepository } from '../interfaces/ITrainingCategoryRepository';

const TRAINING_CATEGORIES_COLLECTION = 'training_categories';

export class FirebaseTrainingCategoryRepository implements ITrainingCategoryRepository {
  private checkDb() {
    if (!db) {
      throw new Error("Firestore is not initialized. Please check your Firebase configuration.");
    }
  }

  private snapshotToCategory(snapshot: DocumentSnapshot<any> | QueryDocumentSnapshot<any>): TrainingCategory {
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
  async findByAbbreviation(abbreviation: string): Promise<TrainingCategory | null> {
    this.checkDb();
    const q = db.collection(TRAINING_CATEGORIES_COLLECTION).where('abbreviation', '==', abbreviation);
    const querySnapshot = await q.get();
    if (querySnapshot.empty) {
      return null;
    }
    return this.snapshotToCategory(querySnapshot.docs[0]);
  }

  /**
   * Creates a new training category document in Firestore. The abbreviation is used as the document ID.
   * @param categoryData The data for the new category.
   */
  async create(categoryData: TrainingCategoryCreationData): Promise<void> {
    this.checkDb();
    const categoryDocRef = db.collection(TRAINING_CATEGORIES_COLLECTION).doc(categoryData.abbreviation);
    await categoryDocRef.set(categoryData);
  }

  /**
   * Retrieves all training categories from Firestore.
   * @returns An array of TrainingCategory objects.
   */
  async getAll(): Promise<TrainingCategory[]> {
    this.checkDb();
    const querySnapshot = await db.collection(TRAINING_CATEGORIES_COLLECTION).get();
    return querySnapshot.docs.map(doc => this.snapshotToCategory(doc));
  }
}