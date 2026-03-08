export const CAPABILITY_CONTEXT = 'https://eterecitizen.ai/ns/vc/capability/v1';

export const CAPABILITY_TYPE = 'EtereCitizenCapability';

export function createCapabilityTemplate(params: {
  id: string;
  issuerDID: string;
  subjectDID: string;
  capability: string;
  category: string;
}) {
  return {
    '@context': [
      'https://www.w3.org/2018/credentials/v1',
      CAPABILITY_CONTEXT,
    ],
    id: params.id,
    type: ['VerifiableCredential', CAPABILITY_TYPE] as const,
    issuer: params.issuerDID,
    issuanceDate: new Date().toISOString(),
    credentialSubject: {
      id: params.subjectDID,
      capability: params.capability,
      category: params.category,
    },
  };
}
