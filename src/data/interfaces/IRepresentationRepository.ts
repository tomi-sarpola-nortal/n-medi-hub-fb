import type { Representation, RepresentationCreationData } from '@/lib/types';

export interface IRepresentationRepository {
  create(data: RepresentationCreationData, locale: string): Promise<string>;
  getConfirmedHours(userId: string): Promise<number>;
  getForUser(userId: string): Promise<{
    performed: Representation[];
    pendingConfirmation: Representation[];
    wasRepresented: Representation[];
  }>;
  updateStatus(representationId: string, status: 'confirmed' | 'declined', locale: string): Promise<void>;
  getAll(): Promise<Representation[]>;
  getOldPending(daysOld: number): Promise<Representation[]>;
}
