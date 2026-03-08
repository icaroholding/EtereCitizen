import type { VerifiableCredential } from './vc.js';

export type AgentStatus = 'active' | 'inactive' | 'suspended';

export interface AgentCapability {
  name: string;
  category: string;
  attestedBy?: string;
  attestedAt?: string;
}

export interface AgentProfile {
  did: string;
  name: string;
  description?: string;
  capabilities: AgentCapability[];
  status: AgentStatus;
  createdAt: string;
  updatedAt?: string;
  verificationLevel: number;
  walletConnected: boolean;
  creatorDID?: string;
}

export interface AgentConfig {
  name: string;
  description?: string;
  capabilities?: string[];
  network?: 'base' | 'base-sepolia';
  creatorDID?: string;
}

export interface QuickStartConfig extends AgentConfig {
  wallet?: {
    provider: string;
    privateKey?: string;
    apiKey?: string;
    network?: string;
  };
}

export interface AgentExport {
  version: string;
  did: string;
  profile: AgentProfile;
  credentials: VerifiableCredential[];
  exportedAt: string;
}

export interface PresentationOptions {
  fields?: string[];
  recipientDID?: string;
  includeReputation?: boolean;
}

export interface WalletInfo {
  provider: string;
  connected: boolean;
  connectedAt: string;
}
