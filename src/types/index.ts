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
