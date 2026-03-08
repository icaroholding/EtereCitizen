import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SQLiteStore } from '../src/storage/sqlite-store.js';
import { mkdtempSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

describe('SQLiteStore', () => {
  let store: SQLiteStore;
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'eterecitizen-test-'));
    store = new SQLiteStore(join(tempDir, 'test.sqlite'));
  });

  afterEach(() => {
    store.close();
    rmSync(tempDir, { recursive: true, force: true });
  });

  describe('agents', () => {
    it('should save and retrieve an agent', () => {
      store.saveAgent('did:ethr:0x14a34:0x1234', 'TestBot', 'A test agent', 'base-sepolia');
      const agent = store.getAgent('did:ethr:0x14a34:0x1234');
      expect(agent).toBeDefined();
      expect(agent!.name).toBe('TestBot');
      expect(agent!.description).toBe('A test agent');
      expect(agent!.network).toBe('base-sepolia');
    });

    it('should return null for unknown agent', () => {
      expect(store.getAgent('did:ethr:0x14a34:0xunknown')).toBeFalsy();
    });

    it('should upsert on duplicate DID', () => {
      store.saveAgent('did:ethr:0x14a34:0x1234', 'OldName', undefined, 'base-sepolia');
      store.saveAgent('did:ethr:0x14a34:0x1234', 'NewName', 'desc', 'base');
      const agent = store.getAgent('did:ethr:0x14a34:0x1234');
      expect(agent!.name).toBe('NewName');
      expect(agent!.network).toBe('base');
    });
  });

  describe('credentials', () => {
    it('should save and retrieve credentials', () => {
      const did = 'did:ethr:0x14a34:0x1234';
      store.saveAgent(did, 'Bot', undefined, 'base-sepolia');
      store.saveCredential('vc-1', did, 'BirthCertificate', { created: true });
      store.saveCredential('vc-2', did, 'Capability', { cap: 'code' });

      const creds = store.getCredentials(did);
      expect(creds).toHaveLength(2);
      expect(creds[0].type).toBe('BirthCertificate');
      expect(creds[1].type).toBe('Capability');
    });

    it('should return empty array for unknown agent', () => {
      expect(store.getCredentials('did:ethr:0x14a34:0xunknown')).toEqual([]);
    });
  });

  describe('wallet connections', () => {
    it('should save and retrieve wallet connection', () => {
      const did = 'did:ethr:0x14a34:0x1234';
      store.saveAgent(did, 'Bot', undefined, 'base-sepolia');
      store.saveWalletConnection(did, 'standard');

      const conn = store.getWalletConnection(did);
      expect(conn).toBeDefined();
      expect(conn!.provider).toBe('standard');
    });

    it('should return null for no connection', () => {
      expect(store.getWalletConnection('did:ethr:0x14a34:0xnone')).toBeNull();
    });
  });

  describe('cache', () => {
    it('should set and get cache values', () => {
      store.setCache('key1', { data: 'test' });
      const value = store.getCache<{ data: string }>('key1');
      expect(value).toEqual({ data: 'test' });
    });

    it('should return null for missing key', () => {
      expect(store.getCache('missing')).toBeNull();
    });

    it('should expire cache entries', () => {
      store.setCache('expiring', 'value', 1); // 1ms TTL
      // Small delay to ensure expiry
      const start = Date.now();
      while (Date.now() - start < 5) {} // busy-wait 5ms
      expect(store.getCache('expiring')).toBeNull();
    });

    it('should not expire cache without TTL', () => {
      store.setCache('permanent', 'value');
      expect(store.getCache('permanent')).toBe('value');
    });
  });
});
