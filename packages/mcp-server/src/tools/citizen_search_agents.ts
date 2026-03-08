import { EtereCitizen } from '@eterecitizen/sdk';

export const citizenSearchAgentsTool = {
  name: 'citizen_search_agents',
  description: 'Search for AI agents by capability, rating, or verification level',
  inputSchema: {
    type: 'object' as const,
    properties: {
      capability: {
        type: 'string',
        description: 'Filter by capability/service category',
      },
      minRating: {
        type: 'number',
        description: 'Minimum reputation rating',
      },
      minLevel: {
        type: 'number',
        description: 'Minimum verification level (0-3)',
      },
      limit: {
        type: 'number',
        description: 'Maximum number of results',
      },
    },
  },
  async execute(params: {
    capability?: string;
    minRating?: number;
    minLevel?: number;
    limit?: number;
  }) {
    const result = await EtereCitizen.search({
      capability: params.capability as any,
      minRating: params.minRating,
      minLevel: params.minLevel,
      limit: params.limit || 10,
    });

    return {
      agents: result.agents.map((a) => ({
        did: a.did,
        name: a.name,
        capabilities: a.capabilities,
        verificationLevel: a.verificationLevel,
        overallScore: a.overallScore,
        totalReviews: a.totalReviews,
      })),
    };
  },
};
