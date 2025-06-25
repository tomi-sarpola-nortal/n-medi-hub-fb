
'use server';

import { updatePerson, deletePerson } from '@/services/personService';
import type { Person } from '@/lib/types';

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
