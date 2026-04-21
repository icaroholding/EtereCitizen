import { describe, it, expect } from 'vitest';
import { addressToDID, didToAddress, didToNetwork, isValidDID } from '@eterecitizen/common';
import { calculateTrustScore } from '../../sdk/src/trust/trust-score.js';
import { calculateDecayWeight, calculateDecayedScore } from '../../sdk/src/reputation/temporal-decay.js';
import { detectAntifraudFlags } from '../../sdk/src/reputation/antifraud.js';
import { challengeToMessage } from '../../sdk/src/wallet/challenge.js';
import { runConformance, type ConformanceAdapter } from '../src/index.js';

const adapter: ConformanceAdapter = {
  name: '@eterecitizen/sdk (reference)',

  isValidDID,
  didToAddress,
  didToNetwork,
  addressToDID: (address, network) => addressToDID(address, network as any),

  calculateTrustScore: (input) =>
    calculateTrustScore({
      did: 'did:ethr:0x14a34:0x0000000000000000000000000000000000000000',
      categoryRatings: [],
      ...input,
    } as any),

  calculateDecayWeight: (ageDays, halfLifeDays, minWeight) => {
    const now = Date.now();
    const ts = new Date(now - ageDays * 86_400_000);
    return calculateDecayWeight(ts, { halfLifeDays, minWeight });
  },

  calculateDecayedScore: (reviews, halfLifeDays, minWeight) => {
    const now = Date.now();
    const asReview = reviews.map((r) => ({
      rating: r.rating,
      timestamp: new Date(now - r.ageDays * 86_400_000),
    }));
    return calculateDecayedScore(asReview, { halfLifeDays, minWeight });
  },

  detectAntifraudFlags: (reviews) =>
    detectAntifraudFlags(
      reviews.map((r) => ({
        id: '',
        reviewerDID: r.reviewerDID,
        reviewedDID: r.reviewedDID,
        timestamp: r.timestamp,
        rating: r.rating,
        category: r.category,
        transactionHash: '',
      })) as any,
    ),

  challengeToMessage,
};

describe('reference adapter conformance', () => {
  const report = runConformance(adapter);

  it('runs every published vector', () => {
    expect(report.summary.total).toBeGreaterThan(0);
    expect(report.summary.skipped).toBe(0);
  });

  for (const r of report.results) {
    const label = `[${r.vectorPath.split('test-vectors/')[1] ?? r.vectorPath}] ${r.description}`;
    it(label, () => {
      if (!r.passed) throw new Error(r.error ?? 'failed');
    });
  }
});
