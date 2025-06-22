
import type { Timestamp } from 'firebase/firestore';
import type { LucideIcon } from 'lucide-react'; // For NavItem icon
import type { ProfessionalTitleId, SpecializationId, HealthInsuranceContractId } from '@/lib/registrationStore';


export type UserRole = 'dentist' | 'lk_member' | 'ozak_employee'; // Extended UserRole

// This is the primary User type, used in auth context and for user data.
// It combines properties that might have been in separate User and Person types.
export interface User {
  id: string; // Corresponds to Firestore document ID (which will be Firebase Auth UID)
  name: string;
  email: string; // Should be unique (from Firebase Auth)
  
  // Personal Data
  title?: string;
  firstName?: string;
  lastName?: string;

  role: UserRole;
  region: string; 
  dentistId?: string; // Unique for dentists, assigned by LK
  avatarUrl?: string; // Standardized from profileImage
  
  status?: 'pending_approval' | 'active' | 'inactive' | 'rejected';
  
  otpEnabled?: boolean; 
  otpSecret?: string; // For 2FA, if implemented beyond Firebase Auth's MFA
  
  approved?: boolean; 
  educationPoints?: number; 

  createdAt?: Timestamp; 
  updatedAt?: Timestamp; 
}


// NavItem used in navigation configuration
export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  label?: string;
  roles?: UserRole[]; 
  disabled?: boolean;
  external?: boolean;
  items?: NavItem[]; 
}


export interface SuggestedDocument {
  title: string;
  description: string;
  documentId: string;
}


// Firestore document structure for a person.
// The document ID for 'persons' collection should be the Firebase Auth UID.
export interface Person {
  id: string; // This will be the Firebase Auth UID
  name: string;
  email: string; 
  role: UserRole; 
  region: string; // e.g. "Bayern", "Wien"
  dentistId?: string; 
  avatarUrl?: string; 
  status: 'pending_approval' | 'active' | 'inactive' | 'rejected';
  otpEnabled: boolean; 
  otpSecret?: string; 
  
  // Add missing fields to make it a complete user representation
  approved?: boolean;
  educationPoints?: number;

  // Personal Data from Step 3
  title?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string; // Storing as YYYY-MM-DD string
  placeOfBirth?: string;
  nationality?: string;
  streetAddress?: string;
  postalCode?: string;
  city?: string;
  stateOrProvince?: string; // This could be the same as 'region' or more specific
  phoneNumber?: string;
  idDocumentUrl?: string;
  idDocumentName?: string;

  // Professional Qualifications from Step 4
  currentProfessionalTitle?: ProfessionalTitleId;
  specializations?: SpecializationId[];
  languages?: string[];
  graduationDate?: string; // Storing as YYYY-MM-DD string
  university?: string;
  approbationNumber?: string;
  approbationDate?: string; // Storing as YYYY-MM-DD string
  diplomaUrl?: string;
  diplomaName?: string;
  approbationCertificateUrl?: string;
  approbationCertificateName?: string;
  specialistRecognitionUrl?: string;
  specialistRecognitionName?: string;
  
  // Practice Information from Step 5
  practiceName?: string;
  practiceStreetAddress?: string;
  practicePostalCode?: string;
  practiceCity?: string;
  practicePhoneNumber?: string;
  practiceFaxNumber?: string;
  practiceEmail?: string;
  practiceWebsite?: string;
  healthInsuranceContracts?: HealthInsuranceContractId[];

  createdAt: Timestamp; 
  updatedAt: Timestamp; 
}

// Data needed to create a new person document in Firestore, after Firebase Auth user is created.
export type PersonCreationData = Omit<Person, 'id' | 'createdAt' | 'updatedAt'>;

// Data structure for the registration form state (in registrationStore.ts)
// This interface is more for the internal store, PersonCreationData is for Firestore.
export interface RegistrationFormData {
  email: string;
  password?: string; // Password will be handled by Auth
  
  // From Person interface (for data structure consistency during creation)
  name: string; // Will be constructed from title, firstName, lastName
  role: UserRole;
  region: string;
  dentistId?: string;
  avatarUrl?: string; 
  status?: 'pending_approval' | 'active' | 'inactive' | 'rejected'; 
  otpEnabled?: boolean; 
  
  // Step 3
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
  idDocumentUrl?: string;
  idDocumentName?: string;

  // Step 4
  currentProfessionalTitle?: ProfessionalTitleId;
  specializations?: SpecializationId[];
  languages?: string[];
  graduationDate?: Date;
  university?: string;
  approbationNumber?: string;
  approbationDate?: Date;
  diplomaFile?: File | null;
  diplomaUrl?: string;
  diplomaName?: string;
  approbationCertificateFile?: File | null;
  approbationCertificateUrl?: string;
  approbationCertificateName?: string;
  specialistRecognitionFile?: File | null;
  specialistRecognitionUrl?: string;
  specialistRecognitionName?: string;

  // Step 5
  practiceName?: string;
  practiceStreetAddress?: string;
  practicePostalCode?: string;
  practiceCity?: string;
  practicePhoneNumber?: string;
  practiceFaxNumber?: string;
  practiceEmail?: string;
  practiceWebsite?: string;
  healthInsuranceContracts?: HealthInsuranceContractId[];

  // Step 6
  agreedToTerms?: boolean;
}
