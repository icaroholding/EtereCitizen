import { describe, it, expect } from 'vitest';
import { detectAntifraudFlags } from '../src/reputation/antifraud.js';
import type { Review } from '@eterecitizen/common';

function makeReview(overrides: Partial<Review> = {}): Review {
  return {
    reviewHash: '0xabc',
    reviewerDID: 'did:ethr:0x14a34:0x1111111111111111111111111111111111111111',
    reviewedDID: 'did:ethr:0x14a34:0x2222222222222222222222222222222222222222',
    transactionHash: '0xdef',
    category: 'code-generation',
    rating: 5,
    timestamp: new Date().toISOString(),
    ...overrides,
  };
}

describe('antifraud', () => {
  it('should return clean flags for empty reviews', () => {
    const flags = detectAntifraudFlags([]);
    expect(flags.isCluster).toBe(false);
    expect(flags.isReciprocal).toBe(false);
    expect(flags.isBurst).toBe(false);
    expect(flags.suspicionScore).toBe(0);
  });

  it('should return clean flags for normal reviews', () => {
    const reviews = [
      makeReview({ timestamp: '2026-01-01T10:00:00Z' }),
      makeReview({
        reviewerDID: 'did:ethr:0x14a34:0x3333333333333333333333333333333333333333',
        timestamp: '2026-01-02T10:00:00Z',
      }),
    ];
    const flags = detectAntifraudFlags(reviews);
    expect(flags.isBurst).toBe(false);
    expect(flags.isCluster).toBe(false);
    expect(flags.isReciprocal).toBe(false);
    expect(flags.suspicionScore).toBe(0);
  });

  describe('burst detection', () => {
    it('should detect burst when same reviewer submits 5+ reviews in 24h', () => {
      const baseTime = new Date('2026-03-01T12:00:00Z').getTime();
      const reviewer = 'did:ethr:0x14a34:0x1111111111111111111111111111111111111111';
      const reviews: Review[] = [];
      for (let i = 0; i < 5; i++) {
        reviews.push(
          makeReview({
            reviewerDID: reviewer,
            reviewedDID: `did:ethr:0x14a34:0x${(i + 2).toString().padStart(40, '0')}`,
            timestamp: new Date(baseTime + i * 60 * 1000).toISOString(), // 1 min apart
          }),
        );
      }
      const flags = detectAntifraudFlags(reviews);
      expect(flags.isBurst).toBe(true);
      expect(flags.suspicionScore).toBeGreaterThan(0);
    });

    it('should not detect burst when reviews are spread over days', () => {
      const reviewer = 'did:ethr:0x14a34:0x1111111111111111111111111111111111111111';
      const reviews: Review[] = [];
      for (let i = 0; i < 5; i++) {
        reviews.push(
          makeReview({
            reviewerDID: reviewer,
            reviewedDID: `did:ethr:0x14a34:0x${(i + 2).toString().padStart(40, '0')}`,
            timestamp: new Date(Date.now() - i * 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days apart
          }),
        );
      }
      const flags = detectAntifraudFlags(reviews);
      expect(flags.isBurst).toBe(false);
    });
  });

  describe('cluster detection', () => {
    it('should detect cluster when 3+ reviews arrive within 1 hour', () => {
      const baseTime = new Date('2026-03-01T12:00:00Z').getTime();
      const reviews: Review[] = [];
      for (let i = 0; i < 3; i++) {
        reviews.push(
          makeReview({
            reviewerDID: `did:ethr:0x14a34:0x${(i + 1).toString().padStart(40, '0')}`,
            timestamp: new Date(baseTime + i * 10 * 60 * 1000).toISOString(), // 10 min apart
          }),
        );
      }
      const flags = detectAntifraudFlags(reviews);
      expect(flags.isCluster).toBe(true);
    });

    it('should not detect cluster when reviews are hours apart', () => {
      const reviews: Review[] = [];
      for (let i = 0; i < 3; i++) {
        reviews.push(
          makeReview({
            reviewerDID: `did:ethr:0x14a34:0x${(i + 1).toString().padStart(40, '0')}`,
            timestamp: new Date(Date.now() - i * 3 * 60 * 60 * 1000).toISOString(), // 3h apart
          }),
        );
      }
      const flags = detectAntifraudFlags(reviews);
      expect(flags.isCluster).toBe(false);
    });
  });

  describe('reciprocal detection', () => {
    it('should detect reciprocal reviews (A→B and B→A)', () => {
      const didA = 'did:ethr:0x14a34:0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
      const didB = 'did:ethr:0x14a34:0xBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB';
      const reviews: Review[] = [
        makeReview({
          reviewerDID: didA,
          reviewedDID: didB,
          timestamp: '2026-01-01T10:00:00Z',
        }),
        makeReview({
          reviewerDID: didB,
          reviewedDID: didA,
          timestamp: '2026-01-02T10:00:00Z',
        }),
      ];
      const flags = detectAntifraudFlags(reviews);
      expect(flags.isReciprocal).toBe(true);
      expect(flags.suspicionScore).toBeGreaterThanOrEqual(0.4);
    });

    it('should not flag one-directional reviews', () => {
      const didA = 'did:ethr:0x14a34:0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
      const didB = 'did:ethr:0x14a34:0xBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB';
      const didC = 'did:ethr:0x14a34:0xCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC';
      const reviews: Review[] = [
        makeReview({ reviewerDID: didA, reviewedDID: didB }),
        makeReview({ reviewerDID: didC, reviewedDID: didB }),
      ];
      const flags = detectAntifraudFlags(reviews);
      expect(flags.isReciprocal).toBe(false);
    });
  });

  describe('suspicion score', () => {
    it('should cap suspicion score at 1.0', () => {
      const baseTime = new Date('2026-03-01T12:00:00Z').getTime();
      const didA = 'did:ethr:0x14a34:0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
      const didB = 'did:ethr:0x14a34:0xBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB';

      // Create a scenario with burst + cluster + reciprocal
      const reviews: Review[] = [];
      // 5 reviews from didA in burst + cluster
      for (let i = 0; i < 5; i++) {
        reviews.push(
          makeReview({
            reviewerDID: didA,
            reviewedDID: `did:ethr:0x14a34:0x${(i + 3).toString().padStart(40, '0')}`,
            timestamp: new Date(baseTime + i * 60 * 1000).toISOString(),
          }),
        );
      }
      // Add reciprocal
      reviews.push(
        makeReview({
          reviewerDID: didB,
          reviewedDID: didA,
          timestamp: new Date(baseTime + 6 * 60 * 1000).toISOString(),
        }),
      );
      reviews.push(
        makeReview({
          reviewerDID: didA,
          reviewedDID: didB,
          timestamp: new Date(baseTime + 7 * 60 * 1000).toISOString(),
        }),
      );

      const flags = detectAntifraudFlags(reviews);
      expect(flags.suspicionScore).toBeLessThanOrEqual(1.0);
    });
  });
});
