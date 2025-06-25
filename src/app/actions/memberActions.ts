
'use server';

import { updatePerson, deletePerson, getPersonById } from '@/services/personService';
import type { Person } from '@/lib/types';
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

export async function requestDataChange(personId: string, updates: Partial<Person>): Promise<{ success: boolean; message: string }> {
  try {
    // We only want to store the changes, not overwrite the whole document
    // So we'll pass the updates directly to a 'pendingData' field
    await updatePerson(personId, { pendingData: updates });
    return { success: true, message: 'Your changes have been submitted for review.' };
  } catch (error) {
    console.error('Error requesting data change:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, message: `Error: ${errorMessage}` };
  }
}
