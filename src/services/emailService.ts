
'use server';

import { db } from '@/lib/firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';

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
  const mailCollectionRef = collection(db, MAIL_COLLECTION);
  const docRef = await addDoc(mailCollectionRef, mail);
  console.log(`Email document created with ID: ${docRef.id} for recipient: ${mail.to[0]}`);
  return docRef.id;
}
