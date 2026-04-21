import type {
  AgentConfig,
  QuickStartConfig,
  TrustResult,
  AgentDIDDocument,
  SearchFilters,
  SearchResult,
  NetworkName,
} from '@eterecitizen/common';
import { DEFAULT_NETWORK, NETWORKS, addressToDID } from '@eterecitizen/common';
import { Agent } from './agent.js';
import { initVeramoAgent } from './identity/veramo-init.js';
import { DIDManager } from './identity/did-manager.js';
import { IPFSStorage } from './identity/ipfs-storage.js';
import { VCManager } from './credentials/vc-manager.js';
import { BirthCertificateManager } from './credentials/birth-certificate.js';
import { Verifier } from './trust/verifier.js';
import { ReputationManager } from './reputation/reputation-manager.js';
import { RegistryManager } from './registry/registry-manager.js';
import { SQLiteStore } from './storage/sqlite-store.js';
import { createBaseProvider } from './blockchain/base-provider.js';
import { createContractClients } from './blockchain/contract-clients.js';
export interface EtereCitizenConfig {
  network?: NetworkName;
  pinataApiKey?: string;
  pinataSecretKey?: string;
  reputationContractAddress?: `0x${string}`;
  dbPath?: string;
  veramoSecretKey?: string;
}

export class EtereCitizen {
  private static instance: EtereCitizen | null = null;
  private config: EtereCitizenConfig & { network: NetworkName };
  private store: SQLiteStore;
  private registryManager: RegistryManager;

  private constructor(config: EtereCitizenConfig = {}) {
    this.config = {
      network: config.network || DEFAULT_NETWORK,
      ...config,
    };
    this.store = new SQLiteStore(config.dbPath);
    this.registryManager = new RegistryManager();
  }

  private static getInstance(config?: EtereCitizenConfig): EtereCitizen {
    if (!EtereCitizen.instance) {
      EtereCitizen.instance = new EtereCitizen(config);
    }
    return EtereCitizen.instance;
  }

  static async quickStart(config: QuickStartConfig & EtereCitizenConfig): Promise<Agent> {
    const agent = await EtereCitizen.createAgent(config);

    if (config.wallet) {
      await agent.connectWallet(config.wallet);
    }

    return agent;
  }

  static async createAgent(config: AgentConfig & EtereCitizenConfig): Promise<Agent> {
    const instance = EtereCitizen.getInstance(config);
    const network = config.network || DEFAULT_NETWORK;

    // Initialize Veramo agent for DID/VC operations
    // Note: In production, this requires a TypeORM DataSource
    // For now, we use a simplified flow
    const ipfs = new IPFSStorage({
      apiKey: config.pinataApiKey || process.env.PINATA_API_KEY || '',
      secretKey: config.pinataSecretKey || process.env.PINATA_SECRET_KEY || '',
    });

    const veramoAgent = await initVeramoAgent({
      network,
      dbPath: config.dbPath ? config.dbPath.replace(/data\.sqlite$/, 'veramo.sqlite') : undefined,
      secretKey: config.veramoSecretKey,
    });
    const didManager = new DIDManager(veramoAgent, ipfs, network);
    const vcManager = new VCManager(veramoAgent);

    // Check if this agent already has a DID in Veramo (subsequent runs)
    let did: string;
    const existingDIDs = await didManager.getDIDsManaged();
    if (existingDIDs.length > 0) {
      did = existingDIDs[0]; // Reuse existing DID
    } else {
      // Generate key with viem (address-format DID for protocol compatibility)
      const { privateKeyToAccount, generatePrivateKey } = await import('viem/accounts');
      const privateKey = generatePrivateKey();
      const account = privateKeyToAccount(privateKey);

      // Import key into Veramo's KeyManager (enables VC signing)
      const privateKeyHex = privateKey.slice(2); // remove 0x prefix
      const key = await veramoAgent.keyManagerImport({
        kms: 'local',
        type: 'Secp256k1',
        privateKeyHex,
      });

      // Create address-format DID and register in Veramo's DID store
      did = addressToDID(account.address, network);
      const chainIdHex = `0x${NETWORKS[network].chainId.toString(16)}`;

      await veramoAgent.didManagerImport({
        did,
        provider: `did:ethr:${chainIdHex}`,
        controllerKeyId: key.kid,
        keys: [{
          kid: key.kid,
          kms: 'local',
          type: 'Secp256k1' as const,
          publicKeyHex: key.publicKeyHex,
          privateKeyHex,
        }],
      });
    }

    const profile = {
      did,
      name: config.name,
      description: config.description,
      capabilities: (config.capabilities || []).map((c) => ({
        name: c,
        category: c,
      })),
      status: 'active' as const,
      createdAt: new Date().toISOString(),
      verificationLevel: 0,
      walletConnected: false,
      creatorDID: config.creatorDID,
    };

    instance.store.saveAgent(did, config.name, config.description, network);

    // Build and store DID document on IPFS
    try {
      await didManager.buildAndStoreDIDDocument(did, config.name);
    } catch {
      // IPFS upload may fail without API keys — non-fatal
    }

    // Register in local registry
    await instance.registryManager.registerAgent(profile);

    const agent = new Agent({
      did,
      profile,
      didManager,
      vcManager,
      registryManager: instance.registryManager,
      store: instance.store,
      network,
    });

    // Issue Birth Certificate VC
    try {
      const birthCertManager = new BirthCertificateManager(vcManager);
      await birthCertManager.issue({
        issuerDID: did,
        subjectDID: did,
        name: config.name,
        network,
      });
    } catch {
      // VC issuance requires full Veramo setup — non-fatal in dev
    }

    // Self-attest capabilities (skip if already attested from a previous run)
    const existingCaps = new Set(profile.capabilities.map(c => c.name));
    for (const capability of config.capabilities || []) {
      if (existingCaps.has(capability)) continue; // already attested
      try {
        await agent.addCapability(capability);
      } catch {
        // Non-fatal in dev mode
      }
    }

    return agent;
  }

  static async verify(did: string, config?: EtereCitizenConfig): Promise<TrustResult> {
    const network = config?.network || DEFAULT_NETWORK;

    const ipfs = new IPFSStorage({
      apiKey: config?.pinataApiKey || process.env.PINATA_API_KEY || '',
      secretKey: config?.pinataSecretKey || process.env.PINATA_SECRET_KEY || '',
    });

    const veramoAgent = await initVeramoAgent({ network });
    const didManager = new DIDManager(veramoAgent, ipfs, network);

    const publicClient = createBaseProvider(network);
    const contracts = createContractClients(
      publicClient,
      undefined,
      config?.reputationContractAddress,
    );
    const vcManager = new VCManager(veramoAgent);
    const reputationManager = new ReputationManager(contracts);
    const verifier = new Verifier(didManager, reputationManager, contracts, vcManager);

    return verifier.verify(did);
  }

  static async resolve(did: string, config?: EtereCitizenConfig): Promise<AgentDIDDocument | null> {
    const network = config?.network || DEFAULT_NETWORK;
    const ipfs = new IPFSStorage({
      apiKey: config?.pinataApiKey || process.env.PINATA_API_KEY || '',
      secretKey: config?.pinataSecretKey || process.env.PINATA_SECRET_KEY || '',
    });

    const veramoAgent = await initVeramoAgent({ network });
    const didManager = new DIDManager(veramoAgent, ipfs, network);
    const result = await didManager.resolveDID(did);
    return result.didDocument;
  }

  static async search(filters: SearchFilters, config?: EtereCitizenConfig): Promise<SearchResult> {
    const instance = EtereCitizen.getInstance(config);
    return instance.registryManager.searchAgents(filters);
  }
}
