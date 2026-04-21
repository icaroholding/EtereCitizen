import { getCurrentAgent } from '../agent-context.js';

export const citizenRequestPaymentTool = {
  name: 'citizen_request_payment',
  description: 'Negotiate x402 payment with another agent (privately shares wallet address)',
  inputSchema: {
    type: 'object' as const,
    properties: {
      recipientDID: {
        type: 'string',
        description: 'DID of the payment recipient',
      },
      amount: {
        type: 'string',
        description: 'Payment amount',
      },
      currency: {
        type: 'string',
        description: 'Currency (ETH, USDC, etc.)',
      },
      network: {
        type: 'string',
        description: 'Network for payment',
      },
    },
    required: ['recipientDID', 'amount', 'currency', 'network'],
  },
  async execute(params: {
    recipientDID: string;
    amount: string;
    currency: string;
    network: string;
  }) {
    const agent = await getCurrentAgent();
    const response = await agent.requestPaymentAddress(params.recipientDID, {
      recipientDID: params.recipientDID,
      amount: params.amount,
      currency: params.currency,
      network: params.network as any,
    });
    return {
      address: response.address,
      paymentDetails: {
        amount: params.amount,
        currency: params.currency,
        network: params.network,
        recipientDID: params.recipientDID,
      },
    };
  },
};
