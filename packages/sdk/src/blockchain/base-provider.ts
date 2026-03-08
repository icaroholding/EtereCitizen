import { createPublicClient, http } from 'viem';
import { baseSepolia, base } from 'viem/chains';
import { NETWORKS, type NetworkName } from '@eterecitizen/common';

export function createBaseProvider(network: NetworkName = 'base-sepolia') {
  const chain = network === 'base' ? base : baseSepolia;
  const rpcUrl = NETWORKS[network].rpcUrl;

  return createPublicClient({
    chain,
    transport: http(rpcUrl),
  });
}
