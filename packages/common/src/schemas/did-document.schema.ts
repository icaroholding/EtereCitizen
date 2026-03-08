export const DID_DOCUMENT_CONTEXT = [
  'https://www.w3.org/ns/did/v1',
  'https://w3id.org/security/suites/secp256k1recovery-2020/v2',
  'https://eterecitizen.ai/ns/v1',
];

export const ETERECITIZEN_SERVICE_TYPE = 'EtereCitizenAgent';

export const ETERECITIZEN_METADATA_SERVICE_TYPE = 'EtereCitizenMetadata';

export function createAgentDIDDocumentTemplate(did: string) {
  return {
    '@context': DID_DOCUMENT_CONTEXT,
    id: did,
    verificationMethod: [],
    authentication: [],
    assertionMethod: [],
    service: [
      {
        id: `${did}#agent-service`,
        type: ETERECITIZEN_SERVICE_TYPE,
        serviceEndpoint: '',
      },
    ],
  };
}
