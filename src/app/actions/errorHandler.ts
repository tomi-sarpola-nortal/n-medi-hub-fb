import { 
  AppError, 
  DatabaseError, 
  NotFoundError, 
  ValidationError, 
  AuthenticationError, 
  AuthorizationError, 
  FileOperationError, 
  ExternalServiceError, 
  ConfigurationError 
} from '@/lib/errors';

/**
 * Centralized error handler for server actions
 * @param error The error to handle
 * @returns A standardized error response object
 */
export function handleActionError(error: unknown): { success: false; message: string; errorType: string } {
  console.error('Action error:', error);
  
  // Handle our custom error types
  if (error instanceof AppError) {
    return {
      success: false,
      message: error.message,
      errorType: error.name,
    };
  }
  
  // Handle Firebase errors
  if (error && typeof error === 'object' && 'code' in error) {
    const firebaseError = error as { code: string; message: string };
    
    // Authentication errors
    if (firebaseError.code.startsWith('auth/')) {
      return {
        success: false,
        message: `Authentication error: ${firebaseError.message}`,
        errorType: 'AuthenticationError',
      };
    }
    
    // Firestore errors
    if (firebaseError.code.startsWith('firestore/')) {
      return {
        success: false,
        message: `Database error: ${firebaseError.message}`,
        errorType: 'DatabaseError',
      };
    }
    
    // Storage errors
    if (firebaseError.code.startsWith('storage/')) {
      return {
        success: false,
        message: `File storage error: ${firebaseError.message}`,
        errorType: 'FileOperationError',
      };
    }
  }
  
  // Generic error handling for unexpected errors
  const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
  return {
    success: false,
    message: errorMessage,
    errorType: 'UnknownError',
  };
}

/**
 * Wraps a server action with error handling
 * @param action The server action function to wrap
 * @returns A wrapped function that handles errors
 */
export function withErrorHandling<T, Args extends any[]>(
  action: (...args: Args) => Promise<T>
): (...args: Args) => Promise<T | { success: false; message: string; errorType: string }> {
  return async (...args: Args) => {
    try {
      return await action(...args);
    } catch (error) {
      return handleActionError(error);
    }
  };
}