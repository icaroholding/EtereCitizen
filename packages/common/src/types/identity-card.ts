import type { AgentCapability } from './agent.js';
import type { CategoryRating } from './reputation.js';
import type { VerificationLevel } from './trust.js';

export interface IdentityCardData {
  did: string;
  name: string;
  description?: string;
  verificationLevel: VerificationLevel;
  capabilities: AgentCapability[];
  categoryRatings: CategoryRating[];
  overallScore: number;
  totalReviews: number;
  totalTasksCompleted: number;
  walletConnected: boolean;
  createdAt: string;
  lastActivityAt?: string;
  creatorDID?: string;
  status: string;
}
