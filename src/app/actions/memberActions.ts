
'use server';

import { updatePerson, getPersonsByRole } from '@/services/personService';
import type { Person } from '@/lib/types';
import { createNotification } from '@/services/notificationService';
import { FieldValue } from 'firebase/firestore';


export async function setPersonStatus(
  personId: string,
  status: Person['status']
): Promise<{ success: boolean; message: string }> {
  try {
    await updatePerson(personId, { status });
    return { success: true, message: `Successfully set user status to '${status}'.` };
  } catch (error) {
    console.error(`Error setting user status:`, error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, message: `Error: ${errorMessage}` };
  }
}

export async function deletePersonById(personId: string): Promise<{ success: boolean; message: string }> {
  try {
    // Note: This action only deletes the user's record from the Firestore database.
    // Deleting associated files in Firebase Storage and the user's Firebase Authentication
    // account from the server requires the Firebase Admin SDK, which is not currently implemented.
    await deletePerson(personId);
    return { success: true, message: `Successfully deleted user's database record.` };
  } catch (error) {
    console.error(`Error deleting user record:`, error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, message: `Error: ${errorMessage}` };
  }
}

export async function requestDataChange(personId: string, updates: Partial<Person>, actor: Person): Promise<{ success: boolean; message: string }> {
  try {
    // Store the changes in 'pendingData' and set a flag for easier querying
    await updatePerson(personId, { pendingData: updates, hasPendingChanges: true });
    
    // Notify all Landeskammer members
    const chamberMembers = await getPersonsByRole('lk_member');
    const notificationPromises = chamberMembers.map(member => {
        if (member.notificationSettings?.inApp) {
            return createNotification({
                userId: member.id,
                message: `"${actor.name}" has submitted data changes for review.`,
                link: `/member-overview/${personId}/review`,
                isRead: false,
            });
        }
        return Promise.resolve();
    });
    
    await Promise.all(notificationPromises);

    return { success: true, message: 'Your changes have been submitted for review.' };
  } catch (error) {
    console.error('Error requesting data change:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, message: `Error: ${errorMessage}` };
  }
}
