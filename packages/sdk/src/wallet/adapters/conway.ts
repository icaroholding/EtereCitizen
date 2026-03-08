import {
  WalletProvider,
  type WalletAdapter,
  type PaymentRequest,
  type PaymentResponse,
} from '@eterecitizen/common';

export interface ConwayConfig {
  apiKey: string;
  network?: string;
}

export class ConwayAdapter implements WalletAdapter {
  readonly provider = WalletProvider.Conway;
  private apiKey: string;

  constructor(config: ConwayConfig) {
    this.apiKey = config.apiKey;
  }

  async getAddress(): Promise<string> {
    this.ensureConfigured();
    throw new Error('Conway adapter: API key required. Provide CONWAY_API_KEY to use this adapter.');
  }

  async signMessage(_message: string): Promise<string> {
    this.ensureConfigured();
    throw new Error('Conway adapter: API key required. Provide CONWAY_API_KEY to use this adapter.');
  }

  async negotiatePayment(_request: PaymentRequest): Promise<PaymentResponse> {
    this.ensureConfigured();
    throw new Error('Conway adapter: API key required. Provide CONWAY_API_KEY to use this adapter.');
  }

  private ensureConfigured(): void {
    if (!this.apiKey || this.apiKey === '') {
      throw new Error('Conway adapter: API key required. Provide CONWAY_API_KEY to use this adapter.');
    }
  }
}
