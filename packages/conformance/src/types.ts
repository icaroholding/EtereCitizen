export interface DidParsingAdapter {
  isValidDID(did: string): boolean;
  didToAddress(did: string): string | null;
  didToNetwork(did: string): string | null;
  addressToDID(address: string, network: string): string;
}

export interface TrustInput {
  verified: boolean;
  reputationScore: number;
  verificationLevel: number;
  agentAge: number;
  reviewCount: number;
  walletConnected: boolean;
  flags: string[];
  antifraud: {
    isBurst: boolean;
    isCluster: boolean;
    isReciprocal: boolean;
    suspicionScore: number;
  } | null;
}

export interface TrustScoreAdapter {
  calculateTrustScore(input: TrustInput): number;
}

export interface TemporalDecayReview {
  rating: number;
  ageDays: number;
}

export interface TemporalDecayAdapter {
  calculateDecayWeight(ageDays: number, halfLifeDays: number, minWeight: number): number;
  calculateDecayedScore(
    reviews: TemporalDecayReview[],
    halfLifeDays: number,
    minWeight: number,
  ): number;
}

export interface AntifraudReview {
  reviewerDID: string;
  reviewedDID: string;
  timestamp: string;
  rating: number;
  category: string;
}

export interface AntifraudFlags {
  isBurst: boolean;
  isCluster: boolean;
  isReciprocal: boolean;
  suspicionScore: number;
}

export interface AntifraudAdapter {
  detectAntifraudFlags(reviews: AntifraudReview[]): AntifraudFlags;
}

export interface ChallengeMessage {
  domain: string;
  address: string;
  statement: string;
  nonce: string;
  issuedAt: string;
  expiresAt: string;
  chainId: number;
}

export interface ChallengeSerializationAdapter {
  challengeToMessage(challenge: ChallengeMessage): string;
}

/**
 * Composite adapter. An implementation claiming full `core` conformance
 * provides all five sub-adapters.
 */
export interface ConformanceAdapter
  extends Partial<
    DidParsingAdapter &
      TrustScoreAdapter &
      TemporalDecayAdapter &
      AntifraudAdapter &
      ChallengeSerializationAdapter
  > {
  /** Human-readable name shown in test output. */
  name: string;
}

export interface VectorResult {
  vectorPath: string;
  description: string;
  passed: boolean;
  error?: string;
}

export interface ConformanceReport {
  adapter: string;
  results: VectorResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
  };
}
