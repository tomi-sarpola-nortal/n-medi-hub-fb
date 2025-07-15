import type { TrainingOrganizer, TrainingOrganizerCreationData } from '@/lib/types';

export interface ITrainingOrganizerRepository {
  create(organizerData: TrainingOrganizerCreationData): Promise<void>;
  findByName(name: string): Promise<TrainingOrganizer | null>;
  getAll(): Promise<TrainingOrganizer[]>;
}