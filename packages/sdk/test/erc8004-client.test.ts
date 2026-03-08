import { describe, it, expect, beforeEach } from 'vitest';
import { ERC8004Client } from '../src/registry/erc8004-client.js';
import type { AgentRegistryEntry } from '@eterecitizen/common';

function makeEntry(overrides: Partial<AgentRegistryEntry> = {}): AgentRegistryEntry {
  return {
    did: 'did:ethr:0x14a34:0x1111111111111111111111111111111111111111',
    name: 'TestAgent',
    description: 'A test agent',
    capabilities: ['code-generation'],
    verificationLevel: 0,
    overallScore: 0,
    reviewCount: 0,
    active: true,
    registeredAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('ERC8004Client', () => {
  let client: ERC8004Client;

  beforeEach(() => {
    client = new ERC8004Client();
  });

  it('should register and retrieve an agent', async () => {
    const entry = makeEntry();
    await client.register(entry);
    const result = await client.get(entry.did);
    expect(result).toEqual(entry);
  });

  it('should return null for unknown agent', async () => {
    const result = await client.get('did:ethr:0x14a34:0xunknown');
    expect(result).toBeNull();
  });

  it('should update an existing agent', async () => {
    const entry = makeEntry();
    await client.register(entry);
    await client.update(entry.did, { name: 'UpdatedAgent', overallScore: 4.5 });
    const result = await client.get(entry.did);
    expect(result!.name).toBe('UpdatedAgent');
    expect(result!.overallScore).toBe(4.5);
  });

  it('should throw when updating non-existent agent', async () => {
    await expect(client.update('did:ethr:0x14a34:0xfake', { name: 'x' })).rejects.toThrow(
      'Agent not found',
    );
  });

  it('should deactivate an agent', async () => {
    const entry = makeEntry();
    await client.register(entry);
    await client.deactivate(entry.did);
    const result = await client.get(entry.did);
    expect(result!.active).toBe(false);
  });

  describe('search', () => {
    const agents = [
      makeEntry({
        did: 'did:ethr:0x14a34:0x1111111111111111111111111111111111111111',
        name: 'CodeBot',
        capabilities: ['code-generation', 'code-review'],
        overallScore: 4.5,
        verificationLevel: 2,
      }),
      makeEntry({
        did: 'did:ethr:0x14a34:0x2222222222222222222222222222222222222222',
        name: 'DocAnalyzer',
        capabilities: ['document-analysis'],
        overallScore: 3.0,
        verificationLevel: 1,
      }),
      makeEntry({
        did: 'did:ethr:0x14a34:0x3333333333333333333333333333333333333333',
        name: 'DataBot',
        capabilities: ['data-processing', 'code-generation'],
        overallScore: 4.8,
        verificationLevel: 3,
        active: false,
      }),
    ];

    beforeEach(async () => {
      for (const a of agents) await client.register(a);
    });

    it('should search by capability', async () => {
      const result = await client.search({ capability: 'code-generation' });
      expect(result.total).toBe(2);
    });

    it('should search by minimum rating', async () => {
      const result = await client.search({ minRating: 4.0 });
      expect(result.total).toBe(2);
    });

    it('should search by minimum verification level', async () => {
      const result = await client.search({ minLevel: 2 });
      expect(result.total).toBe(2);
    });

    it('should search by name', async () => {
      const result = await client.search({ name: 'code' });
      expect(result.total).toBe(1);
      expect(result.agents[0].name).toBe('CodeBot');
    });

    it('should search by active status', async () => {
      const result = await client.search({ active: true });
      expect(result.total).toBe(2);
    });

    it('should support pagination', async () => {
      const result = await client.search({ limit: 1, offset: 0 });
      expect(result.agents).toHaveLength(1);
      expect(result.total).toBe(3);
    });

    it('should combine filters', async () => {
      const result = await client.search({
        capability: 'code-generation',
        minRating: 4.0,
        active: true,
      });
      expect(result.total).toBe(1);
      expect(result.agents[0].name).toBe('CodeBot');
    });
  });
});
