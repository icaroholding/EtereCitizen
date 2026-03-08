import type { WorkHistoryCredential } from '@eterecitizen/common';
import { WORK_HISTORY_CONTEXT, WORK_HISTORY_TYPE } from '@eterecitizen/common';
import { VCManager } from './vc-manager.js';

export class WorkHistoryManager {
  private vcManager: VCManager;

  constructor(vcManager: VCManager) {
    this.vcManager = vcManager;
  }

  async issue(params: {
    issuerDID: string;
    subjectDID: string;
    taskDescription: string;
    category: string;
    rating: number;
    transactionHash: string;
    reviewerDID: string;
    comment?: string;
  }): Promise<WorkHistoryCredential> {
    const vc = await this.vcManager.issueCredential({
      issuerDID: params.issuerDID,
      type: [WORK_HISTORY_TYPE],
      context: [WORK_HISTORY_CONTEXT],
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
    });

    return vc as unknown as WorkHistoryCredential;
  }

  async verify(credential: WorkHistoryCredential): Promise<boolean> {
    const result = await this.vcManager.verifyCredential(credential);
    return result.verified;
  }
}
