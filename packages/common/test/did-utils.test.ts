import { describe, it, expect } from 'vitest';
import {
  addressToDID,
  didToAddress,
  didToNetwork,
  isValidDID,
  isValidEthereumAddress,
  shortenDID,
} from '../src/utils/did-utils.js';

describe('did-utils', () => {
  const validAddress = '0x1234567890abcdef1234567890abcdef12345678';
  const validDID = 'did:ethr:0x14a34:0x1234567890abcdef1234567890abcdef12345678';

  describe('addressToDID', () => {
    it('should create DID for base-sepolia by default', () => {
      const did = addressToDID(validAddress);
      expect(did).toBe(`did:ethr:0x14a34:${validAddress}`);
    });

    it('should create DID for base mainnet', () => {
      const did = addressToDID(validAddress, 'base');
      expect(did).toBe(`did:ethr:0x2105:${validAddress}`);
    });
  });

  describe('didToAddress', () => {
    it('should extract address from valid DID', () => {
      const address = didToAddress(validDID);
      expect(address).toBe(validAddress);
    });

    it('should return null for invalid DID', () => {
      expect(didToAddress('not-a-did')).toBeNull();
      expect(didToAddress('did:web:example.com')).toBeNull();
    });
  });

  describe('didToNetwork', () => {
    it('should return base-sepolia for chain 0x14a34', () => {
      expect(didToNetwork(validDID)).toBe('base-sepolia');
    });

    it('should return base for chain 0x2105', () => {
      const did = `did:ethr:0x2105:${validAddress}`;
      expect(didToNetwork(did)).toBe('base');
    });

    it('should return null for unknown chain', () => {
      const did = `did:ethr:0xffff:${validAddress}`;
      expect(didToNetwork(did)).toBeNull();
    });

    it('should return null for invalid DID', () => {
      expect(didToNetwork('not-a-did')).toBeNull();
    });
  });

  describe('isValidDID', () => {
    it('should accept valid DID', () => {
      expect(isValidDID(validDID)).toBe(true);
    });

    it('should reject non-ethr DIDs', () => {
      expect(isValidDID('did:web:example.com')).toBe(false);
    });

    it('should reject short DIDs', () => {
      expect(isValidDID('did:ethr')).toBe(false);
    });

    it('should reject DIDs with invalid address', () => {
      expect(isValidDID('did:ethr:0x14a34:notanaddress')).toBe(false);
    });
  });

  describe('isValidEthereumAddress', () => {
    it('should accept valid address', () => {
      expect(isValidEthereumAddress(validAddress)).toBe(true);
    });

    it('should reject short address', () => {
      expect(isValidEthereumAddress('0x1234')).toBe(false);
    });

    it('should reject without 0x prefix', () => {
      expect(isValidEthereumAddress('1234567890abcdef1234567890abcdef12345678')).toBe(false);
    });
  });

  describe('shortenDID', () => {
    it('should shorten a valid DID', () => {
      const short = shortenDID(validDID);
      expect(short).toContain('did:ethr:...');
      expect(short.length).toBeLessThan(validDID.length);
    });

    it('should return original for invalid DID', () => {
      expect(shortenDID('not-a-did')).toBe('not-a-did');
    });
  });
});
