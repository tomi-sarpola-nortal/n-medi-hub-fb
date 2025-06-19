
import type { Timestamp } from 'firebase/firestore';
import type { LucideIcon } from 'lucide-react'; // For NavItem icon

export type UserRole = 'dentist' | 'lk_member' | 'ozak_employee'; // Extended UserRole

// This is the primary User type, used in auth context and for user data.
// It combines properties that might have been in separate User and Person types.
export interface User {
  id: string; // Corresponds to Firestore document ID (which will be Firebase Auth UID)
  name: string;
  email: string; // Should be unique (from Firebase Auth)
  // hashedPassword is removed as Firebase Auth handles it
  role: UserRole;
  region: string; 
  dentistId?: string; // Unique for dentists, assigned by LK
  profileImage?: string; // Renamed from avatarUrl for consistency
  
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
  // hashedPassword is removed
  role: UserRole; 
  region: string;
  dentistId?: string; 
  avatarUrl?: string; // Consider renaming to profileImage for consistency with User type
  status: 'pending_approval' | 'active' | 'inactive' | 'rejected';
  otpEnabled: boolean; 
  otpSecret?: string; 
  createdAt: Timestamp; 
  updatedAt: Timestamp; 
}

// Data needed to create a new person document in Firestore, after Firebase Auth user is created.
// This is the data beyond what Firebase Auth stores.
// It also includes 'email' as we decided to store it in Firestore as well for querying.
export type PersonCreationData = Omit<Person, 'id' | 'createdAt' | 'updatedAt'>;

// Data structure for the registration form state
export interface RegistrationFormData {
  email: string;
  password?: string; // Password will be handled by Auth
  name: string;
  role: UserRole;
  region: string;
  dentistId?: string;
  avatarUrl?: string; // Will be used for initial profile setup
  status?: 'pending_approval' | 'active' | 'inactive' | 'rejected'; // Default to pending_approval
  otpEnabled?: boolean; // Default to false
  // Add other fields from your 6-step registration process here
  // For example:
  // addressLine1?: string;
  // phoneNumber?: string;
  // qualifications?: string[];
}
