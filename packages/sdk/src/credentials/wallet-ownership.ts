import type { WalletOwnershipCredential } from '@eterecitizen/common';
import { WALLET_OWNERSHIP_CONTEXT, WALLET_OWNERSHIP_TYPE } from '@eterecitizen/common';
import { VCManager } from './vc-manager.js';
import { createHash } from 'crypto';

export class WalletOwnershipManager {
  private vcManager: VCManager;

  constructor(vcManager: VCManager) {
    this.vcManager = vcManager;
  }

  async issue(params: {
    issuerDID: string;
    subjectDID: string;
    walletProvider: string;
    challengeMessage: string;
    signature: string;
  }): Promise<WalletOwnershipCredential> {
    const challengeHash = createHash('sha256')
      .update(`${params.challengeMessage}:${params.signature}`)
      .digest('hex');

    const vc = await this.vcManager.issueCredential({
      issuerDID: params.issuerDID,
      type: [WALLET_OWNERSHIP_TYPE],
      context: [WALLET_OWNERSHIP_CONTEXT],
      credentialSubject: {
        id: params.subjectDID,
        walletProvider: params.walletProvider,
        connectedAt: new Date().toISOString(),
        challengeHash: `0x${challengeHash}`,
      },
    });

    return vc as unknown as WalletOwnershipCredential;
  }

  async verify(credential: WalletOwnershipCredential): Promise<boolean> {
    const result = await this.vcManager.verifyCredential(credential);
    return result.verified;
  }
}
