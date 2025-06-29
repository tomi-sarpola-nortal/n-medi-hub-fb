'use server';

import { stateChamberRepository } from '@/data';
import type { StateChamber, StateChamberCreationData } from '@/lib/types';
import { withErrorHandling } from '@/app/actions/errorHandler';
import { ValidationError } from '@/lib/errors';

/**
 * Creates a new state chamber document in Firestore. The ID is provided explicitly.
 * @param id The document ID for the new chamber (e.g., 'wien').
 * @param chamberData The data for the new chamber.
 */
export const createStateChamber = withErrorHandling(
  async (id: string, chamberData: StateChamberCreationData): Promise<void> => {
    if (!id) {
      throw new ValidationError("Chamber ID is required");
    }
    
    if (!chamberData.name) {
      throw new ValidationError("Chamber name is required");
    }
    
    return stateChamberRepository.create(id, chamberData);
  }
);

/**
 * Finds a state chamber by its ID.
 * @param id The ID to search for.
 * @returns A StateChamber object if found, otherwise null.
 */
export const getStateChamberById = withErrorHandling(
  async (id: string): Promise<StateChamber | null> => {
    if (!id) {
      throw new ValidationError("Chamber ID is required");
    }
    
    return stateChamberRepository.getById(id);
  }
);

/**
 * Retrieves all state chambers from Firestore.
 * @returns An array of StateChamber objects.
 */
export const getAllStateChambers = withErrorHandling(
  async (): Promise<StateChamber[]> => {
    return stateChamberRepository.getAll();
  }
);