import { describe, it, expect, vi, afterEach } from 'vitest';
import { calculateDecayWeight, calculateDecayedScore } from '../src/reputation/temporal-decay.js';

describe('temporal-decay', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('calculateDecayWeight', () => {
    it('should return ~1.0 for a review from right now', () => {
      const weight = calculateDecayWeight(new Date());
      expect(weight).toBeGreaterThan(0.99);
      expect(weight).toBeLessThanOrEqual(1);
    });

    it('should return ~0.5 for a review at half-life (90 days)', () => {
      const now = Date.now();
      vi.spyOn(Date, 'now').mockReturnValue(now);

      const ninetyDaysAgo = new Date(now - 90 * 24 * 60 * 60 * 1000);
      const weight = calculateDecayWeight(ninetyDaysAgo);
      expect(weight).toBeCloseTo(0.5, 1);
    });

    it('should return ~0.25 for a review at 2x half-life (180 days)', () => {
      const now = Date.now();
      vi.spyOn(Date, 'now').mockReturnValue(now);

      const oneEightyDaysAgo = new Date(now - 180 * 24 * 60 * 60 * 1000);
      const weight = calculateDecayWeight(oneEightyDaysAgo);
      expect(weight).toBeCloseTo(0.25, 1);
    });

    it('should never go below minWeight', () => {
      const veryOld = new Date(0); // 1970
      const weight = calculateDecayWeight(veryOld);
      expect(weight).toBe(0.1); // default minWeight
    });

    it('should respect custom config', () => {
      const now = Date.now();
      vi.spyOn(Date, 'now').mockReturnValue(now);

      const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
      const weight = calculateDecayWeight(thirtyDaysAgo, {
        halfLifeDays: 30,
        minWeight: 0.05,
      });
      expect(weight).toBeCloseTo(0.5, 1);
    });
  });

  describe('calculateDecayedScore', () => {
    it('should return 0 for empty reviews', () => {
      expect(calculateDecayedScore([])).toBe(0);
    });

    it('should return the exact rating for a single recent review', () => {
      const score = calculateDecayedScore([{ rating: 4, timestamp: new Date() }]);
      expect(score).toBeCloseTo(4, 0);
    });

    it('should weight recent reviews higher', () => {
      const now = Date.now();
      vi.spyOn(Date, 'now').mockReturnValue(now);

      const reviews = [
        { rating: 5, timestamp: new Date(now) }, // now, weight ~1
        { rating: 1, timestamp: new Date(now - 180 * 24 * 60 * 60 * 1000) }, // 180d ago, weight ~0.25
      ];
      const score = calculateDecayedScore(reviews);
      // Weighted avg: (5*1 + 1*0.25) / (1+0.25) = 5.25/1.25 = 4.2
      expect(score).toBeGreaterThan(4);
      expect(score).toBeLessThan(5);
    });

    it('should return average when all reviews are from the same time', () => {
      const now = new Date();
      const reviews = [
        { rating: 5, timestamp: now },
        { rating: 3, timestamp: now },
        { rating: 4, timestamp: now },
      ];
      const score = calculateDecayedScore(reviews);
      expect(score).toBeCloseTo(4, 0);
    });
  });
});
