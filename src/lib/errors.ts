// Custom error classes for better error handling and propagation

/**
 * Base error class for all application errors
 */
export class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Error thrown when a database operation fails
 */
export class DatabaseError extends AppError {
  constructor(message: string, public originalError?: Error) {
    super(message);
    this.name = 'DatabaseError';
    Object.setPrototypeOf(this, DatabaseError.prototype);
  }
}

/**
 * Error thrown when a requested resource is not found
 */
export class NotFoundError extends AppError {
  constructor(resource: string, identifier?: string) {
    const message = identifier 
      ? `${resource} with identifier ${identifier} not found` 
      : `${resource} not found`;
    super(message);
    this.name = 'NotFoundError';
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * Error thrown when input validation fails
 */
export class ValidationError extends AppError {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Error thrown when authentication fails
 */
export class AuthenticationError extends AppError {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

/**
 * Error thrown when a user doesn't have permission for an operation
 */
export class AuthorizationError extends AppError {
  constructor(message: string) {
    super(message);
    this.name = 'AuthorizationError';
    Object.setPrototypeOf(this, AuthorizationError.prototype);
  }
}

/**
 * Error thrown when a file operation fails
 */
export class FileOperationError extends AppError {
  constructor(message: string, public originalError?: Error) {
    super(message);
    this.name = 'FileOperationError';
    Object.setPrototypeOf(this, FileOperationError.prototype);
  }
}

/**
 * Error thrown when an external service call fails
 */
export class ExternalServiceError extends AppError {
  constructor(service: string, message: string, public originalError?: Error) {
    super(`${service} service error: ${message}`);
    this.name = 'ExternalServiceError';
    Object.setPrototypeOf(this, ExternalServiceError.prototype);
  }
}

/**
 * Error thrown when a configuration issue is detected
 */
export class ConfigurationError extends AppError {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigurationError';
    Object.setPrototypeOf(this, ConfigurationError.prototype);
  }
}