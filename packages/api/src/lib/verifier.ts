/**
 * Lightweight verifier for the API server.
 * Delegates to the @eterecitizen/sdk for DID resolution and agent verification.
 */
import { EtereCitizen, type EtereCitizenConfig, type TrustResult } from '@eterecitizen/sdk';

const sdkConfig: EtereCitizenConfig = {
  reputationContractAddress: (process.env.ETERECITIZEN_CONTRACT_ADDRESS || undefined) as
    | `0x${string}`
    | undefined,
};

// Re-export TrustResult as the API's IdentityCardResult for backward compat
export type IdentityCardResult = TrustResult;

export async function resolveDID(did: string) {
  try {
    const didDocument = await EtereCitizen.resolve(did, sdkConfig);
    if (!didDocument) {
      return { didDocument: null, error: 'DID not found' };
    }
    return { didDocument };
  } catch {
    return { didDocument: null, error: 'Failed to resolve DID' };
  }
}

export async function verifyAgent(did: string): Promise<TrustResult> {
  return EtereCitizen.verify(did, sdkConfig);
}
