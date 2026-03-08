/**
 * Lightweight verifier for the API server.
 * Reads identity + reputation from the unified EtereCitizen contract via viem.
 */
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

const CONTRACT_ADDRESS = (process.env.ETERECITIZEN_CONTRACT_ADDRESS ||
  '0x2BecDFe8406eA2895F16a9B8448b40166F4178f6') as `0x${string}`;

const RPC_URL = process.env.BASE_RPC_URL || 'https://mainnet.base.org';

// -- Viem public client (cached) --
let cachedClient: ReturnType<typeof createPublicClient> | null = null;

function getPublicClient() {
  if (cachedClient) return cachedClient;
  cachedClient = createPublicClient({
    chain: base,
    transport: http(RPC_URL),
  });
  return cachedClient;
}

// -- EtereCitizen ABI (read-only) --
const ETERECITIZEN_ABI = [
  // Identity
  {
    type: 'function',
    name: 'getAgent',
    inputs: [{ name: 'agent', type: 'address' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'name', type: 'string' },
          { name: 'capabilities', type: 'string[]' },
          { name: 'createdAt', type: 'uint256' },
          { name: 'active', type: 'bool' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'isRegistered',
    inputs: [{ name: 'agent', type: 'address' }],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
  },
  // Reputation
  {
    type: 'function',
    name: 'getReviewCount',
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
] as const;

// -- Helpers --

function didToAddress(did: string): `0x${string}` | null {
  const parts = did.split(':');
  if (parts.length < 3 || parts[1] !== 'ethr') return null;
  const addr = parts[parts.length - 1];
  if (/^0x[0-9a-fA-F]{40}$/.test(addr)) return addr as `0x${string}`;
  return null;
}

function isValidDID(did: string): boolean {
  return /^did:ethr:(0x[0-9a-fA-F]+:)?0x[0-9a-fA-F]{40}$/.test(did);
}

function buildDefaultDIDDocument(did: string, address: `0x${string}`) {
  return {
    '@context': [
      'https://www.w3.org/ns/did/v1',
      'https://w3id.org/security/suites/secp256k1recovery-2020/v2',
    ],
    id: did,
    verificationMethod: [
      {
        id: `${did}#controller`,
        type: 'EcdsaSecp256k1RecoveryMethod2020',
        controller: did,
        blockchainAccountId: `eip155:8453:${address}`,
      },
    ],
    authentication: [`${did}#controller`],
    assertionMethod: [`${did}#controller`],
  };
}

// -- Public API --

export interface IdentityCardResult {
  did: string;
  name: string;
  verified: boolean;
  registered: boolean;
  verificationLevel: number;
  reputationScore: number;
  reviewCount: number;
  categoryRatings: { category: string; score: number; reviews: number }[];
  walletConnected: boolean;
  agentAge: number;
  status: string;
  capabilities: string[];
  flags: string[];
  createdAt: string;
  checkedAt: string;
}

export async function resolveDID(did: string) {
  if (!isValidDID(did)) {
    return { didDocument: null, error: 'Invalid DID format' };
  }
  const address = didToAddress(did);
  if (!address) {
    return { didDocument: null, error: 'Could not extract address from DID' };
  }
  return { didDocument: buildDefaultDIDDocument(did, address) };
}

export async function verifyAgent(did: string): Promise<IdentityCardResult> {
  const flags: string[] = [];

  if (!isValidDID(did)) {
    return {
      did,
      name: '',
      verified: false,
      registered: false,
      verificationLevel: 0,
      reputationScore: 0,
      reviewCount: 0,
      categoryRatings: [],
      walletConnected: false,
      agentAge: 0,
      status: 'invalid',
      capabilities: [],
      flags: ['INVALID_DID_FORMAT'],
      createdAt: '',
      checkedAt: new Date().toISOString(),
    };
  }

  const address = didToAddress(did);
  if (!address) {
    return {
      did,
      name: '',
      verified: false,
      registered: false,
      verificationLevel: 0,
      reputationScore: 0,
      reviewCount: 0,
      categoryRatings: [],
      walletConnected: false,
      agentAge: 0,
      status: 'unknown',
      capabilities: [],
      flags: ['DID_NOT_FOUND'],
      createdAt: '',
      checkedAt: new Date().toISOString(),
    };
  }

  const client = getPublicClient();

  // --- Read identity from contract ---
  let name = '';
  let capabilities: string[] = [];
  let createdAt = '';
  let registered = false;
  let active = false;
  let agentAge = 0;

  try {
    registered = await client.readContract({
      address: CONTRACT_ADDRESS,
      abi: ETERECITIZEN_ABI,
      functionName: 'isRegistered',
      args: [address],
    }) as boolean;

    if (registered) {
      const agent = await client.readContract({
        address: CONTRACT_ADDRESS,
        abi: ETERECITIZEN_ABI,
        functionName: 'getAgent',
        args: [address],
      }) as { name: string; capabilities: readonly string[]; createdAt: bigint; active: boolean };

      name = agent.name;
      capabilities = [...agent.capabilities];
      active = agent.active;
      if (agent.createdAt > 0n) {
        const createdTimestamp = Number(agent.createdAt) * 1000;
        createdAt = new Date(createdTimestamp).toISOString();
        agentAge = Math.floor((Date.now() - createdTimestamp) / (1000 * 60 * 60 * 24));
      }
    }
  } catch {
    flags.push('IDENTITY_READ_ERROR');
  }

  if (!registered) flags.push('NOT_REGISTERED');

  // --- Read reputation from contract ---
  let verificationLevel = 0;
  let reviewCount = 0;
  const categoryRatings: { category: string; score: number; reviews: number }[] = [];

  try {
    const level = await client.readContract({
      address: CONTRACT_ADDRESS,
      abi: ETERECITIZEN_ABI,
      functionName: 'getVerificationLevel',
      args: [address],
    });
    verificationLevel = Number(level);
  } catch {
    // Default to 0
  }

  try {
    const count = await client.readContract({
      address: CONTRACT_ADDRESS,
      abi: ETERECITIZEN_ABI,
      functionName: 'getReviewCount',
      args: [address],
    });
    reviewCount = Number(count);
  } catch {
    flags.push('REPUTATION_UNAVAILABLE');
  }

  if (reviewCount > 0) {
    try {
      const reviews = await client.readContract({
        address: CONTRACT_ADDRESS,
        abi: ETERECITIZEN_ABI,
        functionName: 'getReviews',
        args: [address, 0n, BigInt(Math.min(reviewCount, 50))],
      });

      const catMap = new Map<string, { total: number; count: number }>();
      for (const r of reviews) {
        const existing = catMap.get(r.category) || { total: 0, count: 0 };
        existing.total += Number(r.rating);
        existing.count += 1;
        catMap.set(r.category, existing);
      }

      for (const [cat, data] of catMap) {
        categoryRatings.push({
          category: cat,
          score: data.total / data.count,
          reviews: data.count,
        });
      }
    } catch {
      // Non-fatal
    }
  }

  if (reviewCount === 0) flags.push('NO_REVIEWS');
  if (agentAge < 7 && registered) flags.push('NEW_AGENT');

  const reputationScore =
    categoryRatings.length > 0
      ? categoryRatings.reduce((sum, c) => sum + c.score * c.reviews, 0) /
        categoryRatings.reduce((sum, c) => sum + c.reviews, 0)
      : 0;

  return {
    did,
    name,
    verified: registered && active,
    registered,
    verificationLevel,
    reputationScore,
    reviewCount,
    categoryRatings,
    walletConnected: false,
    agentAge,
    status: !registered ? 'unregistered' : active ? 'active' : 'deactivated',
    capabilities,
    flags,
    createdAt,
    checkedAt: new Date().toISOString(),
  };
}
