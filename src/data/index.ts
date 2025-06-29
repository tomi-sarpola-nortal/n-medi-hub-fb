import { FirebaseRepresentationRepository } from './firebase/FirebaseRepresentationRepository';
import { IRepresentationRepository } from './interfaces/IRepresentationRepository';

// Create and export repository instances
export const representationRepository: IRepresentationRepository = new FirebaseRepresentationRepository();

// Add other repositories as they are implemented