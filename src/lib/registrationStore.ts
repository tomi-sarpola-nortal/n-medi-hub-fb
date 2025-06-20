
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


interface RegistrationData {
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
  idDocument?: File | null;
  idDocumentName?: string;

  // Step 4: Professional Qualifications
  currentProfessionalTitle?: ProfessionalTitleId;
  specializations?: SpecializationId[];
  languages?: string; 
  graduationDate?: string; 
  university?: string;
  approbationNumber?: string;
  approbationDate?: string; 
  diplomaFile?: File | null;
  diplomaFileName?: string;
  approbationCertificateFile?: File | null;
  approbationCertificateFileName?: string;
  specialistRecognitionFile?: File | null;
  specialistRecognitionFileName?: string;

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


  // Step 6: Review & Confirm (placeholder for future)
  // ...

  // Overall registration details
  role?: UserRole;
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
    // Clear Step 2
    (registrationDataStore as any).password = undefined;

    // Clear Step 3
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
    
    // Clear Step 4
    (registrationDataStore as any).currentProfessionalTitle = undefined;
    (registrationDataStore as any).specializations = undefined;
    (registrationDataStore as any).languages = undefined;
    (registrationDataStore as any).graduationDate = undefined;
    (registrationDataStore as any).university = undefined;
    (registrationDataStore as any).approbationNumber = undefined;
    (registrationDataStore as any).approbationDate = undefined;
    (registrationDataStore as any).diplomaFile = undefined;
    (registrationDataStore as any).diplomaFileName = undefined;
    (registrationDataStore as any).approbationCertificateFile = undefined;
    (registrationDataStore as any).approbationCertificateFileName = undefined;
    (registrationDataStore as any).specialistRecognitionFile = undefined;
    (registrationDataStore as any).specialistRecognitionFileName = undefined;

    // Clear Step 5
    (registrationDataStore as any).practiceName = undefined;
    (registrationDataStore as any).practiceStreetAddress = undefined;
    (registrationDataStore as any).practicePostalCode = undefined;
    (registrationDataStore as any).practiceCity = undefined;
    (registrationDataStore as any).practicePhoneNumber = undefined;
    (registrationDataStore as any).practiceFaxNumber = undefined;
    (registrationDataStore as any).practiceEmail = undefined;
    (registrationDataStore as any).practiceWebsite = undefined;
    (registrationDataStore as any).healthInsuranceContracts = undefined;


    // Clear other fields as they are added
    console.log("Registration data cleared.");
}

