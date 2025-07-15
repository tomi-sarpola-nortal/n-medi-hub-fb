'use server';

import { trainingOrganizerRepository } from '@/data';
import type { TrainingOrganizer, TrainingOrganizerCreationData } from '@/lib/types';

/**
 * Finds a training organizer by its name.
 * @param name The name to search for.
 * @returns A TrainingOrganizer object if found, otherwise null.
 */
export async function findTrainingOrganizerByName(name: string): Promise<TrainingOrganizer | null> {
  return trainingOrganizerRepository.findByName(name);
}

/**
 * Creates a new training organizer document in Firestore. A url-safe version of the name is used as the document ID.
 * @param organizerData The data for the new organizer.
 */
export async function createTrainingOrganizer(organizerData: TrainingOrganizerCreationData): Promise<void> {
  return trainingOrganizerRepository.create(organizerData);
}

/**
 * Retrieves all training organizers from Firestore.
 * @returns An array of TrainingOrganizer objects.
 */
export async function getAllTrainingOrganizers(): Promise<TrainingOrganizer[]> {
  return trainingOrganizerRepository.getAll();
}