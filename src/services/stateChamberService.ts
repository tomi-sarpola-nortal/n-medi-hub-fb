'use server';

import { stateChamberRepository } from '@/data';
import type { StateChamber, StateChamberCreationData } from '@/lib/types';

/**
 * Creates a new state chamber document in Firestore. The ID is provided explicitly.
 * @param id The document ID for the new chamber (e.g., 'wien').
 * @param chamberData The data for the new chamber.
 */
export async function createStateChamber(id: string, chamberData: StateChamberCreationData): Promise<void> {
  return stateChamberRepository.create(id, chamberData);
}

/**
 * Finds a state chamber by its ID.
 * @param id The ID to search for.
 * @returns A StateChamber object if found, otherwise null.
 */
export async function getStateChamberById(id: string): Promise<StateChamber | null> {
  return stateChamberRepository.getById(id);
}

/**
 * Retrieves all state chambers from Firestore.
 * @returns An array of StateChamber objects.
 */
export async function getAllStateChambers(): Promise<StateChamber[]> {
  return stateChamberRepository.getAll();
}