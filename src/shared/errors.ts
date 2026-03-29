export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly code: string,
    public readonly statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class AuthError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 'UNAUTHORIZED', 401);
    this.name = 'AuthError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

export class ConfigurationError extends AppError {
  constructor(message: string) {
    super(message, 'CONFIGURATION_ERROR', 500);
    this.name = 'ConfigurationError';
  }
}

export class CredentialNotConfiguredError extends AppError {
  constructor(message = 'Nomi key not configured.') {
    super(message, 'NOMI_KEY_NOT_CONFIGURED', 412);
    this.name = 'CredentialNotConfiguredError';
  }
}

export class CredentialRejectedError extends AppError {
  constructor(message = 'Reconnect or replace your Nomi key.') {
    super(message, 'NOMI_KEY_REJECTED', 401);
    this.name = 'CredentialRejectedError';
  }
}
