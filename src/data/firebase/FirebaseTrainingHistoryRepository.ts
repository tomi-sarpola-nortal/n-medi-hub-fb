import { adminDb as db } from '@/lib/firebaseAdminConfig';
import {
  FieldValue,
  type DocumentSnapshot,
  type QueryDocumentSnapshot,
} from 'firebase-admin/firestore';
import type { TrainingHistory, TrainingHistoryCreationData } from '@/lib/types';
import { ITrainingHistoryRepository } from '../interfaces/ITrainingHistoryRepository';

const PERSONS_COLLECTION = 'persons';
const TRAINING_HISTORY_SUBCOLLECTION = 'training_history';

export class FirebaseTrainingHistoryRepository implements ITrainingHistoryRepository {
  private checkDb() {
    if (!db) {
      throw new Error("Firestore is not initialized.");
    }
  }

  private snapshotToTrainingHistory(snapshot: DocumentSnapshot<any> | QueryDocumentSnapshot<any>): TrainingHistory {
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
  }

  /**
   * Adds a new training history record for a specific user.
   * @param userId The ID of the user.
   * @param historyData The training history data to add.
   * @returns The ID of the newly created history document.
   */
  async addForUser(
    userId: string,
    historyData: TrainingHistoryCreationData
  ): Promise<string> {
    this.checkDb();
    const historyCollectionRef = db.collection(PERSONS_COLLECTION).doc(userId).collection(TRAINING_HISTORY_SUBCOLLECTION);
    const docRef = await historyCollectionRef.add({
      ...historyData,
      createdAt: FieldValue.serverTimestamp(),
    });
    return docRef.id;
  }

  /**
   * Fetches the training history for a specific user, ordered by date descending.
   * @param userId The ID of the user.
   * @returns An array of TrainingHistory objects.
   */
  async getForUser(userId: string): Promise<TrainingHistory[]> {
    this.checkDb();
    const historyCollectionRef = db.collection(PERSONS_COLLECTION).doc(userId).collection(TRAINING_HISTORY_SUBCOLLECTION);
    const q = historyCollectionRef.orderBy('date', 'desc');
    
    const snapshot = await q.get();
    return snapshot.docs.map(doc => this.snapshotToTrainingHistory(doc));
  }

  /**
   * Fetches a single training history item for a specific user.
   * @param userId The ID of the user.
   * @param itemId The ID of the training history item.
   * @returns A TrainingHistory object if found, otherwise null.
   */
  async getItemForUser(userId: string, itemId: string): Promise<TrainingHistory | null> {
    this.checkDb();
    const docRef = db.collection(PERSONS_COLLECTION).doc(userId).collection(TRAINING_HISTORY_SUBCOLLECTION).doc(itemId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return null;
    }
    
    return this.snapshotToTrainingHistory(docSnap);
  }
}