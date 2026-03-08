import { NETWORKS, type NetworkName, DID_METHOD_PREFIX } from '../constants/networks.js';

export function addressToDID(address: string, network: NetworkName = 'base-sepolia'): string {
  const chainId = NETWORKS[network].chainId;
  return `${DID_METHOD_PREFIX}:0x${chainId.toString(16)}:${address}`;
}

export function didToAddress(did: string): string | null {
  const parts = did.split(':');
  if (parts.length < 4 || parts[0] !== 'did' || parts[1] !== 'ethr') {
    return null;
  }
  return parts[parts.length - 1];
}

export function didToNetwork(did: string): NetworkName | null {
  const parts = did.split(':');
  if (parts.length < 4 || parts[0] !== 'did' || parts[1] !== 'ethr') {
    return null;
  }
  const chainIdHex = parts[2];
  const chainId = parseInt(chainIdHex, 16);

  for (const [name, config] of Object.entries(NETWORKS)) {
    if (config.chainId === chainId) {
      return name as NetworkName;
    }
  }
  return null;
}

export function isValidDID(did: string): boolean {
  const parts = did.split(':');
  if (parts.length < 4) return false;
  if (parts[0] !== 'did') return false;
  if (parts[1] !== 'ethr') return false;

  const address = parts[parts.length - 1];
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function shortenDID(did: string, chars = 6): string {
  const address = didToAddress(did);
  if (!address) return did;
  return `did:ethr:...${address.slice(-chars)}`;
}
