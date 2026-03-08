import type { VerifiableCredential, VerifiablePresentation, PresentationConfig } from '@eterecitizen/common';

export class PresentationManager {
  async createPresentation(params: {
    holderDID: string;
    credentials: VerifiableCredential[];
    config?: PresentationConfig;
  }): Promise<VerifiablePresentation> {
    let selectedCredentials = params.credentials;

    // Selective disclosure: filter credentials by requested fields
    if (params.config?.fields && params.config.fields.length > 0) {
      const requestedTypes = new Set(params.config.fields);
      selectedCredentials = params.credentials.filter((vc) =>
        vc.type.some((t) => requestedTypes.has(t) || t === 'VerifiableCredential'),
      );
    }

    return {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiablePresentation'],
      holder: params.holderDID,
      verifiableCredential: selectedCredentials,
    };
  }

  async verifyPresentation(presentation: VerifiablePresentation): Promise<{
    verified: boolean;
    holder: string;
    credentialCount: number;
  }> {
    // Basic structural verification
    const isValid =
      presentation.type.includes('VerifiablePresentation') &&
      typeof presentation.holder === 'string' &&
      Array.isArray(presentation.verifiableCredential);

    return {
      verified: isValid,
      holder: presentation.holder,
      credentialCount: presentation.verifiableCredential.length,
    };
  }
}
