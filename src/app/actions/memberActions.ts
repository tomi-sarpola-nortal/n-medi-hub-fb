
'use server';

import { updatePerson, getPersonsByRole } from '@/services/personService';
import type { Person } from '@/lib/types';
import { createNotification } from '@/services/notificationService';
import { sendEmail } from '@/services/emailService';
import { getTranslations } from '@/lib/translations';
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

export async function requestDataChange(personId: string, updates: Partial<Person>, actor: Person, locale: string): Promise<{ success: boolean; message: string }> {
  try {
    // Store the changes in 'pendingData' and set a flag for easier querying
    await updatePerson(personId, { pendingData: updates, hasPendingChanges: true });
    
    const t = getTranslations(locale);
    const chamberMembers = await getPersonsByRole('lk_member');
    
    const notificationPromises = chamberMembers.map(async (member) => {
        if (member.notificationSettings?.inApp) {
            await createNotification({
                userId: member.id,
                message: t.notification_new_data_change_review.replace('{actorName}', actor.name),
                link: `/member-overview/${personId}/review`,
                isRead: false,
            });
        }
        if (member.notificationSettings?.email && member.email) {
            await sendEmail({
                to: [member.email],
                message: {
                    subject: t.email_subject_new_data_change_review,
                    html: t.email_body_new_data_change_review
                          .replace('{targetName}', member.name)
                          .replace('{actorName}', actor.name)
                }
            });
        }
    });
    
    await Promise.all(notificationPromises);

    return { success: true, message: 'Your changes have been submitted for review.' };
  } catch (error) {
    console.error('Error requesting data change:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, message: `Error: ${errorMessage}` };
  }
}
