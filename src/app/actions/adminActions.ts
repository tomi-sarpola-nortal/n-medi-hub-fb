
'use server';

import { adminAuth } from '@/lib/firebaseAdminConfig';
import { auth } from '@/lib/firebaseConfig';
import { sendPasswordResetEmail } from 'firebase/auth';
import { createPerson } from '@/services/personService';
import type { PersonCreationData } from '@/lib/types';

export async function createMemberByAdmin(
  formData: PersonCreationData & { locale: string }
): Promise<{ success: boolean; message: string }> {
  try {
    // 1. Create Firebase Auth user using Admin SDK
    const userRecord = await adminAuth.createUser({
      email: formData.email,
      emailVerified: true, // Admin-created users can be considered verified
      displayName: formData.name,
      disabled: false,
    });
    const newUserId = userRecord.uid;

    // 2. Prepare and create Firestore document
    const personData: PersonCreationData = {
      ...formData,
      status: 'active', // Admin-created users are active by default
      dentistId: `ZA-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      otpEnabled: false,
      notificationSettings: { inApp: true, email: false },
    };
    await createPerson(newUserId, personData);

    // 3. Send password reset email using Client SDK
    if (!auth) throw new Error("Main Firebase Auth instance not available for sending email.");

    const actionCodeSettings = {
      url: `https://${process.env.NEXT_PUBLIC_HOSTING_DOMAIN}/${formData.locale}/login?email=${encodeURIComponent(formData.email)}&fromAdmin=true`,
      handleCodeInApp: true,
    };
    
    await sendPasswordResetEmail(auth, formData.email, actionCodeSettings);

    return { success: true, message: `Successfully created user ${formData.name}. An email to set their password has been sent.` };

  } catch (error: any) {
    console.error("Error creating user by admin:", error);
    const errorMessage = error.code ? `[${error.code}] ${error.message}` : String(error);
    return { success: false, message: `Error: ${errorMessage}` };
  }
}
