import { getCurrentAgent } from '../agent-context.js';

export const citizenCreateWalletTool = {
  name: 'citizen_create_wallet',
  description: 'Create a new wallet and connect it to this agent',
  inputSchema: {
    type: 'object' as const,
    properties: {
      provider: {
        type: 'string',
        description: 'Wallet provider to use for creation',
      },
      network: {
        type: 'string',
        description: 'Network (base, base-sepolia)',
      },
    },
    required: ['provider'],
  },
  async execute(params: { provider: string; network?: string }) {
    const agent = await getCurrentAgent();
    const walletInfo = await agent.createAndConnectWallet({
      provider: params.provider as any,
      network: params.network as any,
    });
    return {
      connected: walletInfo.connected,
      provider: walletInfo.provider,
      agentDID: agent.did,
    };
  },
};
