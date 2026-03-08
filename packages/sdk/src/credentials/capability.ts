import type { CapabilityCredential } from '@eterecitizen/common';
import { CAPABILITY_CONTEXT, CAPABILITY_TYPE } from '@eterecitizen/common';
import { VCManager } from './vc-manager.js';

export class CapabilityManager {
  private vcManager: VCManager;

  constructor(vcManager: VCManager) {
    this.vcManager = vcManager;
  }

  async issue(params: {
    issuerDID: string;
    subjectDID: string;
    capability: string;
    category: string;
  }): Promise<CapabilityCredential> {
    const vc = await this.vcManager.issueCredential({
      issuerDID: params.issuerDID,
      type: [CAPABILITY_TYPE],
      context: [CAPABILITY_CONTEXT],
      credentialSubject: {
        id: params.subjectDID,
        capability: params.capability,
        category: params.category,
        attestedBy: params.issuerDID,
        attestedAt: new Date().toISOString(),
      },
    });

    return vc as unknown as CapabilityCredential;
  }

  async verify(credential: CapabilityCredential): Promise<boolean> {
    const result = await this.vcManager.verifyCredential(credential);
    return result.verified;
  }
}
