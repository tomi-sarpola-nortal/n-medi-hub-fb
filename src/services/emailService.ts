
'use server';

import { adminDb as db } from '@/lib/firebaseAdminConfig';

const MAIL_COLLECTION = 'mail';

interface Mail {
  to: string[];
  message: {
    subject: string;
    html: string;
  };
}

/**
 * Creates a document in the 'mail' collection, which triggers the 'Send Email' Firebase Extension.
 * @param mail The mail object containing recipient, subject, and body.
 * @returns The ID of the newly created mail document.
 */
export async function sendEmail(mail: Mail): Promise<string> {
  if (!db) {
    throw new Error("Firestore is not initialized.");
  }
  const mailCollectionRef = db.collection(MAIL_COLLECTION);
  const docRef = await mailCollectionRef.add(mail);
  console.log(`Email document created with ID: ${docRef.id} for recipient: ${mail.to[0]}`);
  return docRef.id;
}
