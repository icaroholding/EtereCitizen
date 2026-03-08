import {
  WalletProvider,
  type WalletAdapter,
  type PaymentRequest,
  type PaymentResponse,
} from '@eterecitizen/common';

export interface MoonPayConfig {
  apiKey: string;
  network?: string;
}

export class MoonPayAdapter implements WalletAdapter {
  readonly provider = WalletProvider.MoonPay;
  private apiKey: string;

  constructor(config: MoonPayConfig) {
    this.apiKey = config.apiKey;
  }

  async getAddress(): Promise<string> {
    this.ensureConfigured();
    throw new Error('MoonPay adapter: API key required. Provide MOONPAY_API_KEY to use this adapter.');
  }

  async signMessage(_message: string): Promise<string> {
    this.ensureConfigured();
    throw new Error('MoonPay adapter: API key required. Provide MOONPAY_API_KEY to use this adapter.');
  }

  async negotiatePayment(_request: PaymentRequest): Promise<PaymentResponse> {
    this.ensureConfigured();
    throw new Error('MoonPay adapter: API key required. Provide MOONPAY_API_KEY to use this adapter.');
  }

  private ensureConfigured(): void {
    if (!this.apiKey || this.apiKey === '') {
      throw new Error('MoonPay adapter: API key required. Provide MOONPAY_API_KEY to use this adapter.');
    }
  }
}
