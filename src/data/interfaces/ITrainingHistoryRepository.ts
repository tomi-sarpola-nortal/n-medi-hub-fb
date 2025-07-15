import type { TrainingHistory, TrainingHistoryCreationData } from '@/lib/types';

export interface ITrainingHistoryRepository {
  addForUser(userId: string, historyData: TrainingHistoryCreationData): Promise<string>;
  getForUser(userId: string): Promise<TrainingHistory[]>;
  getItemForUser(userId: string, itemId: string): Promise<TrainingHistory | null>;
}
