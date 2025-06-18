
import type { Timestamp } from 'firebase/firestore';
import type { LucideIcon } from 'lucide-react'; // For NavItem icon

export type UserRole = 'dentist' | 'lk_member' | 'ozak_employee'; // Extended UserRole

// This is the primary User type, used in auth context and for user data.
// It combines properties that might have been in separate User and Person types.
export interface User {
  id: string; // Corresponds to Firestore document ID
  name: string;
  email: string; // Should be unique
  hashedPassword?: string; // IMPORTANT: Store only hashed passwords. Firebase Auth is preferred.
  role: UserRole;
  region: string; 
  dentistId?: string; // Unique for dentists, assigned by LK
  profileImage?: string; // Renamed from avatarUrl for consistency
  
  // Status to manage workflow (relevant for dentists, could be optional for other roles)
  status?: 'pending_approval' | 'active' | 'inactive' | 'rejected';
  
  otpEnabled?: boolean; 
  otpSecret?: string; // Encrypted or securely stored. Firebase Auth MFA is recommended.
  
  // Additional fields that might be relevant from the original Person type
  approved?: boolean; // Can be derived from status or be a separate flag
  educationPoints?: number; // Example, could be fetched from external system

  // Timestamps (optional here, as they are primarily Firestore concerns)
  createdAt?: Timestamp; 
  updatedAt?: Timestamp; 
}


// NavItem used in navigation configuration
export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  label?: string;
  roles?: UserRole[]; // Which roles can see this item
  disabled?: boolean;
  external?: boolean;
  items?: NavItem[]; // For sub-navigation
}


// Note: SuggestDocumentsOutput from AI flow will be the primary type for suggested documents.
// This is a basic placeholder if needed elsewhere.
export interface SuggestedDocument {
  title: string;
  description: string;
  documentId: string;
}


// The 'Person' type might be deprecated or merged into 'User' 
// if 'User' becomes the canonical representation from Firestore.
// For now, keeping it separate for clarity on Firestore structure if it differs.
export interface Person {
  id: string; 
  name: string;
  email: string; 
  hashedPassword?: string; 
  role: UserRole; 
  region: string;
  dentistId?: string; 
  avatarUrl?: string; // Note: User uses profileImage
  status: 'pending_approval' | 'active' | 'inactive' | 'rejected';
  otpEnabled: boolean; 
  otpSecret?: string; 
  createdAt: Timestamp; 
  updatedAt: Timestamp; 
}

