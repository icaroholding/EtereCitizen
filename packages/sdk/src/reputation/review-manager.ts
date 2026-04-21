import { createHash } from 'crypto';
import type { ReviewInput } from '@eterecitizen/common';
import { didToAddress, reviewInputSchema } from '@eterecitizen/common';
import type { ContractClients } from '../blockchain/contract-clients.js';
import { IPFSStorage } from '../identity/ipfs-storage.js';
import { VCManager } from '../credentials/vc-manager.js';
import { WORK_HISTORY_TYPE, WORK_HISTORY_CONTEXT } from '@eterecitizen/common';

export class ReviewManager {
  private contracts: ContractClients;
  private ipfs: IPFSStorage;
  private vcManager: VCManager;

  constructor(contracts: ContractClients, ipfs: IPFSStorage, vcManager: VCManager) {
    this.contracts = contracts;
    this.ipfs = ipfs;
    this.vcManager = vcManager;
  }

  async submitReview(params: {
    reviewerDID: string;
    reviewedDID: string;
    input: ReviewInput;
  }): Promise<{ reviewHash: string; cid: string }> {
    // Validate input
    reviewInputSchema.parse(params.input);

    const reviewedAddress = didToAddress(params.reviewedDID);
    if (!reviewedAddress) throw new Error(`Invalid reviewed DID: ${params.reviewedDID}`);

    // 1. Create the Review VC
    const reviewVC = await this.vcManager.issueCredential({
      issuerDID: params.reviewerDID,
      type: [WORK_HISTORY_TYPE],
      context: [WORK_HISTORY_CONTEXT],
      credentialSubject: {
        id: params.reviewedDID,
        reviewerDID: params.reviewerDID,
        transactionHash: params.input.transactionHash,
        category: params.input.category,
        rating: params.input.rating,
        comment: params.input.comment,
        completedAt: new Date().toISOString(),
      },
    });

    // 2. Upload VC to IPFS
    const cid = await this.ipfs.uploadJSON(reviewVC);

    // 3. Hash the review for on-chain storage
    const reviewHash = `0x${createHash('sha256').update(JSON.stringify(reviewVC)).digest('hex')}` as `0x${string}`;
    const txHash = params.input.transactionHash as `0x${string}`;

    // 4. Submit hash + score on-chain
    await this.contracts.reputation.submitReview(
      reviewedAddress as `0x${string}`,
      reviewHash,
      txHash,
      params.input.category,
      params.input.rating,
    );

    return { reviewHash, cid };
  }
}
