
import type { Timestamp } from 'firebase/firestore';
import type { LucideIcon } from 'lucide-react'; // For NavItem icon
import type { ProfessionalTitleId, SpecializationId, HealthInsuranceContractId } from '@/lib/registrationStore';


export type UserRole = 'dentist' | 'lk_member' | 'ozak_employee'; // Extended UserRole

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

export interface DocumentTemplate {
  id: string;
  title: string;
  type: 'vorlage' | 'leitlinie' | 'empfehlung';
  publisher: string;
  lastChange: string; // ISO string from Firestore Timestamp
  fileName: string;
  fileUrl: string;
  fileFormat: string; // e.g., 'PDF', 'Word'
}

export type DocumentTemplateCreationData = Omit<DocumentTemplate, 'id' | 'lastChange'>;


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
  status: 'pending' | 'active' | 'inactive' | 'rejected';
  otpEnabled: boolean; 
  otpSecret?: string; 
  stateChamberId?: string;
  
  // Add missing fields to make it a complete user representation
  approved?: boolean;
  educationPoints?: number;

  // Notification preferences
  notificationSettings: {
    inApp: boolean;
    email: boolean;
  };

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
  graduationDate?: string;
  university?: string;
  approbationNumber?: string;
  approbationDate?: string;
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

  // Review information
  rejectionReason?: string;

  // Pending data changes
  pendingData?: Partial<Person>;
  hasPendingChanges?: boolean;

  createdAt?: string; 
  updatedAt?: string; 
}

// Data needed to create a new person document in Firestore, after Firebase Auth user is created.
export type PersonCreationData = Omit<Person, 'id' | 'createdAt' | 'updatedAt' | 'pendingData'>;

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
  status?: 'pending' | 'active' | 'inactive' | 'rejected'; 
  otpEnabled?: boolean; // Default to false
  
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

export interface TrainingCategory {
  id: string;
  name: string;
  abbreviation: string;
  isActive: boolean;
  zfdGroupId?: string; // e.g., 'berufsbezogen'
}

export type TrainingCategoryCreationData = Omit<TrainingCategory, 'id'>;

export interface TrainingOrganizer {
  id: string;
  name: string;
  isActive: boolean;
}

export type TrainingOrganizerCreationData = Omit<TrainingOrganizer, 'id'>;


export interface TrainingHistory {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  points: number;
  category: string; // The abbreviation like 'ZMK' or 'IMPL'
  organizer: string;
  zfdGroupId?: string;
}

export type TrainingHistoryCreationData = Omit<TrainingHistory, 'id'>;

export interface StateChamber {
    id: string;
    name: string;
    address: string;
    phone: string;
    email: string;
    officeHours: string;
}

export type StateChamberCreationData = Omit<StateChamber, 'id'>;

export interface ZfdGroup {
  id: string; // e.g., 'berufsbezogen'
  nameKey: string; // Translation key, e.g., 'zfd_category_berufsbezogen'
  totalPoints: number;
}

export type ZfdGroupCreationData = Omit<ZfdGroup, 'id'>;

export interface Representation {
  id: string;
  representingPersonId: string;
  representedPersonId: string;
  representingPersonName: string; 
  representedPersonName: string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  durationHours: number;
  status: 'pending' | 'confirmed' | 'declined';
  createdAt: string; // ISO date string
  confirmedAt?: string; // ISO date string
}

export type RepresentationCreationData = Omit<Representation, 'id' | 'createdAt' | 'confirmedAt'>;

export interface AuditLog {
  id: string;
  timestamp: string; // ISO string
  userId: string;
  userName: string;
  userRole: UserRole;
  userChamber: string;
  collectionName: string;
  documentId: string;
  fieldName: string | string[];
  operation: 'create' | 'read' | 'update' | 'delete';
  impactedPersonId?: string;
  impactedPersonName?: string;
  details?: string;
}

export type AuditLogCreationData = Omit<AuditLog, 'id' | 'timestamp'>;

export interface Notification {
  id: string;
  userId: string;
  message: string;
  link: string;
  isRead: boolean;
  createdAt: string;
}

export type NotificationCreationData = Omit<Notification, 'id' | 'createdAt'>;
