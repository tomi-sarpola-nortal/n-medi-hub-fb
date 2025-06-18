import type { Timestamp } from 'firebase/firestore';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'dentist' | 'landeskammer_member';
  region: string; 
  dentistId?: string; 
  avatarUrl?: string; 
}

// Note: SuggestDocumentsOutput from AI flow will be the primary type for suggested documents.
// This is a basic placeholder if needed elsewhere.
export interface SuggestedDocument {
  title: string;
  description: string;
  documentId: string;
}

export interface Person {
  id: string; // Corresponds to Firestore document ID
  name: string;
  email: string; // Should be unique
  hashedPassword?: string; // IMPORTANT: Store only hashed passwords. Consider Firebase Auth for proper password management.
  role: 'dentist' | 'landeskammer_member'; // Extend with other roles like 'admin' if necessary
  region: string;
  dentistId?: string; // Should be unique for dentists, assigned by LK
  avatarUrl?: string;
  // Status to manage workflow:
  // - 'pending_approval': For self-registered dentists awaiting LK approval.
  // - 'active': Approved and active users.
  // - 'inactive': Users deactivated by LK.
  // - 'rejected': Registrations rejected by LK.
  status: 'pending_approval' | 'active' | 'inactive' | 'rejected';
  otpEnabled: boolean; // For OTP-based login feature
  otpSecret?: string; // Encrypted or securely stored. Firebase Auth MFA is recommended if available.
  createdAt: Timestamp; // Firestore Timestamp
  updatedAt: Timestamp; // Firestore Timestamp
}
