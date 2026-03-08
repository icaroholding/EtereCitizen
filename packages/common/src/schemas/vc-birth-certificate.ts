export const BIRTH_CERTIFICATE_CONTEXT = 'https://eterecitizen.ai/ns/vc/birth-certificate/v1';

export const BIRTH_CERTIFICATE_TYPE = 'EtereCitizenBirthCertificate';

export function createBirthCertificateTemplate(params: {
  id: string;
  issuerDID: string;
  subjectDID: string;
  name: string;
  network: string;
}) {
  return {
    '@context': [
      'https://www.w3.org/2018/credentials/v1',
      BIRTH_CERTIFICATE_CONTEXT,
    ],
    id: params.id,
    type: ['VerifiableCredential', BIRTH_CERTIFICATE_TYPE] as const,
    issuer: params.issuerDID,
    issuanceDate: new Date().toISOString(),
    credentialSubject: {
      id: params.subjectDID,
      name: params.name,
      createdAt: new Date().toISOString(),
      network: params.network,
      protocolVersion: '0.3',
    },
  };
}
