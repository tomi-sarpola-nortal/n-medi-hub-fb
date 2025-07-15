'use server';

import { personRepository } from '@/data';
import type { Person } from '@/lib/types';
import { createNotification } from '@/services/notificationService';
import { sendEmail } from '@/services/emailService';
import { getTranslations } from '@/lib/translations';
import { withErrorHandling } from './errorHandler';
import { ValidationError } from '@/lib/errors';

export const setPersonStatus = withErrorHandling(
  async (
    personId: string,
    status: Person['status']
  ): Promise<{ success: boolean; message: string }> => {
    if (!personId) {
      throw new ValidationError("Person ID is required");
    }
    
    if (!['pending', 'active', 'inactive', 'rejected'].includes(status)) {
      throw new ValidationError(`Invalid status: ${status}`);
    }
    
    await personRepository.update(personId, { status });
    return { success: true, message: `Successfully set user status to '${status}'.` };
  }
);

export const requestDataChange = withErrorHandling(
  async (personId: string, updates: Partial<Person>, actor: Person, locale: string = 'en'): Promise<{ success: boolean; message: string }> => {
    if (!personId) {
      throw new ValidationError("Person ID is required");
    }
    
    // Store the changes in 'pendingData' and set a flag for easier querying
    await personRepository.update(personId, { pendingData: updates, hasPendingChanges: true });
    
    const t = getTranslations(locale);
    const chamberMembers = await personRepository.getByRole('lk_member');
    
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
  }
);

export const deletePersonByAdmin = withErrorHandling(
  async (personId: string, token: string): Promise<{ success: boolean; message: string }> => {
    if (!personId) {
      throw new ValidationError("Person ID is required");
    }
    
    if (!token) {
      throw new ValidationError("Authentication token is required");
    }

    const response = await fetch(`https://deleteuserdata-dsey7ysrrq-uc.a.run.app/${personId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      // Try to parse error message from the API if available
      const errorData = await response.json().catch(() => ({ message: `API request failed with status ${response.status}` }));
      throw new Error(errorData.message);
    }
    
    // If the API call is successful, it means the user is deleted on the backend.
    const result = await response.json().catch(() => ({ message: "User deleted successfully." }));
    
    return { success: true, message: result.message };
  }
);
