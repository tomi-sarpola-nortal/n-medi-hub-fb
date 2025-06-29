import type { LucideIcon } from 'lucide-react';

// ==========================================
// User Role and Authentication Types
// ==========================================
export type UserRole = 'dentist' | 'lk_member' | 'ozak_employee';

// ==========================================
// Navigation Types
// ==========================================
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

// ==========================================
// Document Types
// ==========================================
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

// ==========================================
// Person Types - Broken into smaller interfaces
// ==========================================

// Base information about a person
export interface IPersonBase {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  region: string;
  dentistId?: string;
  avatarUrl?: string;
  status: 'pending' | 'active' | 'inactive' | 'rejected';
  stateChamberId?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Security and authentication related fields
export interface IPersonSecurity {
  otpEnabled: boolean;
  otpSecret?: string;
  notificationSettings: {
    inApp: boolean;
    email: boolean;
  };
}

// Personal details
export interface IPersonalDetails {
  title?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string; // YYYY-MM-DD
  placeOfBirth?: string;
  nationality?: string;
  streetAddress?: string;
  postalCode?: string;
  city?: string;
  stateOrProvince?: string;
  phoneNumber?: string;
  idDocumentUrl?: string;
  idDocumentName?: string;
}

// Professional qualifications
export interface IProfessionalQualifications {
  currentProfessionalTitle?: string;
  specializations?: string[];
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
}

// Practice information
export interface IPracticeInformation {
  practiceName?: string;
  practiceStreetAddress?: string;
  practicePostalCode?: string;
  practiceCity?: string;
  practicePhoneNumber?: string;
  practiceFaxNumber?: string;
  practiceEmail?: string;
  practiceWebsite?: string;
  healthInsuranceContracts?: string[];
}

// Additional metadata
export interface IPersonMetadata {
  approved?: boolean;
  educationPoints?: number;
  rejectionReason?: string;
  pendingData?: Partial<Person>;
  hasPendingChanges?: boolean;
}

// Complete Person type composed of all the smaller interfaces
export type Person = IPersonBase & 
  IPersonSecurity & 
  IPersonalDetails & 
  IProfessionalQualifications & 
  IPracticeInformation & 
  IPersonMetadata;

// Type for creating a new person
export type PersonCreationData = Omit<Person, 'id' | 'createdAt' | 'updatedAt' | 'pendingData'>;

// ==========================================
// Training and Education Types
// ==========================================
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

export interface ZfdGroup {
  id: string; // e.g., 'berufsbezogen'
  nameKey: string; // Translation key, e.g., 'zfd_category_berufsbezogen'
  totalPoints: number;
}

export type ZfdGroupCreationData = Omit<ZfdGroup, 'id'>;

// ==========================================
// Chamber and Organization Types
// ==========================================
export interface StateChamber {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  officeHours: string;
}

export type StateChamberCreationData = Omit<StateChamber, 'id'>;

// ==========================================
// Representation Types
// ==========================================
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

// ==========================================
// Audit and Notification Types
// ==========================================
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

// ==========================================
// Registration Form Types
// ==========================================
export interface RegistrationFormData {
  email: string;
  password?: string;
  
  // From Person interface
  name: string;
  role: UserRole;
  region: string;
  dentistId?: string;
  avatarUrl?: string;
  status?: 'pending' | 'active' | 'inactive' | 'rejected';
  otpEnabled?: boolean;
  
  // Personal Data
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

  // Professional Qualifications
  currentProfessionalTitle?: string;
  specializations?: string[];
  languages?: string[];
  graduationDate?: Date | string;
  university?: string;
  approbationNumber?: string;
  approbationDate?: Date | string;
  diplomaFile?: File | null;
  diplomaUrl?: string;
  diplomaName?: string;
  approbationCertificateFile?: File | null;
  approbationCertificateUrl?: string;
  approbationCertificateName?: string;
  specialistRecognitionFile?: File | null;
  specialistRecognitionUrl?: string;
  specialistRecognitionName?: string;

  // Practice Information
  practiceName?: string;
  practiceStreetAddress?: string;
  practicePostalCode?: string;
  practiceCity?: string;
  practicePhoneNumber?: string;
  practiceFaxNumber?: string;
  practiceEmail?: string;
  practiceWebsite?: string;
  healthInsuranceContracts?: string[];

  // Terms agreement
  agreedToTerms?: boolean;
}