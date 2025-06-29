import type { StateChamber, StateChamberCreationData } from '@/lib/types';

/**
 * Interface for the StateChamber repository
 * Defines methods for interacting with state chamber data
 */
export interface IStateChamberRepository {
  /**
   * Creates a new state chamber document in the data store
   * @param id The document ID for the new chamber (e.g., 'wien')
   * @param chamberData The data for the new chamber
   */
  create(id: string, chamberData: StateChamberCreationData): Promise<void>;
  
  /**
   * Retrieves a state chamber by its ID
   * @param id The ID of the state chamber to retrieve
   * @returns A StateChamber object if found, otherwise null
   */
  getById(id: string): Promise<StateChamber | null>;
  
  /**
   * Retrieves all state chambers from the data store
   * @returns An array of StateChamber objects
   */
  getAll(): Promise<StateChamber[]>;
}