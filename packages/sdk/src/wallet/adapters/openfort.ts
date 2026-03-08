import {
  WalletProvider,
  type WalletAdapter,
  type PaymentRequest,
  type PaymentResponse,
} from '@eterecitizen/common';

export interface OpenfortConfig {
  apiKey: string;
  network?: string;
}

export class OpenfortAdapter implements WalletAdapter {
  readonly provider = WalletProvider.Openfort;
  private apiKey: string;

  constructor(config: OpenfortConfig) {
    this.apiKey = config.apiKey;
  }

  async getAddress(): Promise<string> {
    this.ensureConfigured();
    throw new Error('Openfort adapter: API key required. Provide OPENFORT_API_KEY to use this adapter.');
  }

  async signMessage(_message: string): Promise<string> {
    this.ensureConfigured();
    throw new Error('Openfort adapter: API key required. Provide OPENFORT_API_KEY to use this adapter.');
  }

  async negotiatePayment(_request: PaymentRequest): Promise<PaymentResponse> {
    this.ensureConfigured();
    throw new Error('Openfort adapter: API key required. Provide OPENFORT_API_KEY to use this adapter.');
  }

  private ensureConfigured(): void {
    if (!this.apiKey || this.apiKey === '') {
      throw new Error('Openfort adapter: API key required. Provide OPENFORT_API_KEY to use this adapter.');
    }
  }
}
