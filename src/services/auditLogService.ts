
'use server';

import { adminDb as db } from '@/lib/firebaseAdminConfig';
import {
  FieldValue,
  type Timestamp,
  type DocumentSnapshot,
  type QueryDocumentSnapshot
} from 'firebase-admin/firestore';
import type { AuditLog, AuditLogCreationData } from '@/lib/types';

const AUDIT_LOGS_COLLECTION = 'audit_logs';

const checkDb = () => {
  if (!db) {
    throw new Error("Firestore is not initialized.");
  }
};

const snapshotToAuditLog = (snapshot: DocumentSnapshot<any> | QueryDocumentSnapshot<any>): AuditLog => {
    const data = snapshot.data();
    if (!data) {
        throw new Error(`Document data is undefined for snapshot ID: ${snapshot.id}`);
    }
    const timestamp = data.timestamp as Timestamp;

    return {
        id: snapshot.id,
        timestamp: timestamp ? timestamp.toDate().toISOString() : new Date().toISOString(),
        userId: data.userId,
        userName: data.userName,
        userRole: data.userRole,
        userChamber: data.userChamber,
        collectionName: data.collectionName,
        documentId: data.documentId,
        fieldName: data.fieldName,
        operation: data.operation,
        impactedPersonId: data.impactedPersonId,
        impactedPersonName: data.impactedPersonName,
        details: data.details,
    };
};

export async function createAuditLog(logData: AuditLogCreationData): Promise<string> {
  checkDb();
  const logCollectionRef = db.collection(AUDIT_LOGS_COLLECTION);
  const docRef = await logCollectionRef.add({
    ...logData,
    timestamp: FieldValue.serverTimestamp(),
  });
  return docRef.id;
}

export async function getAuditLogs(): Promise<AuditLog[]> {
  checkDb();
  const logCollectionRef = db.collection(AUDIT_LOGS_COLLECTION);
  const q = logCollectionRef.orderBy('timestamp', 'desc');
  const snapshot = await q.get();
  return snapshot.docs.map(snapshotToAuditLog);
}
