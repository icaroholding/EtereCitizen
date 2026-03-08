export interface VerifiableCredential {
  '@context': string[];
  id: string;
  type: string[];
  issuer: string | { id: string; [key: string]: unknown };
  issuanceDate: string;
  expirationDate?: string;
  credentialSubject: Record<string, unknown>;
  proof?: CredentialProof;
}

export interface CredentialProof {
  type: string;
  created: string;
  verificationMethod: string;
  proofPurpose: string;
  jws?: string;
  proofValue?: string;
}

export interface BirthCertificateCredential extends VerifiableCredential {
  type: ['VerifiableCredential', 'EtereCitizenBirthCertificate'];
  credentialSubject: {
    id: string;
    name: string;
    createdAt: string;
    network: string;
    protocolVersion: string;
    creatorDID?: string;
  };
}

export interface CapabilityCredential extends VerifiableCredential {
  type: ['VerifiableCredential', 'EtereCitizenCapability'];
  credentialSubject: {
    id: string;
    capability: string;
    category: string;
    attestedBy?: string;
    attestedAt?: string;
  };
}

export interface WalletOwnershipCredential extends VerifiableCredential {
  type: ['VerifiableCredential', 'EtereCitizenWalletOwnership'];
  credentialSubject: {
    id: string;
    walletProvider: string;
    connectedAt: string;
    challengeHash: string;
  };
}

export interface WorkHistoryCredential extends VerifiableCredential {
  type: ['VerifiableCredential', 'EtereCitizenWorkHistory'];
  credentialSubject: {
    id: string;
    taskDescription: string;
    category: string;
    rating: number;
    transactionHash: string;
    completedAt: string;
    reviewerDID: string;
    comment?: string;
  };
}

export interface CreatorVerificationCredential extends VerifiableCredential {
  type: ['VerifiableCredential', 'EtereCitizenCreatorVerification'];
  credentialSubject: {
    id: string;
    creatorDID: string;
    verificationLevel: number;
    verifiedAt: string;
    verificationMethod: string;
  };
}

export interface ComplianceCredential extends VerifiableCredential {
  type: ['VerifiableCredential', 'EtereCitizenCompliance'];
  credentialSubject: {
    id: string;
    standard: string;
    issuedBy: string;
    validUntil: string;
    scope: string;
  };
}

export interface ReviewCredential extends VerifiableCredential {
  type: ['VerifiableCredential', 'EtereCitizenReview'];
  credentialSubject: {
    id: string;
    reviewerDID: string;
    reviewedDID: string;
    transactionHash: string;
    category: string;
    rating: number;
    comment?: string;
    completedAt: string;
  };
}

export interface VerifiablePresentation {
  '@context': string[];
  type: ['VerifiablePresentation'];
  holder: string;
  verifiableCredential: VerifiableCredential[];
  proof?: CredentialProof;
}
