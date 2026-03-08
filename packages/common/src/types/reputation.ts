export interface ReputationScore {
  did: string;
  overallScore: number;
  categoryRatings: CategoryRating[];
  totalReviews: number;
  totalTasksCompleted: number;
  lastActivityAt?: string;
}

export interface CategoryRating {
  category: string;
  rawScore: number;
  decayedScore: number;
  reviewCount: number;
  lastReviewAt?: string;
}

export interface Review {
  reviewHash: string;
  reviewerDID: string;
  reviewedDID: string;
  transactionHash: string;
  category: string;
  rating: number;
  comment?: string;
  timestamp: string;
  reviewerReputation?: number;
}

export interface ReviewInput {
  transactionHash: string;
  category: string;
  rating: number;
  comment?: string;
}

export interface ReviewConstraints {
  minRating: number;
  maxRating: number;
  requireTransaction: boolean;
  cooldownPeriod: number;
}

export interface TemporalDecayConfig {
  halfLifeDays: number;
  minWeight: number;
}

export interface AntifraudFlags {
  isCluster: boolean;
  isReciprocal: boolean;
  isBurst: boolean;
  suspicionScore: number;
  details?: string[];
}

export const DEFAULT_TEMPORAL_DECAY: TemporalDecayConfig = {
  halfLifeDays: 90,
  minWeight: 0.1,
};

export const DEFAULT_REVIEW_CONSTRAINTS: ReviewConstraints = {
  minRating: 1,
  maxRating: 5,
  requireTransaction: true,
  cooldownPeriod: 86400,
};
