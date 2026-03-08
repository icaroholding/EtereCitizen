import { expect } from 'chai';
import { ethers } from 'hardhat';
import { CitizenReputation } from '../typechain-types';
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';

describe('CitizenReputation', function () {
  let reputation: CitizenReputation;
  let owner: HardhatEthersSigner;
  let reviewer: HardhatEthersSigner;
  let agent: HardhatEthersSigner;
  let verifier: HardhatEthersSigner;

  const REVIEW_HASH = ethers.keccak256(ethers.toUtf8Bytes('review-content'));
  const TX_HASH = ethers.keccak256(ethers.toUtf8Bytes('tx-hash'));
  const CATEGORY = 'code-generation';
  const REVIEW_FEE = ethers.parseEther('0.0001');

  beforeEach(async function () {
    [owner, reviewer, agent, verifier] = await ethers.getSigners();
    const factory = await ethers.getContractFactory('CitizenReputation');
    reputation = await factory.deploy();
    await reputation.waitForDeployment();
  });

  describe('Review Submission', function () {
    it('should submit a review successfully', async function () {
      const tx = await reputation.connect(reviewer).submitReview(
        agent.address, REVIEW_HASH, TX_HASH, CATEGORY, 5,
        { value: REVIEW_FEE },
      );
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt!.blockNumber);

      await expect(tx)
        .to.emit(reputation, 'ReviewSubmitted')
        .withArgs(reviewer.address, agent.address, REVIEW_HASH, CATEGORY, 5, block!.timestamp);

      expect(await reputation.getReviewCount(agent.address)).to.equal(1);
    });

    it('should reject review without fee', async function () {
      await expect(
        reputation.connect(reviewer).submitReview(agent.address, REVIEW_HASH, TX_HASH, CATEGORY, 5),
      ).to.be.revertedWith('Insufficient fee');
    });

    it('should accept review with excess fee', async function () {
      const excessFee = ethers.parseEther('0.001');
      await reputation.connect(reviewer).submitReview(
        agent.address, REVIEW_HASH, TX_HASH, CATEGORY, 5,
        { value: excessFee },
      );
      expect(await reputation.getReviewCount(agent.address)).to.equal(1);
    });

    it('should reject self-review', async function () {
      await expect(
        reputation.connect(reviewer).submitReview(
          reviewer.address, REVIEW_HASH, TX_HASH, CATEGORY, 5,
          { value: REVIEW_FEE },
        ),
      ).to.be.revertedWith('Cannot review yourself');
    });

    it('should reject invalid rating', async function () {
      await expect(
        reputation.connect(reviewer).submitReview(
          agent.address, REVIEW_HASH, TX_HASH, CATEGORY, 0,
          { value: REVIEW_FEE },
        ),
      ).to.be.revertedWith('Rating must be 1-5');

      await expect(
        reputation.connect(reviewer).submitReview(
          agent.address, REVIEW_HASH, TX_HASH, CATEGORY, 6,
          { value: REVIEW_FEE },
        ),
      ).to.be.revertedWith('Rating must be 1-5');
    });

    it('should enforce review cooldown', async function () {
      await reputation.connect(reviewer).submitReview(
        agent.address, REVIEW_HASH, TX_HASH, CATEGORY, 5,
        { value: REVIEW_FEE },
      );

      await expect(
        reputation.connect(reviewer).submitReview(
          agent.address, REVIEW_HASH, TX_HASH, CATEGORY, 4,
          { value: REVIEW_FEE },
        ),
      ).to.be.revertedWith('Review cooldown active');
    });

    it('should aggregate scores correctly', async function () {
      await reputation.connect(reviewer).submitReview(
        agent.address, REVIEW_HASH, TX_HASH, CATEGORY, 5,
        { value: REVIEW_FEE },
      );

      const txHash2 = ethers.keccak256(ethers.toUtf8Bytes('tx-hash-2'));
      await reputation.connect(owner).submitReview(
        agent.address, REVIEW_HASH, txHash2, CATEGORY, 3,
        { value: REVIEW_FEE },
      );

      const [totalScore, count] = await reputation.getAggregateScore(agent.address, CATEGORY);
      expect(totalScore).to.equal(8);
      expect(count).to.equal(2);
    });
  });

  describe('Review Retrieval', function () {
    it('should return reviews with pagination', async function () {
      await reputation.connect(reviewer).submitReview(
        agent.address, REVIEW_HASH, TX_HASH, CATEGORY, 5,
        { value: REVIEW_FEE },
      );

      const reviews = await reputation.getReviews(agent.address, 0, 10);
      expect(reviews.length).to.equal(1);
      expect(reviews[0].rating).to.equal(5);
      expect(reviews[0].category).to.equal(CATEGORY);
    });

    it('should return empty for out-of-range offset', async function () {
      const reviews = await reputation.getReviews(agent.address, 100, 10);
      expect(reviews.length).to.equal(0);
    });

    it('should track total tasks completed', async function () {
      await reputation.connect(reviewer).submitReview(
        agent.address, REVIEW_HASH, TX_HASH, CATEGORY, 5,
        { value: REVIEW_FEE },
      );
      expect(await reputation.getTotalTasksCompleted(agent.address)).to.equal(1);
    });
  });

  describe('Fees', function () {
    it('should collect fees in contract balance', async function () {
      await reputation.connect(reviewer).submitReview(
        agent.address, REVIEW_HASH, TX_HASH, CATEGORY, 5,
        { value: REVIEW_FEE },
      );

      const balance = await ethers.provider.getBalance(await reputation.getAddress());
      expect(balance).to.equal(REVIEW_FEE);
    });

    it('should allow owner to withdraw fees', async function () {
      await reputation.connect(reviewer).submitReview(
        agent.address, REVIEW_HASH, TX_HASH, CATEGORY, 5,
        { value: REVIEW_FEE },
      );

      const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);

      await expect(reputation.withdrawFees(owner.address))
        .to.emit(reputation, 'FeesWithdrawn')
        .withArgs(owner.address, REVIEW_FEE);

      const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);
      expect(ownerBalanceAfter).to.be.greaterThan(ownerBalanceBefore);
    });

    it('should reject withdrawal with no fees', async function () {
      await expect(reputation.withdrawFees(owner.address))
        .to.be.revertedWith('No fees to withdraw');
    });

    it('should reject withdrawal from non-owner', async function () {
      await reputation.connect(reviewer).submitReview(
        agent.address, REVIEW_HASH, TX_HASH, CATEGORY, 5,
        { value: REVIEW_FEE },
      );

      await expect(
        reputation.connect(reviewer).withdrawFees(reviewer.address),
      ).to.be.reverted;
    });

    it('should allow owner to update fee', async function () {
      const newFee = ethers.parseEther('0.0005');

      await expect(reputation.setReviewFee(newFee))
        .to.emit(reputation, 'ReviewFeeUpdated')
        .withArgs(REVIEW_FEE, newFee);

      expect(await reputation.reviewFee()).to.equal(newFee);
    });

    it('should allow owner to set fee to zero (free reviews)', async function () {
      await reputation.setReviewFee(0);
      expect(await reputation.reviewFee()).to.equal(0);

      // Review without payment should work now
      await reputation.connect(reviewer).submitReview(
        agent.address, REVIEW_HASH, TX_HASH, CATEGORY, 5,
      );
      expect(await reputation.getReviewCount(agent.address)).to.equal(1);
    });

    it('should reject fee update from non-owner', async function () {
      await expect(
        reputation.connect(reviewer).setReviewFee(0),
      ).to.be.reverted;
    });
  });

  describe('Verification Levels', function () {
    it('should allow owner to set verification level', async function () {
      await expect(reputation.setVerificationLevel(agent.address, 2))
        .to.emit(reputation, 'VerificationLevelSet')
        .withArgs(agent.address, 2, owner.address);

      expect(await reputation.getVerificationLevel(agent.address)).to.equal(2);
    });

    it('should allow authorized verifier to set level', async function () {
      await reputation.addVerifier(verifier.address);
      await reputation.connect(verifier).setVerificationLevel(agent.address, 1);
      expect(await reputation.getVerificationLevel(agent.address)).to.equal(1);
    });

    it('should reject unauthorized verifier', async function () {
      await expect(
        reputation.connect(reviewer).setVerificationLevel(agent.address, 1),
      ).to.be.revertedWith('Not authorized verifier');
    });

    it('should reject invalid level', async function () {
      await expect(reputation.setVerificationLevel(agent.address, 4)).to.be.revertedWith(
        'Invalid verification level',
      );
    });

    it('should manage verifiers', async function () {
      await reputation.addVerifier(verifier.address);
      expect(await reputation.authorizedVerifiers(verifier.address)).to.equal(true);

      await reputation.removeVerifier(verifier.address);
      expect(await reputation.authorizedVerifiers(verifier.address)).to.equal(false);
    });
  });
});
