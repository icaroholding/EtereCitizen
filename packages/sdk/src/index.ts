export { EtereCitizen, type EtereCitizenConfig } from './eterecitizen.js';
export { Agent } from './agent.js';

// Identity
export { DIDManager } from './identity/did-manager.js';
export { buildAgentDIDDocument } from './identity/did-document-builder.js';
export { IPFSStorage, type IPFSStorageConfig } from './identity/ipfs-storage.js';
export { initVeramoAgent, resetVeramoCache, type VeramoInitOptions } from './identity/veramo-init.js';

// Credentials
export { VCManager } from './credentials/vc-manager.js';
export { BirthCertificateManager } from './credentials/birth-certificate.js';
export { CapabilityManager } from './credentials/capability.js';
export { WalletOwnershipManager } from './credentials/wallet-ownership.js';
export { WorkHistoryManager } from './credentials/work-history.js';
export { CreatorVerificationManager } from './credentials/creator-verification.js';
export { PresentationManager } from './credentials/presentation.js';

// Wallet
export { createWalletAdapter } from './wallet/adapter-factory.js';
export { StandardWalletAdapter } from './wallet/adapters/standard.js';
export { CoinbaseCDPAdapter } from './wallet/adapters/coinbase-cdp.js';
export { OpenfortAdapter } from './wallet/adapters/openfort.js';
export { MoonPayAdapter } from './wallet/adapters/moonpay.js';
export { ConwayAdapter } from './wallet/adapters/conway.js';
export { generateChallenge, challengeToMessage, isChallengeExpired } from './wallet/challenge.js';

// Reputation
export { ReputationManager } from './reputation/reputation-manager.js';
export { ReviewManager } from './reputation/review-manager.js';
export { calculateDecayWeight, calculateDecayedScore } from './reputation/temporal-decay.js';
export { detectAntifraudFlags } from './reputation/antifraud.js';

// Trust
export { Verifier } from './trust/verifier.js';
export { calculateTrustScore } from './trust/trust-score.js';

// Registry
export { RegistryManager } from './registry/registry-manager.js';
export { ERC8004Client } from './registry/erc8004-client.js';

// Storage
export { SQLiteStore } from './storage/sqlite-store.js';
export { EncryptedStore } from './storage/encrypted-store.js';

// Blockchain
export { createBaseProvider } from './blockchain/base-provider.js';
export { createContractClients, type ContractClients } from './blockchain/contract-clients.js';

// Re-export common types for convenience
export * from '@eterecitizen/common';
