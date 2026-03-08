import {
  WalletProvider,
  type WalletAdapter,
  type PaymentRequest,
  type PaymentResponse,
} from '@eterecitizen/common';

export interface CoinbaseCDPConfig {
  apiKey: string;
  network?: string;
}

export class CoinbaseCDPAdapter implements WalletAdapter {
  readonly provider = WalletProvider.CoinbaseCDP;
  private apiKey: string;
  private network: string;

  constructor(config: CoinbaseCDPConfig) {
    this.apiKey = config.apiKey;
    this.network = config.network || 'base-sepolia';
  }

  async getAddress(): Promise<string> {
    this.ensureConfigured();
    // TODO: Implement with Coinbase CDP Agentic Wallet SDK
    throw new Error('Coinbase CDP adapter: API key required. Provide CDP_API_KEY to use this adapter.');
  }

  async signMessage(_message: string): Promise<string> {
    this.ensureConfigured();
    throw new Error('Coinbase CDP adapter: API key required. Provide CDP_API_KEY to use this adapter.');
  }

  async negotiatePayment(_request: PaymentRequest): Promise<PaymentResponse> {
    this.ensureConfigured();
    throw new Error('Coinbase CDP adapter: API key required. Provide CDP_API_KEY to use this adapter.');
  }

  private ensureConfigured(): void {
    if (!this.apiKey || this.apiKey === '') {
      throw new Error('Coinbase CDP adapter: API key required. Provide CDP_API_KEY to use this adapter.');
    }
  }
}
