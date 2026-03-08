export const NETWORKS = {
  base: {
    chainId: 8453,
    name: 'Base',
    rpcUrl: 'https://mainnet.base.org',
    explorerUrl: 'https://basescan.org',
    erc1056Address: '0xd1D374DDE031075157fDb64536eF5cC13Ae75000',
  },
  'base-sepolia': {
    chainId: 84532,
    name: 'Base Sepolia',
    rpcUrl: 'https://sepolia.base.org',
    explorerUrl: 'https://sepolia.basescan.org',
    erc1056Address: '0xd1D374DDE031075157fDb64536eF5cC13Ae75000',
  },
} as const;

export type NetworkName = keyof typeof NETWORKS;

export const DEFAULT_NETWORK: NetworkName = 'base-sepolia';

export const BASE_CHAIN_ID = 8453;
export const BASE_SEPOLIA_CHAIN_ID = 84532;

export const DID_METHOD_PREFIX = 'did:ethr';

export function getDIDPrefix(network: NetworkName): string {
  const chainId = NETWORKS[network].chainId;
  return `${DID_METHOD_PREFIX}:0x${chainId.toString(16)}`;
}
