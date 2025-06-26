
'use server';

import { adminAuth } from '@/lib/firebaseAdminConfig';
import { auth } from '@/lib/firebaseConfig';
import { sendPasswordResetEmail } from 'firebase/auth';
import { createPerson } from '@/services/personService';
import { copyFileToNewLocation, deleteFileByUrl } from '@/services/storageService';
import type { PersonCreationData } from '@/lib/types';
import type { RegistrationData } from '@/lib/registrationStore';
import { format } from 'date-fns';

export async function createMemberByAdmin(
  personData: PersonCreationData,
  sessionId: string,
  locale: string
): Promise<{ success: boolean; message: string }> {
  try {
    // 1. Create Firebase Auth user
    const userRecord = await adminAuth.createUser({
      email: personData.email,
      emailVerified: true,
      displayName: personData.name,
      disabled: false,
    });
    const newUserId = userRecord.uid;
    console.log(`Auth user created: ${newUserId}`);

    // 2. Move files from temporary registration storage to permanent user storage
    const tempRegData = personData as RegistrationData; // Cast to access original URLs
    const finalPersonData = { ...personData };

    const moveAndUpdateLink = async (urlKey: keyof RegistrationData, nameKey: keyof RegistrationData, targetFolder: 'id_documents' | 'qualifications') => {
      const sourceUrl = tempRegData[urlKey] as string | undefined;
      const fileName = tempRegData[nameKey] as string | undefined;
      
      if (sourceUrl && fileName) {
        console.log(`Moving file: ${sourceUrl}`);
        const targetPath = `users/${newUserId}/${targetFolder}/${fileName}`;
        const newUrl = await copyFileToNewLocation(sourceUrl, targetPath);
        (finalPersonData as any)[urlKey] = newUrl;
        await deleteFileByUrl(sourceUrl);
        console.log(`Moved file to: ${newUrl}`);
      }
    };

    await moveAndUpdateLink('idDocumentUrl', 'idDocumentName', 'id_documents');
    await moveAndUpdateLink('diplomaUrl', 'diplomaName', 'qualifications');
    await moveAndUpdateLink('approbationCertificateUrl', 'approbationCertificateName', 'qualifications');
    await moveAndUpdateLink('specialistRecognitionUrl', 'specialistRecognitionName', 'qualifications');
    
    // 3. Create Firestore document with permanent URLs
    finalPersonData.dentistId = `ZA-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    await createPerson(newUserId, finalPersonData, locale);
    console.log(`Firestore document created for user: ${newUserId}`);

    // 4. Send password reset email
    if (!auth) throw new Error("Client Firebase Auth instance not available for sending email.");
    const actionCodeSettings = {
      url: `http://localhost:9002/${locale}/login`,
      handleCodeInApp: true,
    };
    await sendPasswordResetEmail(auth, finalPersonData.email, actionCodeSettings);
    console.log(`Password reset email sent to: ${finalPersonData.email}`);

    return { success: true, message: `Successfully created user ${finalPersonData.name}. An email to set their password has been sent.` };

  } catch (error: any) {
    console.error("Error creating user by admin:", error);
    const errorMessage = error.code ? `[${error.code}] ${error.message}` : String(error);
    return { success: false, message: `Error: ${errorMessage}` };
  }
}
