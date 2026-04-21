import type { VerifiableCredential } from '@eterecitizen/common';
import type { VeramoAgent } from '../identity/veramo-config.js';

export class VCManager {
  private agent: VeramoAgent;

  constructor(agent: VeramoAgent) {
    this.agent = agent;
  }

  async issueCredential(params: {
    issuerDID: string;
    credentialSubject: Record<string, unknown>;
    type: string[];
    context?: string[];
    id?: string;
  }): Promise<VerifiableCredential> {
    const credential = await this.agent.createVerifiableCredential({
      credential: {
        issuer: { id: params.issuerDID },
        '@context': [
          'https://www.w3.org/2018/credentials/v1',
          ...(params.context || []),
        ],
        type: ['VerifiableCredential', ...params.type],
        issuanceDate: new Date().toISOString(),
        credentialSubject: params.credentialSubject,
        ...(params.id ? { id: params.id } : {}),
      },
      proofFormat: 'jwt',
    });

    return credential as unknown as VerifiableCredential;
  }

  async verifyCredential(credential: VerifiableCredential): Promise<{
    verified: boolean;
    error?: string;
  }> {
    try {
      const result = await this.agent.verifyCredential({
        credential: credential as any,
      });
      return { verified: result.verified };
    } catch (error) {
      return {
        verified: false,
        error: error instanceof Error ? error.message : 'Verification failed',
      };
    }
  }
}
