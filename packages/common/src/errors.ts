export class EtereCitizenError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'EtereCitizenError';
  }
}

export class IdentityError extends EtereCitizenError {
  constructor(message: string, cause?: unknown) {
    super(message, 'IDENTITY_ERROR', cause);
    this.name = 'IdentityError';
  }
}

export class CredentialError extends EtereCitizenError {
  constructor(message: string, cause?: unknown) {
    super(message, 'CREDENTIAL_ERROR', cause);
    this.name = 'CredentialError';
  }
}

export class ContractError extends EtereCitizenError {
  constructor(message: string, cause?: unknown) {
    super(message, 'CONTRACT_ERROR', cause);
    this.name = 'ContractError';
  }
}

export class StorageError extends EtereCitizenError {
  constructor(message: string, cause?: unknown) {
    super(message, 'STORAGE_ERROR', cause);
    this.name = 'StorageError';
  }
}

export class NetworkError extends EtereCitizenError {
  constructor(message: string, cause?: unknown) {
    super(message, 'NETWORK_ERROR', cause);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends EtereCitizenError {
  constructor(message: string, cause?: unknown) {
    super(message, 'VALIDATION_ERROR', cause);
    this.name = 'ValidationError';
  }
}

export class TimeoutError extends EtereCitizenError {
  constructor(message: string, cause?: unknown) {
    super(message, 'TIMEOUT_ERROR', cause);
    this.name = 'TimeoutError';
  }
}
