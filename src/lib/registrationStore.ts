
// A very simple in-memory store for multi-step registration data.
// This is temporary and should be replaced with a more robust solution (e.g., Context API, Zustand)
// if the registration flow becomes more complex or needs to persist across refreshes.

interface RegistrationData {
  email?: string;
  password?: string;
  // Add other fields as we go through the steps
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
    (registrationDataStore as any).email = undefined;
    (registrationDataStore as any).password = undefined;
    // Clear other fields as they are added
    console.log("Registration data cleared.");
}
