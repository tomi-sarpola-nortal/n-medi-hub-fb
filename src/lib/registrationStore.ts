
// A very simple in-memory store for multi-step registration data.

import type { UserRole } from "./types"; // Assuming UserRole might be needed later

interface RegistrationData {
  // Step 1
  email?: string;
  password?: string;

  // Step 2: Personal Data
  title?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: Date;
  placeOfBirth?: string;
  nationality?: string;
  streetAddress?: string;
  postalCode?: string;
  city?: string;
  stateOrProvince?: string; // Bundesland
  phoneNumber?: string;
  idDocument?: File | null;
  idDocumentName?: string; // To display the name of the selected file

  // Step 3: Professional Information (placeholder for future)
  // ...

  // Step 4: Academic Titles (placeholder for future)
  // ...

  // Step 5: Contact Preferences (placeholder for future)
  // ...

  // Step 6: Review & Confirm (placeholder for future)
  // ...

  // Overall registration details
  role?: UserRole; // This might be set at some point or defaulted
}

export const registrationDataStore: RegistrationData = {};

export function updateRegistrationData(data: Partial<RegistrationData>) {
  Object.assign(registrationDataStore, data);
  console.log("Registration data updated:", registrationDataStore);
}

export function getRegistrationData(): RegistrationData {
  return { ...registrationDataStore }; // Return a copy
}

export function clearRegistrationData() {
    // Clear Step 1
    (registrationDataStore as any).email = undefined;
    (registrationDataStore as any).password = undefined;

    // Clear Step 2
    (registrationDataStore as any).title = undefined;
    (registrationDataStore as any).firstName = undefined;
    (registrationDataStore as any).lastName = undefined;
    (registrationDataStore as any).dateOfBirth = undefined;
    (registrationDataStore as any).placeOfBirth = undefined;
    (registrationDataStore as any).nationality = undefined;
    (registrationDataStore as any).streetAddress = undefined;
    (registrationDataStore as any).postalCode = undefined;
    (registrationDataStore as any).city = undefined;
    (registrationDataStore as any).stateOrProvince = undefined;
    (registrationDataStore as any).phoneNumber = undefined;
    (registrationDataStore as any).idDocument = undefined;
    (registrationDataStore as any).idDocumentName = undefined;

    // Clear other fields as they are added
    console.log("Registration data cleared.");
}
