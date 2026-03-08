import {
  type WalletClient,
} from 'viem';

// Minimal ABI for CitizenReputation — matches the Solidity contract
const CITIZEN_REPUTATION_ABI = [
  {
    type: 'function',
    name: 'submitReview',
    inputs: [
      { name: 'reviewed', type: 'address' },
      { name: 'reviewHash', type: 'bytes32' },
      { name: 'txHash', type: 'bytes32' },
      { name: 'category', type: 'string' },
      { name: 'rating', type: 'uint8' },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'reviewFee',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getAggregateScore',
    inputs: [
      { name: 'agent', type: 'address' },
      { name: 'category', type: 'string' },
    ],
    outputs: [
      { name: 'totalScore', type: 'uint256' },
      { name: 'count', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getReviewCount',
    inputs: [{ name: 'agent', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getReviews',
    inputs: [
      { name: 'agent', type: 'address' },
      { name: 'offset', type: 'uint256' },
      { name: 'limit', type: 'uint256' },
    ],
    outputs: [
      {
        name: '',
        type: 'tuple[]',
        components: [
          { name: 'reviewHash', type: 'bytes32' },
          { name: 'reviewer', type: 'address' },
          { name: 'reviewed', type: 'address' },
          { name: 'txHash', type: 'bytes32' },
          { name: 'category', type: 'string' },
          { name: 'rating', type: 'uint8' },
          { name: 'timestamp', type: 'uint256' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getTotalTasksCompleted',
    inputs: [{ name: 'agent', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getVerificationLevel',
    inputs: [{ name: 'agent', type: 'address' }],
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'setVerificationLevel',
    inputs: [
      { name: 'agent', type: 'address' },
      { name: 'level', type: 'uint8' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const;

export interface ContractClients {
  reputation: {
    submitReview(
      reviewed: `0x${string}`,
      reviewHash: `0x${string}`,
      txHash: `0x${string}`,
      category: string,
      rating: number,
    ): Promise<void>;
    getAggregateScore(agent: `0x${string}`, category: string): Promise<[bigint, bigint]>;
    getReviewCount(agent: `0x${string}`): Promise<bigint>;
    getReviews(
      agent: `0x${string}`,
      offset: bigint,
      limit: bigint,
    ): Promise<
      Array<{
        reviewHash: string;
        reviewer: string;
        reviewed: string;
        txHash: string;
        category: string;
        rating: number;
        timestamp: bigint;
      }>
    >;
    getTotalTasksCompleted(agent: `0x${string}`): Promise<bigint>;
    getVerificationLevel(agent: `0x${string}`): Promise<number>;
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createContractClients(
  publicClient: any,
  walletClient?: WalletClient,
  reputationAddress?: `0x${string}`,
): ContractClients {
  const address = reputationAddress || '0x0000000000000000000000000000000000000000';

  return {
    reputation: {
      async submitReview(reviewed, reviewHash, txHash, category, rating) {
        if (!walletClient) throw new Error('Wallet client required for write operations');
        // Read the current review fee
        const fee = await publicClient.readContract({
          address,
          abi: CITIZEN_REPUTATION_ABI,
          functionName: 'reviewFee',
        }) as bigint;
        const { request } = await publicClient.simulateContract({
          address,
          abi: CITIZEN_REPUTATION_ABI,
          functionName: 'submitReview',
          args: [reviewed, reviewHash, txHash, category, rating],
          account: walletClient.account!,
          value: fee,
        });
        await walletClient.writeContract(request);
      },

      async getAggregateScore(agent, category) {
        const result = await publicClient.readContract({
          address,
          abi: CITIZEN_REPUTATION_ABI,
          functionName: 'getAggregateScore',
          args: [agent, category],
        });
        return result as [bigint, bigint];
      },

      async getReviewCount(agent) {
        return publicClient.readContract({
          address,
          abi: CITIZEN_REPUTATION_ABI,
          functionName: 'getReviewCount',
          args: [agent],
        }) as Promise<bigint>;
      },

      async getReviews(agent, offset, limit) {
        const result = await publicClient.readContract({
          address,
          abi: CITIZEN_REPUTATION_ABI,
          functionName: 'getReviews',
          args: [agent, offset, limit],
        });
        return result as any;
      },

      async getTotalTasksCompleted(agent) {
        return publicClient.readContract({
          address,
          abi: CITIZEN_REPUTATION_ABI,
          functionName: 'getTotalTasksCompleted',
          args: [agent],
        }) as Promise<bigint>;
      },

      async getVerificationLevel(agent) {
        const result = await publicClient.readContract({
          address,
          abi: CITIZEN_REPUTATION_ABI,
          functionName: 'getVerificationLevel',
          args: [agent],
        });
        return Number(result);
      },
    },
  };
}
