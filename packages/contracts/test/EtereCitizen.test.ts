import { expect } from 'chai';
import { ethers } from 'hardhat';
import { EtereCitizen } from '../typechain-types';
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';

describe('EtereCitizen', function () {
  let contract: EtereCitizen;
  let owner: HardhatEthersSigner;
  let agent1: HardhatEthersSigner;
  let agent2: HardhatEthersSigner;
  let verifier: HardhatEthersSigner;

  const REVIEW_HASH = ethers.keccak256(ethers.toUtf8Bytes('review-content'));
  const TX_HASH = ethers.keccak256(ethers.toUtf8Bytes('tx-hash'));
  const CATEGORY = 'code-generation';
  const REVIEW_FEE = ethers.parseEther('0.0001');

  beforeEach(async function () {
    [owner, agent1, agent2, verifier] = await ethers.getSigners();
    const factory = await ethers.getContractFactory('EtereCitizen');
    contract = await factory.deploy();
    await contract.waitForDeployment();
  });

  // ===================== Identity =====================

  describe('Agent Registration', function () {
    it('should register an agent with name and capabilities', async function () {
      const tx = await contract.connect(agent1).registerAgent('Aurora', ['code-generation', 'research']);
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt!.blockNumber);

      await expect(tx)
        .to.emit(contract, 'AgentRegistered')
        .withArgs(agent1.address, 'Aurora', block!.timestamp);

      const agent = await contract.getAgent(agent1.address);
      expect(agent.name).to.equal('Aurora');
      expect(agent.capabilities).to.deep.equal(['code-generation', 'research']);
      expect(agent.active).to.equal(true);
      expect(await contract.isRegistered(agent1.address)).to.equal(true);
      expect(await contract.totalAgents()).to.equal(1);
    });

    it('should reject duplicate registration', async function () {
      await contract.connect(agent1).registerAgent('Aurora', []);
      await expect(
        contract.connect(agent1).registerAgent('Aurora2', []),
      ).to.be.revertedWith('Already registered');
    });

    it('should reject empty name', async function () {
      await expect(
        contract.connect(agent1).registerAgent('', []),
      ).to.be.revertedWith('Name required');
    });

    it('should reject name longer than 64 chars', async function () {
      const longName = 'A'.repeat(65);
      await expect(
        contract.connect(agent1).registerAgent(longName, []),
      ).to.be.revertedWith('Name too long');
    });

    it('should register with empty capabilities', async function () {
      await contract.connect(agent1).registerAgent('MinimalAgent', []);
      const agent = await contract.getAgent(agent1.address);
      expect(agent.capabilities).to.deep.equal([]);
    });
  });

  describe('Agent Updates', function () {
    beforeEach(async function () {
      await contract.connect(agent1).registerAgent('Aurora', ['code-generation']);
    });

    it('should update agent name', async function () {
      await expect(contract.connect(agent1).updateAgent('Aurora v2'))
        .to.emit(contract, 'AgentUpdated')
        .withArgs(agent1.address, 'Aurora v2');

      const agent = await contract.getAgent(agent1.address);
      expect(agent.name).to.equal('Aurora v2');
    });

    it('should add a capability', async function () {
      await expect(contract.connect(agent1).addCapability('research'))
        .to.emit(contract, 'CapabilityAdded')
        .withArgs(agent1.address, 'research');

      const agent = await contract.getAgent(agent1.address);
      expect(agent.capabilities).to.deep.equal(['code-generation', 'research']);
    });

    it('should reject update from unregistered agent', async function () {
      await expect(
        contract.connect(agent2).updateAgent('Hacker'),
      ).to.be.revertedWith('Agent not registered');
    });

    it('should reject addCapability from unregistered agent', async function () {
      await expect(
        contract.connect(agent2).addCapability('hacking'),
      ).to.be.revertedWith('Agent not registered');
    });

    it('should enforce capability limit', async function () {
      // Register with max capabilities
      const caps = Array.from({ length: 50 }, (_, i) => `cap-${i}`);
      await contract.connect(agent2).registerAgent('FullAgent', caps);

      await expect(
        contract.connect(agent2).addCapability('one-more'),
      ).to.be.revertedWith('Too many capabilities');
    });

    it('should deactivate an agent', async function () {
      await expect(contract.connect(agent1).deactivateAgent())
        .to.emit(contract, 'AgentDeactivated')
        .withArgs(agent1.address);

      const agent = await contract.getAgent(agent1.address);
      expect(agent.active).to.equal(false);
    });
  });

  describe('Unregistered Agent Lookup', function () {
    it('should return empty data for unregistered agent', async function () {
      const agent = await contract.getAgent(agent2.address);
      expect(agent.name).to.equal('');
      expect(agent.capabilities).to.deep.equal([]);
      expect(agent.active).to.equal(false);
      expect(await contract.isRegistered(agent2.address)).to.equal(false);
    });
  });

  // ===================== Reputation =====================

  describe('Review Submission', function () {
    it('should submit a review successfully', async function () {
      const tx = await contract.connect(agent1).submitReview(
        agent2.address, REVIEW_HASH, TX_HASH, CATEGORY, 5,
        { value: REVIEW_FEE },
      );
      await tx.wait();

      expect(await contract.getReviewCount(agent2.address)).to.equal(1);
    });

    it('should reject review without fee', async function () {
      await expect(
        contract.connect(agent1).submitReview(agent2.address, REVIEW_HASH, TX_HASH, CATEGORY, 5),
      ).to.be.revertedWith('Insufficient fee');
    });

    it('should reject self-review', async function () {
      await expect(
        contract.connect(agent1).submitReview(
          agent1.address, REVIEW_HASH, TX_HASH, CATEGORY, 5,
          { value: REVIEW_FEE },
        ),
      ).to.be.revertedWith('Cannot review yourself');
    });

    it('should reject invalid rating', async function () {
      await expect(
        contract.connect(agent1).submitReview(
          agent2.address, REVIEW_HASH, TX_HASH, CATEGORY, 0,
          { value: REVIEW_FEE },
        ),
      ).to.be.revertedWith('Rating must be 1-5');
    });

    it('should enforce review cooldown', async function () {
      await contract.connect(agent1).submitReview(
        agent2.address, REVIEW_HASH, TX_HASH, CATEGORY, 5,
        { value: REVIEW_FEE },
      );

      const txHash2 = ethers.keccak256(ethers.toUtf8Bytes('tx-hash-cooldown'));
      await expect(
        contract.connect(agent1).submitReview(
          agent2.address, REVIEW_HASH, txHash2, CATEGORY, 4,
          { value: REVIEW_FEE },
        ),
      ).to.be.revertedWith('Review cooldown active');
    });

    it('should reject duplicate txHash', async function () {
      await contract.connect(agent1).submitReview(
        agent2.address, REVIEW_HASH, TX_HASH, CATEGORY, 5,
        { value: REVIEW_FEE },
      );

      // Different reviewer, same txHash → should be rejected
      await expect(
        contract.connect(owner).submitReview(
          agent2.address, REVIEW_HASH, TX_HASH, CATEGORY, 4,
          { value: REVIEW_FEE },
        ),
      ).to.be.revertedWith('Transaction already reviewed');
    });

    it('should refund excess ETH', async function () {
      const excessFee = ethers.parseEther('0.001'); // 10x the fee
      const balanceBefore = await ethers.provider.getBalance(agent1.address);

      const tx = await contract.connect(agent1).submitReview(
        agent2.address, REVIEW_HASH, TX_HASH, CATEGORY, 5,
        { value: excessFee },
      );
      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;

      const balanceAfter = await ethers.provider.getBalance(agent1.address);
      // Agent should only have paid REVIEW_FEE + gas, not the full excessFee
      const actualPaid = balanceBefore - balanceAfter - gasUsed;
      expect(actualPaid).to.equal(REVIEW_FEE);
    });

    it('should aggregate scores correctly', async function () {
      const txHash1 = ethers.keccak256(ethers.toUtf8Bytes('tx-hash-agg-1'));
      await contract.connect(agent1).submitReview(
        agent2.address, REVIEW_HASH, txHash1, CATEGORY, 5,
        { value: REVIEW_FEE },
      );

      const txHash2 = ethers.keccak256(ethers.toUtf8Bytes('tx-hash-agg-2'));
      await contract.connect(owner).submitReview(
        agent2.address, REVIEW_HASH, txHash2, CATEGORY, 3,
        { value: REVIEW_FEE },
      );

      const [totalScore, count] = await contract.getAggregateScore(agent2.address, CATEGORY);
      expect(totalScore).to.equal(8);
      expect(count).to.equal(2);
    });
  });

  describe('Review Retrieval', function () {
    it('should return reviews with pagination', async function () {
      const retTxHash = ethers.keccak256(ethers.toUtf8Bytes('tx-retrieval'));
      await contract.connect(agent1).submitReview(
        agent2.address, REVIEW_HASH, retTxHash, CATEGORY, 5,
        { value: REVIEW_FEE },
      );

      const reviews = await contract.getReviews(agent2.address, 0, 10);
      expect(reviews.length).to.equal(1);
      expect(reviews[0].rating).to.equal(5);
      expect(reviews[0].category).to.equal(CATEGORY);
    });

    it('should return empty for out-of-range offset', async function () {
      const reviews = await contract.getReviews(agent2.address, 100, 10);
      expect(reviews.length).to.equal(0);
    });
  });

  describe('Fees', function () {
    it('should collect fees', async function () {
      const feeTxHash = ethers.keccak256(ethers.toUtf8Bytes('tx-fee-collect'));
      await contract.connect(agent1).submitReview(
        agent2.address, REVIEW_HASH, feeTxHash, CATEGORY, 5,
        { value: REVIEW_FEE },
      );

      const balance = await ethers.provider.getBalance(await contract.getAddress());
      expect(balance).to.equal(REVIEW_FEE);
    });

    it('should allow owner to withdraw fees', async function () {
      const feeTxHash = ethers.keccak256(ethers.toUtf8Bytes('tx-fee-withdraw'));
      await contract.connect(agent1).submitReview(
        agent2.address, REVIEW_HASH, feeTxHash, CATEGORY, 5,
        { value: REVIEW_FEE },
      );

      await expect(contract.withdrawFees(owner.address))
        .to.emit(contract, 'FeesWithdrawn')
        .withArgs(owner.address, REVIEW_FEE);
    });

    it('should reject withdrawal from non-owner', async function () {
      const feeTxHash = ethers.keccak256(ethers.toUtf8Bytes('tx-fee-reject'));
      await contract.connect(agent1).submitReview(
        agent2.address, REVIEW_HASH, feeTxHash, CATEGORY, 5,
        { value: REVIEW_FEE },
      );

      await expect(
        contract.connect(agent1).withdrawFees(agent1.address),
      ).to.be.reverted;
    });

    it('should reject withdrawal to zero address', async function () {
      const feeTxHash = ethers.keccak256(ethers.toUtf8Bytes('tx-fee-zero'));
      await contract.connect(agent1).submitReview(
        agent2.address, REVIEW_HASH, feeTxHash, CATEGORY, 5,
        { value: REVIEW_FEE },
      );

      await expect(
        contract.withdrawFees(ethers.ZeroAddress),
      ).to.be.revertedWith('Invalid recipient');
    });
  });

  describe('Verification Levels', function () {
    it('should allow owner to set verification level', async function () {
      await expect(contract.setVerificationLevel(agent1.address, 2))
        .to.emit(contract, 'VerificationLevelSet')
        .withArgs(agent1.address, 2, owner.address);

      expect(await contract.getVerificationLevel(agent1.address)).to.equal(2);
    });

    it('should allow authorized verifier', async function () {
      await contract.addVerifier(verifier.address);
      await contract.connect(verifier).setVerificationLevel(agent1.address, 1);
      expect(await contract.getVerificationLevel(agent1.address)).to.equal(1);
    });

    it('should reject unauthorized verifier', async function () {
      await expect(
        contract.connect(agent1).setVerificationLevel(agent2.address, 1),
      ).to.be.revertedWith('Not authorized verifier');
    });

    it('should reject invalid level', async function () {
      await expect(contract.setVerificationLevel(agent1.address, 4))
        .to.be.revertedWith('Invalid verification level');
    });
  });

  // ===================== Integration =====================

  describe('Full Flow: Register + Review + Verify', function () {
    it('should handle complete agent lifecycle', async function () {
      // 1. Register agents
      await contract.connect(agent1).registerAgent('Aurora', ['code-generation']);
      await contract.connect(agent2).registerAgent('Atlas', ['research', 'analysis']);

      // 2. Submit review
      const integrationTxHash = ethers.keccak256(ethers.toUtf8Bytes('tx-integration'));
      await contract.connect(agent1).submitReview(
        agent2.address, REVIEW_HASH, integrationTxHash, CATEGORY, 5,
        { value: REVIEW_FEE },
      );

      // 3. Set verification level
      await contract.setVerificationLevel(agent2.address, 1);

      // 4. Verify full state
      const identity = await contract.getAgent(agent2.address);
      expect(identity.name).to.equal('Atlas');
      expect(identity.capabilities).to.deep.equal(['research', 'analysis']);
      expect(identity.active).to.equal(true);

      expect(await contract.getVerificationLevel(agent2.address)).to.equal(1);
      expect(await contract.getReviewCount(agent2.address)).to.equal(1);
      expect(await contract.isRegistered(agent2.address)).to.equal(true);
      expect(await contract.totalAgents()).to.equal(2);
    });
  });

  // Helper
  async function getBlockTimestamp(): Promise<number> {
    const block = await ethers.provider.getBlock('latest');
    return block!.timestamp;
  }
});
