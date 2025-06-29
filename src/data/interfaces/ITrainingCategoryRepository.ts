import type { TrainingCategory, TrainingCategoryCreationData } from '@/lib/types';

export interface ITrainingCategoryRepository {
  create(categoryData: TrainingCategoryCreationData): Promise<void>;
  findByAbbreviation(abbreviation: string): Promise<TrainingCategory | null>;
  getAll(): Promise<TrainingCategory[]>;
}