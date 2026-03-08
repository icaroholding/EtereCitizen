export interface VerificationMethod {
  id: string;
  type: string;
  controller: string;
  blockchainAccountId?: string;
  publicKeyHex?: string;
  publicKeyJwk?: Record<string, unknown>;
  publicKeyMultibase?: string;
}

export interface ServiceEndpoint {
  id: string;
  type: string;
  serviceEndpoint: string | Record<string, unknown>;
  description?: string;
}

export interface AgentDIDDocument {
  '@context': string[];
  id: string;
  controller?: string | string[];
  verificationMethod: VerificationMethod[];
  authentication: string[];
  assertionMethod: string[];
  service: ServiceEndpoint[];
  created?: string;
  updated?: string;
}

export interface DIDResolutionResult {
  didDocument: AgentDIDDocument | null;
  didResolutionMetadata: {
    contentType?: string;
    error?: string;
    message?: string;
  };
  didDocumentMetadata: {
    created?: string;
    updated?: string;
    deactivated?: boolean;
    versionId?: string;
  };
}

export interface DIDCreateOptions {
  network?: 'base' | 'base-sepolia';
  alias?: string;
}

export interface DIDUpdateOptions {
  services?: ServiceEndpoint[];
  addDelegates?: string[];
  removeDelegates?: string[];
}
