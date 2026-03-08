import type { TrustResult } from '@eterecitizen/common';
import { VerificationLevel, didToAddress } from '@eterecitizen/common';
import { DIDManager } from '../identity/did-manager.js';
import { ReputationManager } from '../reputation/reputation-manager.js';
import type { ContractClients } from '../blockchain/contract-clients.js';

export class Verifier {
  private didManager: DIDManager;
  private reputationManager: ReputationManager;
  private contracts: ContractClients;

  constructor(
    didManager: DIDManager,
    reputationManager: ReputationManager,
    contracts: ContractClients,
  ) {
    this.didManager = didManager;
    this.reputationManager = reputationManager;
    this.contracts = contracts;
  }

  async verify(did: string): Promise<TrustResult> {
    const flags: string[] = [];

    // 1. Resolve DID Document
    const resolution = await this.didManager.resolveDID(did);
    const identityValid = resolution.didDocument !== null;
    if (!identityValid) {
      flags.push('DID_NOT_FOUND');
    }

    // 2. Check verification level on-chain
    const address = didToAddress(did);
    let verificationLevel = VerificationLevel.Unverified;
    if (address) {
      const level = await this.contracts.reputation.getVerificationLevel(address as `0x${string}`);
      verificationLevel = Number(level) as VerificationLevel;
    }

    // 3. Get reputation
    let reputationScore = 0;
    let categoryRatings: TrustResult['categoryRatings'] = [];
    let reviewCount = 0;
    try {
      const reputation = await this.reputationManager.getReputationScore(did);
      reputationScore = reputation.overallScore;
      categoryRatings = reputation.categoryRatings;
      reviewCount = reputation.totalReviews;
    } catch {
      flags.push('REPUTATION_UNAVAILABLE');
    }

    // 4. Check wallet connection (from DID document services)
    const walletConnected = resolution.didDocument?.service?.some(
      (s) => s.type === 'EtereCitizenWalletOwnership',
    ) ?? false;

    // 5. Calculate agent age
    const created = resolution.didDocumentMetadata.created;
    const agentAge = created
      ? Math.floor((Date.now() - new Date(created).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    // 6. Credential verification
    const credentialsValid = identityValid; // TODO: verify individual VCs

    if (agentAge < 7) flags.push('NEW_AGENT');
    if (reviewCount === 0) flags.push('NO_REVIEWS');

    return {
      did,
      verified: identityValid && credentialsValid,
      verificationLevel,
      identityValid,
      credentialsValid,
      reputationScore,
      categoryRatings,
      reviewCount,
      walletConnected,
      agentAge,
      flags,
      checkedAt: new Date().toISOString(),
    };
  }
}
