
import type { Person, PersonCreationData, UserRole } from '@/lib/types';

export interface IPersonRepository {
  create(uid: string, personData: PersonCreationData, locale: string): Promise<void>;
  getById(id: string): Promise<Person | null>;
  update(id: string, updates: Partial<Person>): Promise<void>;
  findByEmail(email: string): Promise<Person | null>;
  findByDentistId(dentistId: string): Promise<Person | null>;
  getAll(): Promise<Person[]>;
  getPaginated(options: {
    page: number;
    pageSize: number;
    orderBy?: { field: string; direction: 'asc' | 'desc' };
    filters?: Record<string, any>;
  }): Promise<{ data: Person[]; total: number }>;
  getByRole(role: UserRole): Promise<Person[]>;
  getPersonsToReview(): Promise<Person[]>;
  review(personId: string, decision: 'approve' | 'deny' | 'reject', justification: string | undefined, auditor: { id: string; name: string; role: UserRole; chamber: string; }, locale: string): Promise<void>;
}
    