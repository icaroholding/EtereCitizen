// Types
export type {
  VerificationMethod,
  ServiceEndpoint,
  AgentDIDDocument,
  DIDResolutionResult,
  DIDCreateOptions,
  DIDUpdateOptions,
} from './types/did.js';

export type {
  VerifiableCredential,
  CredentialProof,
  BirthCertificateCredential,
  CapabilityCredential,
  WalletOwnershipCredential,
  WorkHistoryCredential,
  CreatorVerificationCredential,
  ComplianceCredential,
  ReviewCredential,
  VerifiablePresentation,
} from './types/vc.js';

export type {
  AgentProfile,
  AgentConfig,
  QuickStartConfig,
  AgentExport,
  AgentCapability,
  PresentationOptions,
  WalletInfo,
} from './types/agent.js';
export { type AgentStatus } from './types/agent.js';

export {
  WalletProvider,
  type WalletAdapter,
  type WalletConfig,
  type PaymentRequest,
  type PaymentResponse,
  type ChallengeMessage,
} from './types/wallet.js';

export {
  type ReputationScore,
  type CategoryRating,
  type Review,
  type ReviewInput,
  type ReviewConstraints,
  type TemporalDecayConfig,
  type AntifraudFlags,
  DEFAULT_TEMPORAL_DECAY,
  DEFAULT_REVIEW_CONSTRAINTS,
} from './types/reputation.js';

export {
  VerificationLevel,
  type TrustResult,
  type VerificationRequest,
  type PresentationConfig,
} from './types/trust.js';

export type {
  AgentRegistryEntry,
  SearchFilters,
  SearchResult,
} from './types/registry.js';

export type { IdentityCardData } from './types/identity-card.js';

// Schemas
export {
  DID_DOCUMENT_CONTEXT,
  ETERECITIZEN_SERVICE_TYPE,
  ETERECITIZEN_METADATA_SERVICE_TYPE,
  createAgentDIDDocumentTemplate,
} from './schemas/did-document.schema.js';

export {
  BIRTH_CERTIFICATE_CONTEXT,
  BIRTH_CERTIFICATE_TYPE,
  createBirthCertificateTemplate,
} from './schemas/vc-birth-certificate.js';

export {
  CAPABILITY_CONTEXT,
  CAPABILITY_TYPE,
  createCapabilityTemplate,
} from './schemas/vc-capability.js';

export {
  WALLET_OWNERSHIP_CONTEXT,
  WALLET_OWNERSHIP_TYPE,
  createWalletOwnershipTemplate,
} from './schemas/vc-wallet-ownership.js';

export {
  WORK_HISTORY_CONTEXT,
  WORK_HISTORY_TYPE,
  createWorkHistoryTemplate,
} from './schemas/vc-work-history.js';

export {
  CREATOR_VERIFICATION_CONTEXT,
  CREATOR_VERIFICATION_TYPE,
  createCreatorVerificationTemplate,
} from './schemas/vc-creator-verification.js';

export {
  COMPLIANCE_CONTEXT,
  COMPLIANCE_TYPE,
  createComplianceTemplate,
} from './schemas/vc-compliance.js';

// Constants
export {
  NETWORKS,
  type NetworkName,
  DEFAULT_NETWORK,
  BASE_CHAIN_ID,
  BASE_SEPOLIA_CHAIN_ID,
  DID_METHOD_PREFIX,
  getDIDPrefix,
} from './constants/networks.js';

export {
  SERVICE_CATEGORIES,
  type ServiceCategory,
  CATEGORY_DESCRIPTIONS,
} from './constants/categories.js';

export {
  VERIFICATION_LEVEL_DESCRIPTIONS,
  VERIFICATION_LEVEL_LABELS,
  VERIFICATION_LEVEL_COLORS,
} from './constants/verification-levels.js';

// Utils
export {
  addressToDID,
  didToAddress,
  didToNetwork,
  isValidDID,
  isValidEthereumAddress,
  shortenDID,
} from './utils/did-utils.js';

export {
  ethereumAddressSchema,
  didSchema,
  transactionHashSchema,
  categorySchema,
  ratingSchema,
  agentConfigSchema,
  walletConfigSchema,
  reviewInputSchema,
  searchFiltersSchema,
  paymentRequestSchema,
} from './utils/validation.js';

// Errors
export {
  EtereCitizenError,
  IdentityError,
  CredentialError,
  ContractError,
  StorageError,
  NetworkError,
  ValidationError,
  TimeoutError,
} from './errors.js';
