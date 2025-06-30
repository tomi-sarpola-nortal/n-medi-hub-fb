'use server';

import { stateBureauRepository } from '@/data';
import type { StateBureau, StateBureauCreationData } from '@/lib/types';
import { withErrorHandling } from '@/app/actions/errorHandler';
import { ValidationError } from '@/lib/errors';

/**
 * Creates a new state bureau document in Firestore. The ID is provided explicitly.
 * @param id The document ID for the new bureau (e.g., 'wien').
 * @param bureauData The data for the new bureau.
 */
export const createStateBureau = withErrorHandling(
  async (id: string, bureauData: StateBureauCreationData): Promise<void> => {
    if (!id) {
      throw new ValidationError("Bureau ID is required");
    }
    
    if (!bureauData.name) {
      throw new ValidationError("Bureau name is required");
    }
    
    return stateBureauRepository.create(id, bureauData);
  }
);

/**
 * Finds a state bureau by its ID.
 * @param id The ID to search for.
 * @returns A StateBureau object if found, otherwise null.
 */
export const getStateBureauById = withErrorHandling(
  async (id: string): Promise<StateBureau | null> => {
    if (!id) {
      throw new ValidationError("Bureau ID is required");
    }
    
    return stateBureauRepository.getById(id);
  }
);

/**
 * Retrieves all state bureaus from Firestore.
 * @returns An array of StateBureau objects.
 */
export const getAllStateBureaus = withErrorHandling(
  async (): Promise<StateBureau[]> => {
    return stateBureauRepository.getAll();
  }
);
