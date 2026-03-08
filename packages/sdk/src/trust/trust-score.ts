import type { TrustResult } from '@eterecitizen/common';
import { VerificationLevel } from '@eterecitizen/common';

const WEIGHTS = {
  reputation: 0.4,
  verificationLevel: 0.25,
  agentAge: 0.15,
  reviewCount: 0.1,
  walletConnected: 0.1,
};

export function calculateTrustScore(result: TrustResult): number {
  if (!result.verified) return 0;

  let score = 0;

  // Reputation (0-5 normalized to 0-1)
  score += (result.reputationScore / 5) * WEIGHTS.reputation;

  // Verification level (0-3 normalized to 0-1)
  score += (result.verificationLevel / 3) * WEIGHTS.verificationLevel;

  // Agent age (capped at 365 days for normalization)
  const ageScore = Math.min(result.agentAge / 365, 1);
  score += ageScore * WEIGHTS.agentAge;

  // Review count (logarithmic, capped at 100)
  const reviewScore = Math.min(Math.log10(result.reviewCount + 1) / 2, 1);
  score += reviewScore * WEIGHTS.reviewCount;

  // Wallet connected (binary)
  score += (result.walletConnected ? 1 : 0) * WEIGHTS.walletConnected;

  // Penalty for flags
  if (result.flags.includes('NEW_AGENT')) score *= 0.9;
  if (result.flags.includes('NO_REVIEWS')) score *= 0.85;
  if (result.antifraud && result.antifraud.suspicionScore > 0.5) {
    score *= 1 - result.antifraud.suspicionScore * 0.5;
  }

  return Math.max(0, Math.min(1, score));
}
