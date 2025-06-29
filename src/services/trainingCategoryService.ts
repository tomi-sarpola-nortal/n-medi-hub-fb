'use server';

import { trainingCategoryRepository } from '@/data';
import type { TrainingCategory, TrainingCategoryCreationData } from '@/lib/types';

/**
 * Finds a training category by its abbreviation.
 * @param abbreviation The abbreviation to search for.
 * @returns A TrainingCategory object if found, otherwise null.
 */
export async function findTrainingCategoryByAbbreviation(abbreviation: string): Promise<TrainingCategory | null> {
  return trainingCategoryRepository.findByAbbreviation(abbreviation);
}

/**
 * Creates a new training category document in Firestore. The abbreviation is used as the document ID.
 * @param categoryData The data for the new category.
 */
export async function createTrainingCategory(categoryData: TrainingCategoryCreationData): Promise<void> {
  return trainingCategoryRepository.create(categoryData);
}

/**
 * Retrieves all training categories from Firestore.
 * @returns An array of TrainingCategory objects.
 */
export async function getAllTrainingCategories(): Promise<TrainingCategory[]> {
  return trainingCategoryRepository.getAll();
}