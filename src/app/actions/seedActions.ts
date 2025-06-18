
'use server';

import { createPerson, findPersonByEmail } from '@/services/personService';
import type { Person } from '@/types';

export async function seedSabineMueller(): Promise<{ success: boolean; message: string }> {
  try {
    // Check if user already exists to prevent duplicates
    const existingUser = await findPersonByEmail('sabine.mueller@example.com');
    if (existingUser) {
      return { success: true, message: `Sabine Müller already exists with ID: ${existingUser.id}. No new document created.` };
    }

    const sabineData: Omit<Person, 'id' | 'createdAt' | 'updatedAt'> = {
      name: 'Dr. Sabine Müller',
      email: 'sabine.mueller@example.com',
      // IMPORTANT: Store HASHED passwords in a real application.
      // This is plaintext for demonstration ONLY. Use Firebase Authentication or a secure hashing library.
      hashedPassword: 'TestTest24',
      role: 'dentist',
      region: 'Bayern',
      dentistId: 'ZA-2025-0842',
      avatarUrl: 'https://placehold.co/100x100.png?text=SM',
      status: 'active',
      otpEnabled: false,
      // otpSecret will be undefined by default
    };

    const personId = await createPerson(sabineData);
    console.log('Successfully seeded Sabine Müller with ID:', personId);
    return { success: true, message: `Sabine Müller seeded successfully with ID: ${personId}` };
  } catch (error) {
    console.error('Error seeding Sabine Müller:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, message: `Error seeding Sabine Müller: ${errorMessage}` };
  }
}
