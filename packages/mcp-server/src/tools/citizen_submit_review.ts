import { didToAddress } from '@eterecitizen/sdk';
import { createHash } from 'crypto';

export const citizenSubmitReviewTool = {
  name: 'citizen_submit_review',
  description: 'Submit a review for an agent tied to an on-chain transaction',
  inputSchema: {
    type: 'object' as const,
    properties: {
      did: {
        type: 'string',
        description: 'DID of the agent being reviewed',
      },
      transactionHash: {
        type: 'string',
        description: 'On-chain transaction hash of the completed work',
      },
      category: {
        type: 'string',
        description: 'Service category (e.g., code-generation, document-analysis)',
      },
      rating: {
        type: 'number',
        description: 'Rating from 1 to 5',
      },
      comment: {
        type: 'string',
        description: 'Optional review comment',
      },
    },
    required: ['did', 'transactionHash', 'category', 'rating'],
  },
  async execute(params: {
    did: string;
    transactionHash: string;
    category: string;
    rating: number;
    comment?: string;
  }) {
    // Validate inputs
    if (params.rating < 1 || params.rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    // Extract address from DID for on-chain interaction
    const reviewedAddress = didToAddress(params.did);
    if (!reviewedAddress) {
      throw new Error(`Cannot extract address from DID: ${params.did}`);
    }

    // Create review hash from the review content
    const reviewContent = JSON.stringify({
      did: params.did,
      transactionHash: params.transactionHash,
      category: params.category,
      rating: params.rating,
      comment: params.comment || '',
      timestamp: new Date().toISOString(),
    });
    const reviewHash = '0x' + createHash('sha256').update(reviewContent).digest('hex');

    // Note: On-chain submission requires a connected wallet with funds.
    // The review hash is created and ready for on-chain submission.
    // In production, this would call the CitizenReputation contract's submitReview().
    return {
      success: true,
      reviewHash,
      reviewedDID: params.did,
      reviewedAddress,
      category: params.category,
      rating: params.rating,
      note: 'Review hash created. On-chain submission requires a connected wallet with ETH for gas + review fee.',
    };
  },
};
