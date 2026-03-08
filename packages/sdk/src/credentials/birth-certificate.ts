import type { BirthCertificateCredential } from '@eterecitizen/common';
import { BIRTH_CERTIFICATE_CONTEXT, BIRTH_CERTIFICATE_TYPE } from '@eterecitizen/common';
import { VCManager } from './vc-manager.js';

export class BirthCertificateManager {
  private vcManager: VCManager;

  constructor(vcManager: VCManager) {
    this.vcManager = vcManager;
  }

  async issue(params: {
    issuerDID: string;
    subjectDID: string;
    name: string;
    network: string;
  }): Promise<BirthCertificateCredential> {
    const vc = await this.vcManager.issueCredential({
      issuerDID: params.issuerDID,
      type: [BIRTH_CERTIFICATE_TYPE],
      context: [BIRTH_CERTIFICATE_CONTEXT],
      credentialSubject: {
        id: params.subjectDID,
        name: params.name,
        createdAt: new Date().toISOString(),
        network: params.network,
        protocolVersion: '0.3',
      },
    });

    return vc as unknown as BirthCertificateCredential;
  }

  async verify(credential: BirthCertificateCredential): Promise<boolean> {
    const result = await this.vcManager.verifyCredential(credential);
    return result.verified;
  }
}
