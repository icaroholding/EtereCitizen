import { describe, it, expect } from 'vitest';
import { calculateTrustScore } from '../src/trust/trust-score.js';
import { VerificationLevel, type TrustResult } from '@eterecitizen/common';

function makeResult(overrides: Partial<TrustResult> = {}): TrustResult {
  return {
    did: 'did:ethr:0x14a34:0x1111111111111111111111111111111111111111',
    verified: true,
    verificationLevel: VerificationLevel.Unverified,
    identityValid: true,
    credentialsValid: true,
    reputationScore: 0,
    categoryRatings: [],
    reviewCount: 0,
    walletConnected: false,
    agentAge: 0,
    flags: [],
    checkedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('trust-score', () => {
  it('should return 0 for unverified agent', () => {
    const result = makeResult({ verified: false });
    expect(calculateTrustScore(result)).toBe(0);
  });

  it('should return > 0 for a verified agent with some reputation', () => {
    const result = makeResult({
      reputationScore: 4.5,
      verificationLevel: VerificationLevel.Domain,
      agentAge: 100,
      reviewCount: 10,
      walletConnected: true,
    });
    const score = calculateTrustScore(result);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThanOrEqual(1);
  });

  it('should give maximum score for perfect agent', () => {
    const result = makeResult({
      reputationScore: 5,
      verificationLevel: VerificationLevel.KYC,
      agentAge: 365,
      reviewCount: 100,
      walletConnected: true,
    });
    const score = calculateTrustScore(result);
    expect(score).toBeGreaterThan(0.9);
  });

  it('should apply penalty for NEW_AGENT flag', () => {
    const base = makeResult({
      reputationScore: 3,
      verificationLevel: VerificationLevel.Domain,
      agentAge: 30,
      reviewCount: 5,
      walletConnected: true,
    });

    const normal = calculateTrustScore(base);
    const flagged = calculateTrustScore({ ...base, flags: ['NEW_AGENT'] });
    expect(flagged).toBeLessThan(normal);
  });

  it('should apply penalty for NO_REVIEWS flag', () => {
    const base = makeResult({
      reputationScore: 3,
      verificationLevel: VerificationLevel.Domain,
      agentAge: 30,
      walletConnected: true,
    });

    const normal = calculateTrustScore(base);
    const flagged = calculateTrustScore({ ...base, flags: ['NO_REVIEWS'] });
    expect(flagged).toBeLessThan(normal);
  });

  it('should apply penalty for high antifraud suspicion', () => {
    const base = makeResult({
      reputationScore: 4,
      verificationLevel: VerificationLevel.Business,
      agentAge: 200,
      reviewCount: 50,
      walletConnected: true,
    });

    const clean = calculateTrustScore(base);
    const suspicious = calculateTrustScore({
      ...base,
      antifraud: {
        isCluster: true,
        isReciprocal: true,
        isBurst: false,
        suspicionScore: 0.8,
      },
    });
    expect(suspicious).toBeLessThan(clean);
  });

  it('should weight reputation most heavily (40%)', () => {
    const lowRep = calculateTrustScore(makeResult({ reputationScore: 1 }));
    const highRep = calculateTrustScore(makeResult({ reputationScore: 5 }));
    const diff = highRep - lowRep;
    // With 40% weight and 5-point scale, diff should be around 0.32
    expect(diff).toBeGreaterThan(0.25);
    expect(diff).toBeLessThan(0.45);
  });

  it('should clamp score between 0 and 1', () => {
    const score = calculateTrustScore(
      makeResult({
        reputationScore: 5,
        verificationLevel: VerificationLevel.KYC,
        agentAge: 9999,
        reviewCount: 99999,
        walletConnected: true,
      }),
    );
    expect(score).toBeLessThanOrEqual(1);
    expect(score).toBeGreaterThanOrEqual(0);
  });
});
