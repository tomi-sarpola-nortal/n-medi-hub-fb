'use server';

import { representationRepository } from '@/data';
import type { Representation, RepresentationCreationData } from '@/lib/types';

/**
 * Creates a new representation document.
 * @param data The data for the new representation.
 * @param locale The locale for email translations.
 * @returns The ID of the newly created document.
 */
export async function createRepresentation(data: RepresentationCreationData, locale: string): Promise<string> {
  return representationRepository.create(data, locale);
}

/**
 * Calculates the total confirmed representation hours for a given user.
 * This function calculates the hours where the user was THE PERSON BEING REPRESENTED.
 * @param userId The ID of the user who was represented.
 * @returns The total number of confirmed hours.
 */
export async function getConfirmedRepresentationHours(userId: string): Promise<number> {
  return representationRepository.getConfirmedHours(userId);
}

/**
 * Fetches all representations related to a user, split into categories.
 * @param userId The ID of the user.
 * @returns An object containing arrays for performed, pending confirmation, and received representations.
 */
export async function getRepresentationsForUser(userId: string): Promise<{
  performed: Representation[],
  pendingConfirmation: Representation[],
  wasRepresented: Representation[],
}> {
  const allReps = await representationRepository.getForUser(userId);

  const performed = allReps.filter(r => r.representingPersonId === userId);
  const wasRepresented = allReps.filter(r => r.representedPersonId === userId);
  const pendingConfirmation = wasRepresented.filter(r => r.status === 'pending');

  return { performed, pendingConfirmation, wasRepresented };
}

/**
 * Fetches all representations related to a user as a single list.
 * @param userId The ID of the user.
 * @returns A de-duplicated array of all representations for the user.
 */
export async function getAllRepresentationsForUser(userId: string): Promise<Representation[]> {
  return representationRepository.getForUser(userId);
}

/**
 * Updates the status of a representation request.
 * @param representationId The ID of the representation document.
 * @param status The new status: 'confirmed' or 'declined'.
 * @param locale The locale for email translations.
 */
export async function updateRepresentationStatus(representationId: string, status: 'confirmed' | 'declined', locale: string = 'en'): Promise<void> {
  return representationRepository.updateStatus(representationId, status, locale);
}

/**
 * Fetches all representation documents from Firestore.
 * @returns An array of Representation objects.
 */
export async function getAllRepresentations(): Promise<Representation[]> {
  return representationRepository.getAll();
}

/**
 * Fetches all pending representation requests older than a certain number of days based on their START DATE.
 * @param daysOld The number of days old a request's start date must be to be included.
 * @returns An array of old, pending Representation objects.
 */
export async function getOldPendingRepresentations(daysOld: number = 5): Promise<Representation[]> {
  return representationRepository.getOldPending(daysOld);
}
