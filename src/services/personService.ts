
'use server';

import { personRepository } from '@/data';
import type { Person, PersonCreationData, UserRole } from '@/lib/types';
import { setPersonStatus as setPersonStatusAction } from '@/app/actions/memberActions';


/**
 * Creates a new person document in Firestore.
 * The document ID will be the Firebase Auth UID.
 * @param uid - The Firebase Auth User ID.
 * @param personData - The data for the new person, including all registration steps data.
 * @param locale - The locale for sending notifications.
 */
export async function createPerson(
  uid: string,
  personData: PersonCreationData,
  locale: string
): Promise<void> {
  return personRepository.create(uid, personData, locale);
}

/**
 * Retrieves a person document from Firestore by its ID (which should be Firebase Auth UID).
 * @param id - The ID of the person to retrieve (Firebase Auth UID).
 * @returns A Person object if found, otherwise null.
 */
export async function getPersonById(id: string): Promise<Person | null> {
  return personRepository.getById(id);
}

/**
 * Updates an existing person document in Firestore.
 * @param id - The ID of the person to update (Firebase Auth UID).
 * @param updates - An object containing the fields to update.
 */
export async function updatePerson(
  id: string,
  updates: Partial<Person> 
): Promise<void> {
  return personRepository.update(id, updates);
}

/**
 * Finds a person document by their email address.
 * @param email - The email address to search for.
 * @returns A Person object if found, otherwise null.
 */
export async function findPersonByEmail(email: string): Promise<Person | null> {
  return personRepository.findByEmail(email);
}

/**
 * Finds a person document by their dentist ID.
 * @param dentistId - The dentist ID to search for.
 * @returns A Person object if found, otherwise null.
 */
export async function findPersonByDentistId(dentistId: string): Promise<Person | null> {
  return personRepository.findByDentistId(dentistId);
}

/**
 * Retrieves all persons from the Firestore collection.
 * @returns An array of Person objects.
 */
export async function getAllPersons(): Promise<Person[]> {
  return personRepository.getAll();
}

/**
 * Retrieves persons with pagination support.
 * @param options Pagination options
 * @returns An object containing the paginated results and total count
 */
export async function getPersonsPaginated(options: {
  page: number;
  pageSize: number;
  orderBy?: { field: string; direction: 'asc' | 'desc' };
  filters?: Record<string, any>;
}): Promise<{ data: Person[]; total: number }> {
  return personRepository.getPaginated(options);
}


/**
 * Retrieves all persons with a specific role.
 * @param role The role to filter by.
 * @returns An array of Person objects.
 */
export async function getPersonsByRole(role: UserRole): Promise<Person[]> {
  return personRepository.getByRole(role);
}

/**
 * Processes a review for a pending person registration or data change.
 * @param personId The ID of the person to review.
 * @param decision The review decision: 'approve', 'deny', or 'reject'.
 * @param justification An optional reason for denial or rejection.
 * @param auditor The LK member performing the review.
 * @param locale The locale for email translations.
 */
export async function reviewPerson(
  personId: string, 
  decision: 'approve' | 'deny' | 'reject', 
  justification: string | undefined,
  auditor: { id: string; name: string; role: UserRole; chamber: string; },
  locale: string = 'en'
): Promise<void> {
  return personRepository.review(personId, decision, justification, auditor, locale);
}

/**
 * Retrieves persons that need to be reviewed (pending status or with pending data changes).
 * @returns An array of Person objects that need review.
 */
export async function getPersonsToReview(): Promise<Person[]> {
  return personRepository.getPersonsToReview();
}

export async function setPersonStatus(personId: string, status: Person['status']) {
    return setPersonStatusAction(personId, status);
}

    