import { FirebaseRepresentationRepository } from './firebase/FirebaseRepresentationRepository';
import { FirebaseDocumentTemplateRepository } from './firebase/FirebaseDocumentTemplateRepository';
import { FirebaseTrainingCategoryRepository } from './firebase/FirebaseTrainingCategoryRepository';
import { FirebaseTrainingOrganizerRepository } from './firebase/FirebaseTrainingOrganizerRepository';
import { FirebaseTrainingHistoryRepository } from './firebase/FirebaseTrainingHistoryRepository';
import { FirebasePersonRepository } from './firebase/FirebasePersonRepository';
import { FirebaseStateBureauRepository } from './firebase/FirebaseStateChamberRepository';

import { IRepresentationRepository } from './interfaces/IRepresentationRepository';
import { IDocumentTemplateRepository } from './interfaces/IDocumentTemplateRepository';
import { ITrainingCategoryRepository } from './interfaces/ITrainingCategoryRepository';
import { ITrainingOrganizerRepository } from './interfaces/ITrainingOrganizerRepository';
import { ITrainingHistoryRepository } from './interfaces/ITrainingHistoryRepository';
import { IPersonRepository } from './interfaces/IPersonRepository';
import { IStateBureauRepository } from './interfaces/IStateChamberRepository';

// Create and export repository instances
export const representationRepository: IRepresentationRepository = new FirebaseRepresentationRepository();
export const documentTemplateRepository: IDocumentTemplateRepository = new FirebaseDocumentTemplateRepository();
export const trainingCategoryRepository: ITrainingCategoryRepository = new FirebaseTrainingCategoryRepository();
export const trainingOrganizerRepository: ITrainingOrganizerRepository = new FirebaseTrainingOrganizerRepository();
export const trainingHistoryRepository: ITrainingHistoryRepository = new FirebaseTrainingHistoryRepository();
export const personRepository: IPersonRepository = new FirebasePersonRepository();
export const stateBureauRepository: IStateBureauRepository = new FirebaseStateBureauRepository();
