export const CREATOR_VERIFICATION_CONTEXT = 'https://eterecitizen.ai/ns/vc/creator-verification/v1';

export const CREATOR_VERIFICATION_TYPE = 'EtereCitizenCreatorVerification';

export function createCreatorVerificationTemplate(params: {
  id: string;
  issuerDID: string;
  subjectDID: string;
  creatorDID: string;
  verificationLevel: number;
  verificationMethod: string;
}) {
  return {
    '@context': [
      'https://www.w3.org/2018/credentials/v1',
      CREATOR_VERIFICATION_CONTEXT,
    ],
    id: params.id,
    type: ['VerifiableCredential', CREATOR_VERIFICATION_TYPE] as const,
    issuer: params.issuerDID,
    issuanceDate: new Date().toISOString(),
    credentialSubject: {
      id: params.subjectDID,
      creatorDID: params.creatorDID,
      verificationLevel: params.verificationLevel,
      verifiedAt: new Date().toISOString(),
      verificationMethod: params.verificationMethod,
    },
  };
}
