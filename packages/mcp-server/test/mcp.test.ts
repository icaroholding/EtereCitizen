/*
 * Copyright 2025 Icaro Holding
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';

// Import all tool definitions directly (they are plain objects with metadata)
import { citizenVerifyAgentTool } from '../src/tools/citizen_verify_agent.js';
import { citizenPresentIdentityTool } from '../src/tools/citizen_present_identity.js';
import { citizenConnectWalletTool } from '../src/tools/citizen_connect_wallet.js';
import { citizenCreateWalletTool } from '../src/tools/citizen_create_wallet.js';
import { citizenRequestPaymentTool } from '../src/tools/citizen_request_payment.js';
import { citizenSubmitReviewTool } from '../src/tools/citizen_submit_review.js';
import { citizenSearchAgentsTool } from '../src/tools/citizen_search_agents.js';

// Collect all tools in one array — same as server.ts does
const ALL_TOOLS = [
  citizenVerifyAgentTool,
  citizenPresentIdentityTool,
  citizenConnectWalletTool,
  citizenCreateWalletTool,
  citizenRequestPaymentTool,
  citizenSubmitReviewTool,
  citizenSearchAgentsTool,
];

// ---------------------------------------------------------------------------
// 1. All 7 tools are present and have handlers
// ---------------------------------------------------------------------------
describe('Tool registration', () => {
  const EXPECTED_TOOL_NAMES = [
    'citizen_verify_agent',
    'citizen_present_identity',
    'citizen_connect_wallet',
    'citizen_create_wallet',
    'citizen_request_payment',
    'citizen_submit_review',
    'citizen_search_agents',
  ];

  it('has exactly 7 tools', () => {
    expect(ALL_TOOLS).toHaveLength(7);
  });

  it('includes all expected tool names', () => {
    const names = ALL_TOOLS.map((t) => t.name);
    for (const expected of EXPECTED_TOOL_NAMES) {
      expect(names, `missing tool: ${expected}`).toContain(expected);
    }
  });

  it('every tool has an execute function', () => {
    for (const tool of ALL_TOOLS) {
      expect(
        typeof tool.execute,
        `tool "${tool.name}" missing execute()`,
      ).toBe('function');
    }
  });
});

// ---------------------------------------------------------------------------
// 2. Tool definitions are properly structured
// ---------------------------------------------------------------------------
describe('Tool definition structure', () => {
  for (const tool of ALL_TOOLS) {
    describe(`${tool.name}`, () => {
      it('has a non-empty name', () => {
        expect(tool.name.length).toBeGreaterThan(0);
      });

      it('has a non-empty description', () => {
        expect(tool.description.length).toBeGreaterThan(0);
      });

      it('has an inputSchema of type "object"', () => {
        expect(tool.inputSchema).toBeDefined();
        expect(tool.inputSchema.type).toBe('object');
      });

      it('inputSchema has a properties object', () => {
        expect(tool.inputSchema.properties).toBeDefined();
        expect(typeof tool.inputSchema.properties).toBe('object');
      });

      it('name starts with "citizen_"', () => {
        expect(tool.name).toMatch(/^citizen_/);
      });
    });
  }
});

// ---------------------------------------------------------------------------
// 3. Required fields validation
// ---------------------------------------------------------------------------
describe('Required fields', () => {
  it('citizen_verify_agent requires "did"', () => {
    expect(citizenVerifyAgentTool.inputSchema.required).toContain('did');
  });

  it('citizen_connect_wallet requires "provider"', () => {
    expect(citizenConnectWalletTool.inputSchema.required).toContain('provider');
  });

  it('citizen_create_wallet requires "provider"', () => {
    expect(citizenCreateWalletTool.inputSchema.required).toContain('provider');
  });

  it('citizen_request_payment requires recipientDID, amount, currency, network', () => {
    const required = citizenRequestPaymentTool.inputSchema.required;
    expect(required).toContain('recipientDID');
    expect(required).toContain('amount');
    expect(required).toContain('currency');
    expect(required).toContain('network');
  });

  it('citizen_submit_review requires did, transactionHash, category, rating', () => {
    const required = citizenSubmitReviewTool.inputSchema.required;
    expect(required).toContain('did');
    expect(required).toContain('transactionHash');
    expect(required).toContain('category');
    expect(required).toContain('rating');
  });

  it('citizen_search_agents has no required fields', () => {
    // search has all optional params
    expect(citizenSearchAgentsTool.inputSchema.required).toBeUndefined();
  });

  it('citizen_present_identity has no required fields', () => {
    expect(citizenPresentIdentityTool.inputSchema.required).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// 4. Input schema property types
// ---------------------------------------------------------------------------
describe('Input schema property types', () => {
  it('citizen_verify_agent.did is a string', () => {
    expect(citizenVerifyAgentTool.inputSchema.properties.did.type).toBe('string');
  });

  it('citizen_search_agents.minRating is a number', () => {
    expect(citizenSearchAgentsTool.inputSchema.properties.minRating.type).toBe('number');
  });

  it('citizen_search_agents.minLevel is a number', () => {
    expect(citizenSearchAgentsTool.inputSchema.properties.minLevel.type).toBe('number');
  });

  it('citizen_search_agents.limit is a number', () => {
    expect(citizenSearchAgentsTool.inputSchema.properties.limit.type).toBe('number');
  });

  it('citizen_search_agents.capability is a string', () => {
    expect(citizenSearchAgentsTool.inputSchema.properties.capability.type).toBe('string');
  });

  it('citizen_submit_review.rating is a number', () => {
    expect(citizenSubmitReviewTool.inputSchema.properties.rating.type).toBe('number');
  });

  it('citizen_submit_review.comment is a string', () => {
    expect(citizenSubmitReviewTool.inputSchema.properties.comment.type).toBe('string');
  });

  it('citizen_present_identity.fields is an array', () => {
    expect(citizenPresentIdentityTool.inputSchema.properties.fields.type).toBe('array');
  });

  it('citizen_request_payment.amount is a string', () => {
    expect(citizenRequestPaymentTool.inputSchema.properties.amount.type).toBe('string');
  });
});

// ---------------------------------------------------------------------------
// 5. Rating validation (citizen_submit_review)
// ---------------------------------------------------------------------------
describe('citizen_submit_review rating validation', () => {
  it('rejects rating below 1', async () => {
    await expect(
      citizenSubmitReviewTool.execute({
        did: 'did:ethr:base-sepolia:0x1234567890abcdef1234567890abcdef12345678',
        transactionHash: '0xabc',
        category: 'code-generation',
        rating: 0,
      }),
    ).rejects.toThrow('Rating must be between 1 and 5');
  });

  it('rejects rating above 5', async () => {
    await expect(
      citizenSubmitReviewTool.execute({
        did: 'did:ethr:base-sepolia:0x1234567890abcdef1234567890abcdef12345678',
        transactionHash: '0xabc',
        category: 'code-generation',
        rating: 6,
      }),
    ).rejects.toThrow('Rating must be between 1 and 5');
  });

  it('rejects negative rating', async () => {
    await expect(
      citizenSubmitReviewTool.execute({
        did: 'did:ethr:base-sepolia:0x1234567890abcdef1234567890abcdef12345678',
        transactionHash: '0xabc',
        category: 'code-generation',
        rating: -1,
      }),
    ).rejects.toThrow('Rating must be between 1 and 5');
  });

  it('accepts valid rating of 1', async () => {
    // did:ethr:base-sepolia:0x... has 4 parts so didToAddress returns the address
    const result = await citizenSubmitReviewTool.execute({
      did: 'did:ethr:base-sepolia:0x1234567890abcdef1234567890abcdef12345678',
      transactionHash: '0xabc123',
      category: 'code-generation',
      rating: 1,
    });
    expect(result.success).toBe(true);
    expect(result.rating).toBe(1);
    expect(result.reviewHash).toMatch(/^0x[0-9a-f]{64}$/);
  });

  it('accepts valid rating of 5', async () => {
    const result = await citizenSubmitReviewTool.execute({
      did: 'did:ethr:base-sepolia:0x1234567890abcdef1234567890abcdef12345678',
      transactionHash: '0xdef456',
      category: 'document-analysis',
      rating: 5,
      comment: 'Excellent work',
    });
    expect(result.success).toBe(true);
    expect(result.rating).toBe(5);
    expect(result.category).toBe('document-analysis');
  });

  it('rejects DID without extractable address', async () => {
    await expect(
      citizenSubmitReviewTool.execute({
        did: 'did:web:example.com',
        transactionHash: '0xabc',
        category: 'code-generation',
        rating: 3,
      }),
    ).rejects.toThrow('Cannot extract address from DID');
  });
});

// ---------------------------------------------------------------------------
// 6. Server creation (import test)
// ---------------------------------------------------------------------------
describe('MCP Server creation', () => {
  it('createMCPServer returns a server object', async () => {
    const { createMCPServer } = await import('../src/server.js');
    const server = createMCPServer();
    expect(server).toBeDefined();
    // The server should have been set up with request handlers
    // We can verify it has the expected shape
    expect(typeof server.connect).toBe('function');
  });
});
