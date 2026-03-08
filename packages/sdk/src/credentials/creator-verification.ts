import type { CreatorVerificationCredential } from '@eterecitizen/common';
import { CREATOR_VERIFICATION_CONTEXT, CREATOR_VERIFICATION_TYPE, VerificationLevel } from '@eterecitizen/common';
import { VCManager } from './vc-manager.js';

export class CreatorVerificationManager {
  private vcManager: VCManager;

  constructor(vcManager: VCManager) {
    this.vcManager = vcManager;
  }

  async issue(params: {
    issuerDID: string;
    subjectDID: string;
    creatorDID: string;
    verificationLevel: VerificationLevel;
    verificationMethod: string;
  }): Promise<CreatorVerificationCredential> {
    const vc = await this.vcManager.issueCredential({
      issuerDID: params.issuerDID,
      type: [CREATOR_VERIFICATION_TYPE],
      context: [CREATOR_VERIFICATION_CONTEXT],
      credentialSubject: {
        id: params.subjectDID,
        creatorDID: params.creatorDID,
        verificationLevel: params.verificationLevel,
        verifiedAt: new Date().toISOString(),
        verificationMethod: params.verificationMethod,
      },
    });

    return vc as unknown as CreatorVerificationCredential;
  }

  async verifyDomainLevel(domain: string): Promise<boolean> {
    // Level 1: Verify via DNS TXT record
    // Look for TXT record: _eterecitizen.domain.com -> did:ethr:...
    try {
      const { resolve } = await import('dns/promises');
      const records = await resolve(domain, 'TXT');
      return records.some((record) =>
        record.some((txt) => txt.startsWith('eterecitizen-did=')),
      );
    } catch {
      return false;
    }
  }

  async verify(credential: CreatorVerificationCredential): Promise<boolean> {
    const result = await this.vcManager.verifyCredential(credential);
    return result.verified;
  }
}
