export const WORK_HISTORY_CONTEXT = 'https://eterecitizen.ai/ns/vc/work-history/v1';

export const WORK_HISTORY_TYPE = 'EtereCitizenWorkHistory';

export function createWorkHistoryTemplate(params: {
  id: string;
  issuerDID: string;
  subjectDID: string;
  taskDescription: string;
  category: string;
  rating: number;
  transactionHash: string;
  reviewerDID: string;
  comment?: string;
}) {
  return {
    '@context': [
      'https://www.w3.org/2018/credentials/v1',
      WORK_HISTORY_CONTEXT,
    ],
    id: params.id,
    type: ['VerifiableCredential', WORK_HISTORY_TYPE] as const,
    issuer: params.issuerDID,
    issuanceDate: new Date().toISOString(),
    credentialSubject: {
      id: params.subjectDID,
      taskDescription: params.taskDescription,
      category: params.category,
      rating: params.rating,
      transactionHash: params.transactionHash,
      completedAt: new Date().toISOString(),
      reviewerDID: params.reviewerDID,
      comment: params.comment,
    },
  };
}
