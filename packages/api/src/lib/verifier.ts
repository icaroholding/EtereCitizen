/**
 * Lightweight verifier for the API server.
 * Uses viem for on-chain reads. DID resolution is address-based
 * (ERC-1056 is not yet deployed on Base Sepolia, so we derive the
 * default DID document from the Ethereum address).
 */
import { createPublicClient, http } from 'viem';
import { baseSepolia } from 'viem/chains';

const REPUTATION_CONTRACT = (process.env.REPUTATION_CONTRACT_ADDRESS ||
  '0x6d51FeBF4E8e87388BDCc90E85ce0c2fF6D19843') as `0x${string}`;

const RPC_URL = process.env.BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org';

// -- Viem public client (cached) --
let cachedClient: ReturnType<typeof createPublicClient> | null = null;

function getPublicClient() {
  if (cachedClient) return cachedClient;
  cachedClient = createPublicClient({
    chain: baseSepolia,
    transport: http(RPC_URL),
  });
  return cachedClient;
}

// -- Reputation ABI (read-only) --
const REPUTATION_ABI = [
  {
    type: 'function',
    name: 'getReviewCount',
    inputs: [{ name: 'agent', type: 'address' }],
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
  {
    type: 'function',
    name: 'getTotalTasksCompleted',
    inputs: [{ name: 'agent', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
] as const;

// -- Helpers --

/** Extract Ethereum address from a did:ethr DID */
function didToAddress(did: string): `0x${string}` | null {
  // did:ethr:0x14a34:0xABC... or did:ethr:0xABC...
  const parts = did.split(':');
  if (parts.length < 3 || parts[1] !== 'ethr') return null;
  const addr = parts[parts.length - 1];
  if (/^0x[0-9a-fA-F]{40}$/.test(addr)) return addr as `0x${string}`;
  return null;
}

/** Validate a did:ethr string */
function isValidDID(did: string): boolean {
  return /^did:ethr:(0x[0-9a-fA-F]+:)?0x[0-9a-fA-F]{40}$/.test(did);
}

/** Build a default DID document from the address (no ERC-1056 lookup needed) */
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
        blockchainAccountId: `eip155:84532:${address}`,
      },
    ],
    authentication: [`${did}#controller`],
    assertionMethod: [`${did}#controller`],
  };
}

// -- Public API --

export interface IdentityCardResult {
  did: string;
  verified: boolean;
  verificationLevel: number;
  reputationScore: number;
  reviewCount: number;
  categoryRatings: { category: string; score: number; reviews: number }[];
  walletConnected: boolean;
  agentAge: number;
  status: string;
  capabilities: string[];
  flags: string[];
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
  // Build a default DID document from the address.
  // When ERC-1056 is deployed on Base Sepolia, this will use the registry.
  return { didDocument: buildDefaultDIDDocument(did, address) };
}

export async function verifyAgent(did: string): Promise<IdentityCardResult> {
  const flags: string[] = [];

  // 1. Validate DID and extract address
  if (!isValidDID(did)) {
    return {
      did,
      verified: false,
      verificationLevel: 0,
      reputationScore: 0,
      reviewCount: 0,
      categoryRatings: [],
      walletConnected: false,
      agentAge: 0,
      status: 'invalid',
      capabilities: [],
      flags: ['INVALID_DID_FORMAT'],
      checkedAt: new Date().toISOString(),
    };
  }

  const address = didToAddress(did);
  if (!address) {
    flags.push('DID_NOT_FOUND');
    return {
      did,
      verified: false,
      verificationLevel: 0,
      reputationScore: 0,
      reviewCount: 0,
      categoryRatings: [],
      walletConnected: false,
      agentAge: 0,
      status: 'unknown',
      capabilities: [],
      flags,
      checkedAt: new Date().toISOString(),
    };
  }

  // 2. Read on-chain data from CitizenReputation contract
  const client = getPublicClient();
  let verificationLevel = 0;
  let reviewCount = 0;
  const categoryRatings: { category: string; score: number; reviews: number }[] = [];

  try {
    const level = await client.readContract({
      address: REPUTATION_CONTRACT,
      abi: REPUTATION_ABI,
      functionName: 'getVerificationLevel',
      args: [address],
    });
    verificationLevel = Number(level);
  } catch {
    // Default to 0
  }

  try {
    const count = await client.readContract({
      address: REPUTATION_CONTRACT,
      abi: REPUTATION_ABI,
      functionName: 'getReviewCount',
      args: [address],
    });
    reviewCount = Number(count);
  } catch {
    flags.push('REPUTATION_UNAVAILABLE');
  }

  // Get reviews to extract categories
  if (reviewCount > 0) {
    try {
      const reviews = await client.readContract({
        address: REPUTATION_CONTRACT,
        abi: REPUTATION_ABI,
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

  // 3. Flags
  if (reviewCount === 0) flags.push('NO_REVIEWS');

  const reputationScore =
    categoryRatings.length > 0
      ? categoryRatings.reduce((sum, c) => sum + c.score * c.reviews, 0) /
        categoryRatings.reduce((sum, c) => sum + c.reviews, 0)
      : 0;

  return {
    did,
    verified: true, // DID is valid and maps to a real address
    verificationLevel,
    reputationScore,
    reviewCount,
    categoryRatings,
    walletConnected: false, // Will be populated when ERC-1056 DID documents are available
    agentAge: 0, // Will be populated when ERC-1056 DID documents are available
    status: 'active',
    capabilities: [], // Will be populated from DID document services
    flags,
    checkedAt: new Date().toISOString(),
  };
}
