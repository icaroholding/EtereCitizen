import type { TrustResult, VerifiableCredential } from '@eterecitizen/common';
import { VerificationLevel, didToAddress } from '@eterecitizen/common';
import { DIDManager } from '../identity/did-manager.js';
import { VCManager } from '../credentials/vc-manager.js';
import { ReputationManager } from '../reputation/reputation-manager.js';
import type { ContractClients } from '../blockchain/contract-clients.js';
import { createChildLogger } from '../logger.js';

const log = createChildLogger('verifier');

export interface VerifyOptions {
  /** Optional credentials to cryptographically verify (from a Verifiable Presentation) */
  credentials?: VerifiableCredential[];
}

export class Verifier {
  private didManager: DIDManager;
  private reputationManager: ReputationManager;
  private contracts: ContractClients;
  private vcManager: VCManager | null;

  constructor(
    didManager: DIDManager,
    reputationManager: ReputationManager,
    contracts: ContractClients,
    vcManager?: VCManager,
  ) {
    this.didManager = didManager;
    this.reputationManager = reputationManager;
    this.contracts = contracts;
    this.vcManager = vcManager ?? null;
  }

  async verify(did: string, options?: VerifyOptions): Promise<TrustResult> {
    const flags: string[] = [];
    const startTime = Date.now();
    log.info({ did }, 'Starting agent verification');

    // 1. Resolve DID Document
    const resolution = await this.didManager.resolveDID(did);
    const identityValid = resolution.didDocument !== null;
    if (!identityValid) {
      flags.push('DID_NOT_FOUND');
      log.warn({ did }, 'DID not found');
    }

    // 2. Check verification level on-chain
    const address = didToAddress(did);
    let verificationLevel = VerificationLevel.Unverified;
    if (address) {
      try {
        const level = await this.contracts.reputation.getVerificationLevel(address as `0x${string}`);
        verificationLevel = Number(level) as VerificationLevel;
      } catch (err) {
        log.warn({ did, err }, 'Failed to read verification level from contract');
        flags.push('VERIFICATION_LEVEL_UNAVAILABLE');
      }
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

    // 6. Credential verification — cryptographic JWT signature check
    let credentialsValid = identityValid;
    if (options?.credentials && options.credentials.length > 0 && this.vcManager) {
      const vcResults = await this.verifyCredentials(options.credentials);
      credentialsValid = identityValid && vcResults.allValid;
      if (!vcResults.allValid) {
        flags.push('CREDENTIALS_INVALID');
        log.warn({ did, invalidCount: vcResults.invalid.length }, 'Some credentials failed verification');
      }
      log.info({ did, total: vcResults.total, valid: vcResults.validCount }, 'Credentials verified');
    } else if (options?.credentials && !this.vcManager) {
      // Credentials provided but no VCManager to verify them
      flags.push('VC_VERIFICATION_UNAVAILABLE');
      log.warn({ did }, 'Credentials provided but no VCManager available');
    }

    if (agentAge < 7) flags.push('NEW_AGENT');
    if (reviewCount === 0) flags.push('NO_REVIEWS');

    const duration = Date.now() - startTime;
    log.info({ did, verified: identityValid && credentialsValid, duration }, 'Verification complete');

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

  /**
   * Verify a set of Verifiable Credentials cryptographically.
   * Checks JWT signatures, issuer DID, and expiration.
   */
  async verifyCredentials(credentials: VerifiableCredential[]): Promise<{
    allValid: boolean;
    total: number;
    validCount: number;
    invalid: Array<{ index: number; error: string }>;
  }> {
    if (!this.vcManager) {
      return { allValid: false, total: credentials.length, validCount: 0, invalid: [{ index: 0, error: 'No VCManager available' }] };
    }

    const invalid: Array<{ index: number; error: string }> = [];
    let validCount = 0;

    for (let i = 0; i < credentials.length; i++) {
      const vc = credentials[i];
      try {
        const result = await this.vcManager.verifyCredential(vc);
        if (result.verified) {
          validCount++;
        } else {
          invalid.push({ index: i, error: result.error || 'Verification failed' });
        }
      } catch (err) {
        invalid.push({ index: i, error: err instanceof Error ? err.message : 'Unknown error' });
      }
    }

    return {
      allValid: invalid.length === 0,
      total: credentials.length,
      validCount,
      invalid,
    };
  }
}
