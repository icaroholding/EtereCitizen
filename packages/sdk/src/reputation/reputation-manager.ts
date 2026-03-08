import type { ReputationScore, CategoryRating, Review, TemporalDecayConfig } from '@eterecitizen/common';
import { DEFAULT_TEMPORAL_DECAY, didToAddress } from '@eterecitizen/common';
import { calculateDecayedScore } from './temporal-decay.js';
import { detectAntifraudFlags } from './antifraud.js';
import type { ContractClients } from '../blockchain/contract-clients.js';

export class ReputationManager {
  private contracts: ContractClients;
  private decayConfig: TemporalDecayConfig;

  constructor(contracts: ContractClients, decayConfig?: TemporalDecayConfig) {
    this.contracts = contracts;
    this.decayConfig = decayConfig || DEFAULT_TEMPORAL_DECAY;
  }

  async getReputationScore(did: string): Promise<ReputationScore> {
    const address = didToAddress(did) as `0x${string}` | null;
    if (!address) throw new Error(`Invalid DID: ${did}`);

    const reviewCount = await this.contracts.reputation.getReviewCount(address);
    const totalTasks = await this.contracts.reputation.getTotalTasksCompleted(address);
    const reviews = await this.contracts.reputation.getReviews(address, 0n, BigInt(reviewCount));

    const reviewsByCategory = new Map<string, Array<{ rating: number; timestamp: Date }>>();
    let lastActivityAt: string | undefined;

    for (const review of reviews) {
      const category = review.category;
      const entries = reviewsByCategory.get(category) || [];
      entries.push({
        rating: Number(review.rating),
        timestamp: new Date(Number(review.timestamp) * 1000),
      });
      reviewsByCategory.set(category, entries);

      const ts = new Date(Number(review.timestamp) * 1000).toISOString();
      if (!lastActivityAt || ts > lastActivityAt) {
        lastActivityAt = ts;
      }
    }

    const categoryRatings: CategoryRating[] = [];
    let overallWeightedSum = 0;
    let overallCount = 0;

    for (const [category, categoryReviews] of reviewsByCategory) {
      const rawTotal = categoryReviews.reduce((sum, r) => sum + r.rating, 0);
      const rawScore = rawTotal / categoryReviews.length;
      const decayedScore = calculateDecayedScore(categoryReviews, this.decayConfig);

      categoryRatings.push({
        category,
        rawScore,
        decayedScore,
        reviewCount: categoryReviews.length,
        lastReviewAt: categoryReviews
          .map((r) => r.timestamp.toISOString())
          .sort()
          .pop(),
      });

      overallWeightedSum += decayedScore * categoryReviews.length;
      overallCount += categoryReviews.length;
    }

    return {
      did,
      overallScore: overallCount > 0 ? overallWeightedSum / overallCount : 0,
      categoryRatings,
      totalReviews: Number(reviewCount),
      totalTasksCompleted: Number(totalTasks),
      lastActivityAt,
    };
  }

  async getReviews(did: string, offset = 0, limit = 50): Promise<Review[]> {
    const address = didToAddress(did) as `0x${string}` | null;
    if (!address) throw new Error(`Invalid DID: ${did}`);

    const onChainReviews = await this.contracts.reputation.getReviews(
      address,
      BigInt(offset),
      BigInt(limit),
    );

    return onChainReviews.map((r) => ({
      reviewHash: r.reviewHash,
      reviewerDID: '', // Would need reverse lookup from address to DID
      reviewedDID: did,
      transactionHash: r.txHash,
      category: r.category,
      rating: Number(r.rating),
      timestamp: new Date(Number(r.timestamp) * 1000).toISOString(),
    }));
  }
}
