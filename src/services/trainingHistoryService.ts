'use server';

import { trainingHistoryRepository } from '@/data';
import type { TrainingHistory, TrainingHistoryCreationData } from '@/lib/types';

/**
 * Adds a new training history record for a specific user.
 * @param userId The ID of the user.
 * @param historyData The training history data to add.
 * @returns The ID of the newly created history document.
 */
export async function addTrainingHistoryForUser(
  userId: string,
  historyData: TrainingHistoryCreationData
): Promise<string> {
  return trainingHistoryRepository.addForUser(userId, historyData);
}

/**
 * Fetches the training history for a specific user, ordered by date descending.
 * @param userId The ID of the user.
 * @returns An array of TrainingHistory objects.
 */
export async function getTrainingHistoryForUser(userId: string): Promise<TrainingHistory[]> {
  return trainingHistoryRepository.getForUser(userId);
}

/**
 * Fetches a single training history item for a specific user.
 * @param userId The ID of the user.
 * @param itemId The ID of the training history item.
 * @returns A TrainingHistory object if found, otherwise null.
 */
export async function getTrainingHistoryItem(userId: string, itemId: string): Promise<TrainingHistory | null> {
  return trainingHistoryRepository.getItemForUser(userId, itemId);
}