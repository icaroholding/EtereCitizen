import type { CategoryRating } from './reputation.js';
import type { AntifraudFlags } from './reputation.js';

export enum VerificationLevel {
  Unverified = 0,
  Domain = 1,
  Business = 2,
  KYC = 3,
}

export interface TrustResult {
  did: string;
  verified: boolean;
  verificationLevel: VerificationLevel;
  identityValid: boolean;
  credentialsValid: boolean;
  reputationScore: number;
  categoryRatings: CategoryRating[];
  reviewCount: number;
  walletConnected: boolean;
  agentAge: number;
  flags: string[];
  antifraud?: AntifraudFlags;
  checkedAt: string;
}

export interface VerificationRequest {
  did: string;
  requiredLevel?: VerificationLevel;
  requiredCategories?: string[];
  minRating?: number;
}

export interface PresentationConfig {
  fields: string[];
  recipientDID?: string;
  expiresIn?: number;
}
