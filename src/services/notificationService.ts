
'use server';

import { adminDb as db } from '@/lib/firebaseAdminConfig';
import {
  FieldValue,
  type Timestamp,
  type DocumentSnapshot,
  type QueryDocumentSnapshot
} from 'firebase-admin/firestore';
import type { Notification, NotificationCreationData } from '@/lib/types';

const NOTIFICATIONS_COLLECTION = 'notifications';

const checkDb = () => {
  if (!db) {
    throw new Error("Firestore is not initialized.");
  }
};

const snapshotToNotification = (snapshot: DocumentSnapshot<any> | QueryDocumentSnapshot<any>): Notification => {
    const data = snapshot.data();
    if (!data) {
        throw new Error(`Document data is undefined for snapshot ID: ${snapshot.id}`);
    }
    const createdAtTimestamp = data.createdAt as Timestamp;

    return {
        id: snapshot.id,
        userId: data.userId,
        message: data.message,
        link: data.link,
        isRead: data.isRead,
        createdAt: createdAtTimestamp ? createdAtTimestamp.toDate().toISOString() : new Date().toISOString(),
    };
};

export async function createNotification(notificationData: NotificationCreationData): Promise<string> {
  checkDb();
  const notificationsRef = db.collection(NOTIFICATIONS_COLLECTION);
  const docRef = await notificationsRef.add({
    ...notificationData,
    createdAt: FieldValue.serverTimestamp(),
  });
  return docRef.id;
}

export async function getNotificationsForUser(userId: string): Promise<Notification[]> {
  checkDb();
  const notificationsRef = db.collection(NOTIFICATIONS_COLLECTION);
  const q = notificationsRef
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .limit(50); // Limit to the last 50 notifications to avoid performance issues
  
  const snapshot = await q.get();
  return snapshot.docs.map(snapshotToNotification);
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  checkDb();
  const notificationRef = db.collection(NOTIFICATIONS_COLLECTION).doc(notificationId);
  await notificationRef.update({ isRead: true });
}

export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  checkDb();
  const notificationsRef = db.collection(NOTIFICATIONS_COLLECTION);
  const q = notificationsRef
    .where('userId', '==', userId)
    .where('isRead', '==', false);
  
  const snapshot = await q.get();
  
  const batch = db.batch();
  snapshot.docs.forEach(doc => {
    batch.update(doc.ref, { isRead: true });
  });

  await batch.commit();
}
