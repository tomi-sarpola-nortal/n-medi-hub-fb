
'use server';

import { db } from '@/lib/firebaseConfig';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  type Timestamp,
  type DocumentSnapshot,
  type QueryDocumentSnapshot
} from 'firebase/firestore';
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
  const notificationsRef = collection(db, NOTIFICATIONS_COLLECTION);
  const docRef = await addDoc(notificationsRef, {
    ...notificationData,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getNotificationsForUser(userId: string): Promise<Notification[]> {
  checkDb();
  const notificationsRef = collection(db, NOTIFICATIONS_COLLECTION);
  const q = query(
    notificationsRef,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(50) // Limit to the last 50 notifications to avoid performance issues
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(snapshotToNotification);
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  checkDb();
  const notificationRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId);
  await updateDoc(notificationRef, { isRead: true });
}

export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  checkDb();
  const notificationsRef = collection(db, NOTIFICATIONS_COLLECTION);
  const q = query(
    notificationsRef,
    where('userId', '==', userId),
    where('isRead', '==', false)
  );
  
  const snapshot = await getDocs(q);
  
  const batch = [];
  for (const document of snapshot.docs) {
    const docRef = doc(db, NOTIFICATIONS_COLLECTION, document.id);
    batch.push(updateDoc(docRef, { isRead: true }));
  }

  await Promise.all(batch);
}
