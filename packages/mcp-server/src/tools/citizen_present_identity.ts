import { getCurrentAgent } from '../agent-context.js';

export const citizenPresentIdentityTool = {
  name: 'citizen_present_identity',
  description: 'Present this agent\'s identity with selective disclosure (Verifiable Presentation)',
  inputSchema: {
    type: 'object' as const,
    properties: {
      fields: {
        type: 'array',
        items: { type: 'string' },
        description: 'Credential types to include (e.g., BirthCertificate, Capability, WalletOwnership)',
      },
      recipientDID: {
        type: 'string',
        description: 'DID of the recipient (for targeted disclosure)',
      },
    },
  },
  async execute(params: { fields?: string[]; recipientDID?: string }) {
    const agent = await getCurrentAgent();
    const vp = await agent.present({
      fields: params.fields,
      recipientDID: params.recipientDID,
    });
    return { verifiablePresentation: vp };
  },
};
