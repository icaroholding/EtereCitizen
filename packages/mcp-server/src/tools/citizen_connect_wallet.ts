import { getCurrentAgent } from '../agent-context.js';

export const citizenConnectWalletTool = {
  name: 'citizen_connect_wallet',
  description: 'Connect an existing wallet to this agent',
  inputSchema: {
    type: 'object' as const,
    properties: {
      provider: {
        type: 'string',
        description: 'Wallet provider (standard, coinbase-cdp, openfort, moonpay, conway)',
      },
      apiKey: {
        type: 'string',
        description: 'API key for the wallet provider (if applicable)',
      },
      privateKey: {
        type: 'string',
        description: 'Private key for standard wallet',
      },
    },
    required: ['provider'],
  },
  async execute(params: { provider: string; apiKey?: string; privateKey?: string }) {
    const agent = await getCurrentAgent();
    await agent.connectWallet({
      provider: params.provider as any,
      apiKey: params.apiKey,
      privateKey: params.privateKey,
    });
    return {
      connected: true,
      provider: params.provider,
      agentDID: agent.did,
    };
  },
};
