/**
 * Lightweight verifier for the API server.
 * Delegates to the @eterecitizen/sdk for DID resolution and agent verification.
 * Reads on-chain identity (name, capabilities) directly via viem.
 */
import { EtereCitizen, type EtereCitizenConfig, type TrustResult, didToAddress } from '@eterecitizen/sdk';
import { createPublicClient, http } from 'viem';
import { baseSepolia, base } from 'viem/chains';

const sdkConfig: EtereCitizenConfig = {
  reputationContractAddress: (process.env.ETERECITIZEN_CONTRACT_ADDRESS || undefined) as
    | `0x${string}`
    | undefined,
};

const contractAddress = (process.env.ETERECITIZEN_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`;

const chain = process.env.BASE_RPC_URL?.includes('sepolia') ? baseSepolia : base;
const publicClient = createPublicClient({
  chain,
  transport: http(process.env.BASE_RPC_URL || 'https://sepolia.base.org'),
});

const IDENTITY_ABI = [
  {
    type: 'function',
    name: 'getAgent',
    inputs: [{ name: 'agent', type: 'address' }],
    outputs: [{
      name: '',
      type: 'tuple',
      components: [
        { name: 'name', type: 'string' },
        { name: 'capabilities', type: 'string[]' },
        { name: 'createdAt', type: 'uint256' },
        { name: 'active', type: 'bool' },
      ],
    }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'isRegistered',
    inputs: [{ name: 'agent', type: 'address' }],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
  },
] as const;

export interface OnChainIdentity {
  name: string;
  capabilities: string[];
  createdAt: string;
  active: boolean;
  registered: boolean;
}

// Re-export TrustResult as the API's IdentityCardResult for backward compat
export type IdentityCardResult = TrustResult;

export async function resolveDID(did: string) {
  try {
    const address = didToAddress(did);
    if (!address) {
      return { didDocument: null, error: 'Invalid DID format' };
    }

    // Lightweight DID resolution: build a W3C-compliant DID Document
    // from the address without needing full Veramo + SQLite
    const chainIdHex = did.split(':')[2] || '0x14a34';
    const chainId = parseInt(chainIdHex, 16);

    const didDocument = {
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
          blockchainAccountId: `eip155:${chainId}:${address}`,
        },
      ],
      authentication: [`${did}#controller`],
      assertionMethod: [`${did}#controller`],
    };

    // Try to enrich with on-chain identity data
    try {
      const identity = await getOnChainIdentity(did);
      if (identity && identity.registered) {
        const services: Array<{ id: string; type: string; serviceEndpoint: string }> = [
          {
            id: `${did}#agent`,
            type: 'EtereCitizenAgent',
            serviceEndpoint: `https://api.eterecitizen.io/api/card/${encodeURIComponent(did)}`,
          },
        ];
        Object.assign(didDocument, { service: services });
      }
    } catch {
      // Non-fatal: return basic DID doc without services
    }

    return { didDocument };
  } catch {
    return { didDocument: null, error: 'Failed to resolve DID' };
  }
}

export async function verifyAgent(did: string): Promise<TrustResult> {
  return EtereCitizen.verify(did, sdkConfig);
}

export async function getOnChainIdentity(did: string): Promise<OnChainIdentity | null> {
  try {
    const address = didToAddress(did);
    if (!address) return null;

    const [agent, registered] = await Promise.all([
      publicClient.readContract({
        address: contractAddress,
        abi: IDENTITY_ABI,
        functionName: 'getAgent',
        args: [address as `0x${string}`],
      }),
      publicClient.readContract({
        address: contractAddress,
        abi: IDENTITY_ABI,
        functionName: 'isRegistered',
        args: [address as `0x${string}`],
      }),
    ]);

    return {
      name: agent.name,
      capabilities: [...agent.capabilities],
      createdAt: agent.createdAt > 0n
        ? new Date(Number(agent.createdAt) * 1000).toISOString()
        : '',
      active: agent.active,
      registered,
    };
  } catch (err) {
    console.error('[verifier] Failed to read on-chain identity:', err);
    return null;
  }
}
