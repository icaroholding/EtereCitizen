import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  generateChallenge,
  challengeToMessage,
  isChallengeExpired,
} from '../src/wallet/challenge.js';

describe('challenge', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('generateChallenge', () => {
    it('should create a valid challenge with all fields', () => {
      const address = '0x1234567890abcdef1234567890abcdef12345678';
      const chainId = 84532;
      const challenge = generateChallenge(address, chainId);

      expect(challenge.domain).toBe('eterecitizen.ai');
      expect(challenge.address).toBe(address);
      expect(challenge.chainId).toBe(chainId);
      expect(challenge.nonce).toHaveLength(32); // 16 random bytes → 32 hex chars
      expect(challenge.statement).toContain('EtereCitizen');
      expect(challenge.issuedAt).toBeTruthy();
      expect(challenge.expiresAt).toBeTruthy();
    });

    it('should set expiry 5 minutes from now', () => {
      const challenge = generateChallenge('0x1234567890abcdef1234567890abcdef12345678', 84532);
      const issued = new Date(challenge.issuedAt).getTime();
      const expires = new Date(challenge.expiresAt).getTime();
      const diffMs = expires - issued;
      expect(diffMs).toBe(5 * 60 * 1000);
    });

    it('should generate unique nonces', () => {
      const c1 = generateChallenge('0x1234567890abcdef1234567890abcdef12345678', 84532);
      const c2 = generateChallenge('0x1234567890abcdef1234567890abcdef12345678', 84532);
      expect(c1.nonce).not.toBe(c2.nonce);
    });
  });

  describe('challengeToMessage', () => {
    it('should format challenge as SIWE-like message', () => {
      const challenge = generateChallenge('0xAbCdEf1234567890aBcDeF1234567890AbCdEf12', 84532);
      const message = challengeToMessage(challenge);

      expect(message).toContain('eterecitizen.ai wants you to sign in');
      expect(message).toContain('0xAbCdEf1234567890aBcDeF1234567890AbCdEf12');
      expect(message).toContain('Chain ID: 84532');
      expect(message).toContain(`Nonce: ${challenge.nonce}`);
      expect(message).toContain('Issued At:');
      expect(message).toContain('Expiration Time:');
    });
  });

  describe('isChallengeExpired', () => {
    it('should return false for a fresh challenge', () => {
      const challenge = generateChallenge('0x1234567890abcdef1234567890abcdef12345678', 84532);
      expect(isChallengeExpired(challenge)).toBe(false);
    });

    it('should return true for an expired challenge', () => {
      const pastDate = new Date(Date.now() - 10 * 60 * 1000); // 10 min ago
      const challenge = {
        domain: 'eterecitizen.ai',
        address: '0x1234567890abcdef1234567890abcdef12345678',
        statement: 'test',
        nonce: 'abc',
        issuedAt: new Date(pastDate.getTime() - 5 * 60 * 1000).toISOString(),
        expiresAt: pastDate.toISOString(), // already passed
        chainId: 84532,
      };
      expect(isChallengeExpired(challenge)).toBe(true);
    });
  });
});
