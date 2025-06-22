
// A very simple in-memory store for multi-step registration data.

import type { UserRole } from "./types";

// Define the structure for specializations and professional titles
export const DENTAL_SPECIALIZATIONS = [
  { id: 'implantologie', labelKey: 'register_step4_spec_implantologie' },
  { id: 'parodontologie', labelKey: 'register_step4_spec_parodontologie' },
  { id: 'allgemeine_zahnheilkunde', labelKey: 'register_step4_spec_allgemeine_zahnheilkunde' },
  { id: 'prothetik', labelKey: 'register_step4_spec_prothetik' },
  { id: 'kieferorthopaedie', labelKey: 'register_step4_spec_kieferorthopaedie' },
  { id: 'endodontie', labelKey: 'register_step4_spec_endodontie' },
  { id: 'kinderzahnheilkunde', labelKey: 'register_step4_spec_kinderzahnheilkunde' },
  { id: 'oralchirurgie', labelKey: 'register_step4_spec_oralchirurgie' },
] as const; 

export type SpecializationId = typeof DENTAL_SPECIALIZATIONS[number]['id'];

export const PROFESSIONAL_TITLES = [
  { id: 'zahnarzt', labelKey: 'register_step4_prof_title_zahnarzt' },
  { id: 'fachzahnarzt_kfo', labelKey: 'register_step4_prof_title_fachzahnarzt_kfo' },
  { id: 'fachzahnarzt_oralchirurgie', labelKey: 'register_step4_prof_title_fachzahnarzt_oralchirurgie' },
  { id: 'assistenzzahnarzt', labelKey: 'register_step4_prof_title_assistenzzahnarzt' },
  { id: 'student_zahnmedizin', labelKey: 'register_step4_prof_title_student_zahnmedizin' },
] as const;
export type ProfessionalTitleId = typeof PROFESSIONAL_TITLES[number]['id'];

export const HEALTH_INSURANCE_CONTRACTS = [
    { id: 'ogk', labelKey: 'register_step5_contract_ogk' },
    { id: 'svs', labelKey: 'register_step5_contract_svs' },
    { id: 'bvaeb', labelKey: 'register_step5_contract_bvaeb' },
    { id: 'kfa', labelKey: 'register_step5_contract_kfa' },
] as const;
export type HealthInsuranceContractId = typeof HEALTH_INSURANCE_CONTRACTS[number]['id'];

// For Step 3 (Personal Data) - to map select values to display text
export const TITLES_MAP: Record<string, string> = {
  "Dr.": "title_dr",
  "Prof.": "title_prof",
  "Mag.": "title_mag",
  "none": "title_none"
};

export const NATIONALITIES_MAP: Record<string, string> = {
  "AT": "nationality_at",
  "DE": "nationality_de",
  "CH": "nationality_ch",
  "other": "nationality_other"
};

export const STATES_MAP: Record<string, string> = {
  "Wien": "state_wien",
  "NÖ": "state_noe",
  "OÖ": "state_ooe",
  "Bayern": "state_bayern",
  "Baden-Württemberg": "state_bw"
  // Add other states as needed
};


export interface RegistrationData {
  // Session ID for anonymous file uploads
  sessionId?: string;

  // Step 1
  email?: string;
  // Step 2
  password?: string;

  // Step 3: Personal Data
  title?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: Date;
  placeOfBirth?: string;
  nationality?: string;
  streetAddress?: string;
  postalCode?: string;
  city?: string;
  stateOrProvince?: string;
  phoneNumber?: string;
  idDocumentUrl?: string;
  idDocumentName?: string;

  // Step 4: Professional Qualifications
  currentProfessionalTitle?: ProfessionalTitleId;
  specializations?: SpecializationId[];
  languages?: string[]; 
  graduationDate?: Date; 
  university?: string;
  approbationNumber?: string;
  approbationDate?: Date; 
  diplomaUrl?: string;
  diplomaName?: string;
  approbationCertificateUrl?: string;
  approbationCertificateName?: string;
  specialistRecognitionUrl?: string;
  specialistRecognitionName?: string;

  // Step 5: Practice Information
  practiceName?: string;
  practiceStreetAddress?: string;
  practicePostalCode?: string;
  practiceCity?: string;
  practicePhoneNumber?: string;
  practiceFaxNumber?: string;
  practiceEmail?: string;
  practiceWebsite?: string;
  healthInsuranceContracts?: HealthInsuranceContractId[];

  // Step 6: Review & Confirm
  agreedToTerms?: boolean;


  // Overall registration details - role is selected/assigned as part of the process or post-reg
  role?: UserRole; // This might be set to 'dentist' by default for this flow
}

let registrationDataStore: RegistrationData = {};

export function updateRegistrationData(data: Partial<RegistrationData>) {
  Object.assign(registrationDataStore, data);
  console.log("Registration data updated:", registrationDataStore);
}

export function getRegistrationData(): RegistrationData {
  return { ...registrationDataStore }; // Return a copy
}

export function clearRegistrationData() {
  registrationDataStore = {};
  console.log("Registration data cleared.");
}

// Helper to get translation key for a value from a map
export const getTranslationKey = (value: string | undefined, map: Record<string, string>): string | undefined => {
  if (!value) return undefined;
  return map[value] || value; // Fallback to value itself if not in map
};

// Helper to get translation key for an array of values
export const getTranslationKeysForArray = (values: string[] | undefined, map: readonly {id: string, labelKey: string}[]): string[] => {
  if (!values || values.length === 0) return [];
  return values.map(val => {
    const foundItem = map.find(item => item.id === val);
    return foundItem ? foundItem.labelKey : val; // Fallback to value itself
  });
};
