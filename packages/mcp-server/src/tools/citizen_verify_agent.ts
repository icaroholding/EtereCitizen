import { EtereCitizen } from '@eterecitizen/sdk';

export const citizenVerifyAgentTool = {
  name: 'citizen_verify_agent',
  description: 'Verify the identity, credentials, and reputation of an AI agent by DID',
  inputSchema: {
    type: 'object' as const,
    properties: {
      did: {
        type: 'string',
        description: 'The DID (Decentralized Identifier) of the agent to verify',
      },
    },
    required: ['did'],
  },
  async execute(params: { did: string }) {
    const result = await EtereCitizen.verify(params.did);
    return {
      level: result.verificationLevel,
      ratings: result.categoryRatings.map((r) => ({
        category: r.category,
        score: r.decayedScore,
      })),
      reviewCount: result.reviewCount,
      age: result.agentAge,
      flags: result.flags,
      walletConnected: result.walletConnected,
      verified: result.verified,
    };
  },
};
