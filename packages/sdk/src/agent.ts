import type {
  AgentProfile,
  WalletConfig,
  WalletAdapter,
  WalletInfo,
  ReviewInput,
  PresentationOptions,
  VerifiablePresentation,
  VerifiableCredential,
  AgentExport,
  IdentityCardData,
  PaymentRequest,
  PaymentResponse,
} from '@eterecitizen/common';
import { VerificationLevel, DEFAULT_NETWORK, NETWORKS } from '@eterecitizen/common';
import type { NetworkName } from '@eterecitizen/common';
import { DIDManager } from './identity/did-manager.js';
import { VCManager } from './credentials/vc-manager.js';
import { BirthCertificateManager } from './credentials/birth-certificate.js';
import { CapabilityManager } from './credentials/capability.js';
import { WalletOwnershipManager } from './credentials/wallet-ownership.js';
import { PresentationManager } from './credentials/presentation.js';
import { createWalletAdapter } from './wallet/adapter-factory.js';
import { generateChallenge, challengeToMessage } from './wallet/challenge.js';
import { RegistryManager } from './registry/registry-manager.js';
import { SQLiteStore } from './storage/sqlite-store.js';

export class Agent {
  readonly did: string;
  private _profile: AgentProfile;
  private _wallet: WalletAdapter | null = null;
  private _walletInfo: WalletInfo | null = null;
  private _credentials: VerifiableCredential[] = [];
  private _network: NetworkName;

  // Managers (injected)
  private didManager: DIDManager;
  private vcManager: VCManager;
  private birthCertManager: BirthCertificateManager;
  private capabilityManager: CapabilityManager;
  private walletOwnershipManager: WalletOwnershipManager;
  private presentationManager: PresentationManager;
  private registryManager: RegistryManager;
  private store: SQLiteStore;

  constructor(params: {
    did: string;
    profile: AgentProfile;
    didManager: DIDManager;
    vcManager: VCManager;
    registryManager: RegistryManager;
    store: SQLiteStore;
    network?: NetworkName;
    credentials?: VerifiableCredential[];
  }) {
    this.did = params.did;
    this._profile = params.profile;
    this._network = params.network ?? DEFAULT_NETWORK;
    this.didManager = params.didManager;
    this.vcManager = params.vcManager;
    this.birthCertManager = new BirthCertificateManager(params.vcManager);
    this.capabilityManager = new CapabilityManager(params.vcManager);
    this.walletOwnershipManager = new WalletOwnershipManager(params.vcManager);
    this.presentationManager = new PresentationManager();
    this.registryManager = params.registryManager;
    this.store = params.store;
    this._credentials = params.credentials || [];
  }

  get wallet(): WalletInfo | null {
    return this._walletInfo;
  }

  get profile(): AgentProfile {
    return this._profile;
  }

  async connectWallet(config: WalletConfig): Promise<void> {
    const adapter = createWalletAdapter(config);
    const address = await adapter.getAddress();

    // Challenge-response to prove ownership
    const chainId = NETWORKS[this._network].chainId;
    const challenge = generateChallenge(address, chainId);
    const message = challengeToMessage(challenge);
    const signature = await adapter.signMessage(message);

    // Issue Wallet Ownership VC
    const walletVC = await this.walletOwnershipManager.issue({
      issuerDID: this.did,
      subjectDID: this.did,
      walletProvider: config.provider.toString(),
      challengeMessage: message,
      signature,
    });

    this._credentials.push(walletVC as unknown as VerifiableCredential);
    this._wallet = adapter;
    this._walletInfo = {
      provider: config.provider.toString(),
      connected: true,
      connectedAt: new Date().toISOString(),
    };
    this._profile.walletConnected = true;

    this.store.saveWalletConnection(this.did, config.provider.toString());
    this.store.saveCredential(
      `wallet-ownership-${Date.now()}`,
      this.did,
      'WalletOwnership',
      walletVC,
    );
  }

  async createAndConnectWallet(config: WalletConfig): Promise<WalletInfo> {
    await this.connectWallet(config);
    return this._walletInfo!;
  }

  async present(options?: PresentationOptions): Promise<VerifiablePresentation> {
    return this.presentationManager.createPresentation({
      holderDID: this.did,
      credentials: this._credentials,
      config: options ? { fields: options.fields || [] } : undefined,
    });
  }

  async requestPaymentAddress(
    _otherDID: string,
    request: PaymentRequest,
  ): Promise<PaymentResponse> {
    if (!this._wallet) {
      throw new Error('No wallet connected. Call connectWallet() first.');
    }
    return this._wallet.negotiatePayment(request);
  }

  async review(_otherDID: string, _review: ReviewInput): Promise<void> {
    // Review submission requires on-chain interaction via ReputationManager
    // This is handled at the EtereCitizen class level with full contract access
    throw new Error('Use EtereCitizen.submitReview() for on-chain review submission');
  }

  async addCapability(capability: string): Promise<void> {
    const vc = await this.capabilityManager.issue({
      issuerDID: this.did,
      subjectDID: this.did,
      capability,
      category: capability,
    });

    this._credentials.push(vc as unknown as VerifiableCredential);
    this._profile.capabilities.push({
      name: capability,
      category: capability,
    });

    this.store.saveCredential(`capability-${capability}-${Date.now()}`, this.did, 'Capability', vc);
  }

  async getIdentityCard(): Promise<IdentityCardData> {
    return {
      did: this.did,
      name: this._profile.name,
      description: this._profile.description,
      verificationLevel: this._profile.verificationLevel as VerificationLevel,
      capabilities: this._profile.capabilities,
      categoryRatings: [],
      overallScore: 0,
      totalReviews: 0,
      totalTasksCompleted: 0,
      walletConnected: this._profile.walletConnected,
      createdAt: this._profile.createdAt,
      creatorDID: this._profile.creatorDID,
      status: this._profile.status,
    };
  }

  async export(): Promise<AgentExport> {
    return {
      version: '0.3',
      did: this.did,
      profile: this._profile,
      credentials: this._credentials,
      exportedAt: new Date().toISOString(),
    };
  }

  static async import(params: {
    data: AgentExport;
    didManager: DIDManager;
    vcManager: VCManager;
    registryManager: RegistryManager;
    store: SQLiteStore;
  }): Promise<Agent> {
    return new Agent({
      did: params.data.did,
      profile: params.data.profile,
      didManager: params.didManager,
      vcManager: params.vcManager,
      registryManager: params.registryManager,
      store: params.store,
      credentials: params.data.credentials,
    });
  }
}
