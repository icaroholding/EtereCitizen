import { describe, it, expect } from 'vitest';
import {
  ethereumAddressSchema,
  didSchema,
  transactionHashSchema,
  ratingSchema,
} from '../src/utils/validation.js';

describe('validation schemas', () => {
  describe('ethereumAddressSchema', () => {
    it('should accept valid address', () => {
      const result = ethereumAddressSchema.safeParse('0x1234567890abcdef1234567890abcdef12345678');
      expect(result.success).toBe(true);
    });

    it('should reject invalid address', () => {
      expect(ethereumAddressSchema.safeParse('0x123').success).toBe(false);
      expect(ethereumAddressSchema.safeParse('not-an-address').success).toBe(false);
    });
  });

  describe('didSchema', () => {
    it('should accept valid DID', () => {
      const result = didSchema.safeParse(
        'did:ethr:0x14a34:0x1234567890abcdef1234567890abcdef12345678',
      );
      expect(result.success).toBe(true);
    });

    it('should reject invalid DID', () => {
      expect(didSchema.safeParse('not-a-did').success).toBe(false);
    });
  });

  describe('transactionHashSchema', () => {
    it('should accept valid tx hash', () => {
      const hash = '0x' + 'a'.repeat(64);
      const result = transactionHashSchema.safeParse(hash);
      expect(result.success).toBe(true);
    });

    it('should reject short hash', () => {
      expect(transactionHashSchema.safeParse('0x123').success).toBe(false);
    });
  });

  describe('ratingSchema', () => {
    it('should accept ratings 1-5', () => {
      for (let i = 1; i <= 5; i++) {
        expect(ratingSchema.safeParse(i).success).toBe(true);
      }
    });

    it('should reject out of range', () => {
      expect(ratingSchema.safeParse(0).success).toBe(false);
      expect(ratingSchema.safeParse(6).success).toBe(false);
    });
  });
});
