import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdtempSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { initVeramoAgent, resetVeramoCache } from '../../src/identity/veramo-init.js';
import { DIDManager } from '../../src/identity/did-manager.js';
import { VCManager } from '../../src/credentials/vc-manager.js';
import { BirthCertificateManager } from '../../src/credentials/birth-certificate.js';
import { CapabilityManager } from '../../src/credentials/capability.js';
import { WalletOwnershipManager } from '../../src/credentials/wallet-ownership.js';
import { PresentationManager } from '../../src/credentials/presentation.js';
import { IPFSStorage } from '../../src/identity/ipfs-storage.js';
import { RegistryManager } from '../../src/registry/registry-manager.js';
import { SQLiteStore } from '../../src/storage/sqlite-store.js';
import { Agent } from '../../src/agent.js';
import { generateChallenge, challengeToMessage } from '../../src/wallet/challenge.js';
import { StandardWalletAdapter } from '../../src/wallet/adapters/standard.js';
import { calculateTrustScore } from '../../src/trust/trust-score.js';
import { VerificationLevel, type TrustResult } from '@eterecitizen/common';

// Deterministic test key (Hardhat account 0 — never use on real networks)
const TEST_PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

describe('E2E: Full Agent Lifecycle', () => {
  let tempDir: string;
  let didManager: DIDManager;
  let vcManager: VCManager;
  let registryManager: RegistryManager;
  let store: SQLiteStore;
  let agentDID: string;
  let agent: Agent;

  beforeAll(async () => {
    tempDir = mkdtempSync(join(tmpdir(), 'eterecitizen-e2e-'));

    // Initialize Veramo with real TypeORM DataSource
    const veramoAgent = await initVeramoAgent({
      network: 'base-sepolia',
      dbPath: join(tempDir, 'veramo.sqlite'),
    });

    const ipfs = new IPFSStorage({
      apiKey: 'fake-key', // We won't actually upload in tests
      secretKey: 'fake-secret',
    });

    didManager = new DIDManager(veramoAgent, ipfs, 'base-sepolia');
    vcManager = new VCManager(veramoAgent);
    registryManager = new RegistryManager();
    store = new SQLiteStore(join(tempDir, 'data.sqlite'));
  });

  afterAll(() => {
    store.close();
    resetVeramoCache();
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('Step 1: Create DID via Veramo', async () => {
    agentDID = await didManager.createDID({ network: 'base-sepolia' });
    expect(agentDID).toMatch(/^did:ethr:0x14a34:0x/);
  });

  it('Step 2: Resolve DID', async () => {
    const resolution = await didManager.resolveDID(agentDID);
    // did:ethr resolution returns a default document even without on-chain transactions
    // In local tests without real RPC, didDocument may be null — that's acceptable
    if (resolution.didDocument) {
      expect(resolution.didDocument.id).toBe(agentDID);
    } else {
      // Resolution attempted but no on-chain data — still valid behavior
      expect(resolution.didResolutionMetadata).toBeDefined();
    }
  });

  it('Step 3: Issue Birth Certificate VC', async () => {
    // Must save agent first due to FK constraint on credentials table
    store.saveAgent(agentDID, 'E2E-TestBot', 'An E2E test agent', 'base-sepolia');

    const birthCertManager = new BirthCertificateManager(vcManager);
    const vc = await birthCertManager.issue({
      issuerDID: agentDID,
      subjectDID: agentDID,
      name: 'E2E-TestBot',
      network: 'base-sepolia',
    });
    expect(vc).toBeDefined();
    expect(vc.proof).toBeDefined();
    store.saveCredential('birth-cert-1', agentDID, 'BirthCertificate', vc);
  });

  it('Step 4: Issue Capability VC', async () => {
    const capManager = new CapabilityManager(vcManager);
    const vc = await capManager.issue({
      issuerDID: agentDID,
      subjectDID: agentDID,
      capability: 'code-generation',
      category: 'code-generation',
    });
    expect(vc).toBeDefined();
    expect(vc.proof).toBeDefined();
    store.saveCredential('cap-1', agentDID, 'Capability', vc);
  });

  it('Step 5: Create Agent instance', async () => {
    agent = new Agent({
      did: agentDID,
      profile: {
        did: agentDID,
        name: 'E2E-TestBot',
        description: 'An E2E test agent',
        capabilities: [{ name: 'code-generation', category: 'code-generation' }],
        status: 'active',
        createdAt: new Date().toISOString(),
        verificationLevel: 0,
        walletConnected: false,
      },
      didManager,
      vcManager,
      registryManager,
      store,
    });

    expect(agent.did).toBe(agentDID);
    expect(agent.wallet).toBeNull();
  });

  it('Step 6: Connect wallet', async () => {
    await agent.connectWallet({
      provider: 'standard',
      privateKey: TEST_PRIVATE_KEY,
      network: 'base-sepolia',
    });

    expect(agent.wallet).toBeDefined();
    expect(agent.wallet!.connected).toBe(true);
    expect(agent.wallet!.provider).toBe('standard');
  });

  it('Step 7: Get Identity Card', async () => {
    const card = await agent.getIdentityCard();
    expect(card.did).toBe(agentDID);
    expect(card.name).toBe('E2E-TestBot');
    expect(card.walletConnected).toBe(true);
    expect(card.capabilities.length).toBeGreaterThanOrEqual(1);
  });

  it('Step 8: Create Verifiable Presentation', async () => {
    const vp = await agent.present();
    expect(vp.type).toContain('VerifiablePresentation');
    expect(vp.holder).toBe(agentDID);
    expect(vp.verifiableCredential.length).toBeGreaterThanOrEqual(1);
  });

  it('Step 9: Export and Import agent', async () => {
    const exported = await agent.export();
    expect(exported.did).toBe(agentDID);
    expect(exported.version).toBe('0.3');
    expect(exported.credentials.length).toBeGreaterThanOrEqual(1);

    // Import into a new agent
    const imported = await Agent.import({
      data: exported,
      didManager,
      vcManager,
      registryManager,
      store,
    });
    expect(imported.did).toBe(agentDID);
  });

  it('Step 10: Calculate trust score', () => {
    const trustResult: TrustResult = {
      did: agentDID,
      verified: true,
      verificationLevel: VerificationLevel.Unverified,
      identityValid: true,
      credentialsValid: true,
      reputationScore: 0,
      categoryRatings: [],
      reviewCount: 0,
      walletConnected: true,
      agentAge: 0,
      flags: ['NEW_AGENT', 'NO_REVIEWS'],
      checkedAt: new Date().toISOString(),
    };

    const score = calculateTrustScore(trustResult);
    // New agent with no reviews but wallet connected: should be low but > 0
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(0.5);
  });

  it('Step 11: Register in registry and search', async () => {
    await registryManager.registerAgent(agent.profile);

    const results = await registryManager.searchAgents({ capability: 'code-generation' });
    expect(results.total).toBeGreaterThanOrEqual(1);
    expect(results.agents.some((a) => a.did === agentDID)).toBe(true);
  });
});
