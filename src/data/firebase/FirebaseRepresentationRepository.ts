import { adminDb as db } from '@/lib/firebaseAdminConfig';
import {
  FieldValue,
  type Timestamp,
} from 'firebase-admin/firestore';
import type { Representation, RepresentationCreationData } from '@/lib/types';
import { getPersonById, getPersonsByRole } from '@/services/personService';
import { createNotification } from '@/services/notificationService';
import { sendEmail } from '@/services/emailService';
import { getTranslations } from '@/lib/translations';
import { IRepresentationRepository } from '../interfaces/IRepresentationRepository';

const REPRESENTATIONS_COLLECTION = 'representations';

export class FirebaseRepresentationRepository implements IRepresentationRepository {
  private checkDb() {
    if (!db) {
      throw new Error("Firestore is not initialized.");
    }
  }

  private snapshotToRepresentation(snapshot: any): Representation {
    const data = snapshot.data();
    if (!data) {
      throw new Error(`Document data is undefined for snapshot ID: ${snapshot.id}`);
    }
    const createdAtTimestamp = data.createdAt as Timestamp;
    const confirmedAtTimestamp = data.confirmedAt as Timestamp;
    const startDateTimestamp = data.startDate as Timestamp;
    const endDateTimestamp = data.endDate as Timestamp;

    return {
      id: snapshot.id,
      representingPersonId: data.representingPersonId,
      representedPersonId: data.representedPersonId,
      representingPersonName: data.representingPersonName,
      representedPersonName: data.representedPersonName,
      // Ensure dates are converted to ISO strings
      startDate: startDateTimestamp?.toDate ? startDateTimestamp.toDate().toISOString() : data.startDate,
      endDate: endDateTimestamp?.toDate ? endDateTimestamp.toDate().toISOString() : data.endDate,
      durationHours: data.durationHours,
      status: data.status,
      createdAt: createdAtTimestamp?.toDate ? createdAtTimestamp.toDate().toISOString() : data.createdAt,
      confirmedAt: confirmedAtTimestamp?.toDate ? confirmedAtTimestamp.toDate().toISOString() : data.confirmedAt,
    };
  }

  /**
   * Creates a new representation document.
   * @param data The data for the new representation.
   * @param locale The locale for email translations.
   * @returns The ID of the newly created document.
   */
  async create(data: RepresentationCreationData, locale: string): Promise<string> {
    this.checkDb();
    const representationsRef = db.collection(REPRESENTATIONS_COLLECTION);
    const docRef = await representationsRef.add({
      ...data,
      createdAt: FieldValue.serverTimestamp(),
    });
    
    const t = getTranslations(locale);
    const representedPerson = await getPersonById(data.representedPersonId);
    
    // Notify the person who was represented
    if (representedPerson) {
      if (representedPerson.notificationSettings?.inApp) {
        await createNotification({
          userId: data.representedPersonId,
          message: t.notification_new_representation.replace('{actorName}', data.representingPersonName),
          link: '/representations',
          isRead: false,
        });
      }
      if (representedPerson.notificationSettings?.email && representedPerson.email) {
        await sendEmail({
          to: [representedPerson.email],
          message: {
            subject: t.email_subject_new_representation,
            html: t.email_body_new_representation
              .replace('{targetName}', representedPerson.name)
              .replace('{actorName}', data.representingPersonName),
          },
        });
      }
    }

    // Check if the start date is overdue and notify LK members
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

    if (new Date(data.startDate) < fiveDaysAgo) {
      const chamberMembers = await getPersonsByRole('lk_member');
      const notificationPromises = chamberMembers.map(async (member) => {
        if (member.notificationSettings?.inApp) {
          await createNotification({
            userId: member.id,
            message: t.notification_overdue_representation_submitted
              .replace('{representedPersonName}', data.representedPersonName)
              .replace('{representingPersonName}', data.representingPersonName),
            link: `/member-overview/${data.representedPersonId}?tab=vertretungen`,
            isRead: false,
          });
        }
        if (member.notificationSettings?.email && member.email) {
          await sendEmail({
            to: [member.email],
            message: {
              subject: t.email_subject_overdue_representation_submitted,
              html: t.email_body_overdue_representation_submitted
                .replace('{targetName}', member.name)
                .replace('{representedPersonName}', data.representedPersonName)
                .replace('{representingPersonName}', data.representingPersonName),
            }
          });
        }
      });
      await Promise.all(notificationPromises);
    }

    return docRef.id;
  }

  /**
   * Calculates the total confirmed representation hours for a given user.
   * This function calculates the hours where the user was THE PERSON BEING REPRESENTED.
   * @param userId The ID of the user who was represented.
   * @returns The total number of confirmed hours.
   */
  async getConfirmedHours(userId: string): Promise<number> {
    this.checkDb();
    const representationsRef = db.collection(REPRESENTATIONS_COLLECTION);
    const q = representationsRef 
      .where('representedPersonId', '==', userId)
      .where('status', '==', 'confirmed');
    
    const querySnapshot = await q.get();
    if (querySnapshot.empty) {
      return 0;
    }

    let totalHours = 0;
    querySnapshot.forEach(doc => {
      const data = doc.data();
      totalHours += data.durationHours || 0;
    });

    return totalHours;
  }

  /**
   * Fetches all representations where a user is either the representing or the represented person.
   * @param userId The ID of the user.
   * @returns A de-duplicated array of all representations related to the user.
   */
  async getForUser(userId: string): Promise<Representation[]> {
    this.checkDb();
    const representationsRef = db.collection(REPRESENTATIONS_COLLECTION);
    
    const performingQuery = representationsRef.where('representingPersonId', '==', userId);
    const receivingQuery = representationsRef.where('representedPersonId', '==', userId);
    
    const [performingSnapshot, receivingSnapshot] = await Promise.all([
      performingQuery.get(),
      receivingQuery.get()
    ]);

    const representationMap = new Map<string, Representation>();
    
    performingSnapshot.docs.forEach(doc => {
      if (!representationMap.has(doc.id)) {
        representationMap.set(doc.id, this.snapshotToRepresentation(doc));
      }
    });

    receivingSnapshot.docs.forEach(doc => {
      if (!representationMap.has(doc.id)) {
        representationMap.set(doc.id, this.snapshotToRepresentation(doc));
      }
    });

    return Array.from(representationMap.values());
  }

  /**
   * Updates the status of a representation request.
   * @param representationId The ID of the representation document.
   * @param status The new status: 'confirmed' or 'declined'.
   * @param locale The locale for email translations.
   */
  async updateStatus(representationId: string, status: 'confirmed' | 'declined', locale: string): Promise<void> {
    this.checkDb();
    const representationRef = db.collection(REPRESENTATIONS_COLLECTION).doc(representationId);
    
    const updateData: { status: 'confirmed' | 'declined', confirmedAt?: any } = { status };

    if (status === 'confirmed') {
      updateData.confirmedAt = FieldValue.serverTimestamp();
    }
    
    await representationRef.update(updateData);

    // Get the representation data to find the other user
    const repDoc = await representationRef.get();
    if (repDoc.exists) {
      const repData = this.snapshotToRepresentation(repDoc);
      const representingPerson = await getPersonById(repData.representingPersonId);
      
      if (representingPerson) {
        const t = getTranslations(locale);
        const notificationKey = status === 'confirmed' ? 'notification_representation_approved' : 'notification_representation_declined';
        const subjectKey = status === 'confirmed' ? 'email_subject_representation_approved' : 'email_subject_representation_declined';
        const bodyKey = status === 'confirmed' ? 'email_body_representation_approved' : 'email_body_representation_declined';

        if (representingPerson.notificationSettings?.inApp) {
          await createNotification({
            userId: repData.representingPersonId,
            message: t[notificationKey].replace('{targetName}', repData.representedPersonName),
            link: '/representations',
            isRead: false,
          });
        }
        if (representingPerson.notificationSettings?.email && representingPerson.email) {
          await sendEmail({
            to: [representingPerson.email],
            message: {
              subject: t[subjectKey],
              html: t[bodyKey]
                .replace('{targetName}', representingPerson.name)
                .replace('{actorName}', repData.representedPersonName),
            }
          });
        }
      }
    }
  }

  /**
   * Fetches all representation documents from Firestore.
   * @returns An array of Representation objects.
   */
  async getAll(): Promise<Representation[]> {
    this.checkDb();
    const representationsRef = db.collection(REPRESENTATIONS_COLLECTION);
    const snapshot = await representationsRef.get();
    return snapshot.docs.map(doc => this.snapshotToRepresentation(doc));
  }

  /**
   * Fetches all pending representation requests older than a certain number of days based on their START DATE.
   * @param daysOld The number of days old a request's start date must be to be included.
   * @returns An array of old, pending Representation objects.
   */
  async getOldPending(daysOld: number = 5): Promise<Representation[]> {
    this.checkDb();
    const representationsRef = db.collection(REPRESENTATIONS_COLLECTION);
    
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - daysOld);

    const q = representationsRef 
      .where('status', '==', 'pending')
      .where('startDate', '<=', thresholdDate.toISOString())
      .orderBy('startDate', 'asc');
    
    const querySnapshot = await q.get();
    return querySnapshot.docs.map(doc => this.snapshotToRepresentation(doc));
  }
}
