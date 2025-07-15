import type { StateBureau, StateBureauCreationData } from '@/lib/types';

/**
 * Interface for the StateBureau repository
 * Defines methods for interacting with state bureau data
 */
export interface IStateBureauRepository {
  /**
   * Creates a new state bureau document in the data store
   * @param id The document ID for the new bureau (e.g., 'wien')
   * @param bureauData The data for the new bureau
   */
  create(id: string, bureauData: StateBureauCreationData): Promise<void>;
  
  /**
   * Retrieves a state bureau by its ID
   * @param id The ID of the state bureau to retrieve
   * @returns A StateBureau object if found, otherwise null
   */
  getById(id: string): Promise<StateBureau | null>;
  
  /**
   * Retrieves all state bureaus from the data store
   * @returns An array of StateBureau objects
   */
  getAll(): Promise<StateBureau[]>;
}
