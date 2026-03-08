export const COMPLIANCE_CONTEXT = 'https://eterecitizen.ai/ns/vc/compliance/v1';

export const COMPLIANCE_TYPE = 'EtereCitizenCompliance';

export function createComplianceTemplate(params: {
  id: string;
  issuerDID: string;
  subjectDID: string;
  standard: string;
  issuedBy: string;
  validUntil: string;
  scope: string;
}) {
  return {
    '@context': [
      'https://www.w3.org/2018/credentials/v1',
      COMPLIANCE_CONTEXT,
    ],
    id: params.id,
    type: ['VerifiableCredential', COMPLIANCE_TYPE] as const,
    issuer: params.issuerDID,
    issuanceDate: new Date().toISOString(),
    credentialSubject: {
      id: params.subjectDID,
      standard: params.standard,
      issuedBy: params.issuedBy,
      validUntil: params.validUntil,
      scope: params.scope,
    },
  };
}
