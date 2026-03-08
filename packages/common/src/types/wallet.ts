export enum WalletProvider {
  Standard = 'standard',
  CoinbaseCDP = 'coinbase-cdp',
  Openfort = 'openfort',
  MoonPay = 'moonpay',
  Conway = 'conway',
}

export interface WalletAdapter {
  readonly provider: WalletProvider;
  getAddress(): Promise<string>;
  signMessage(message: string): Promise<string>;
  negotiatePayment(request: PaymentRequest): Promise<PaymentResponse>;
}

export interface WalletConfig {
  provider: WalletProvider | string;
  privateKey?: string;
  mnemonic?: string;
  apiKey?: string;
  network?: string;
}

export interface PaymentRequest {
  amount: string;
  currency: string;
  network: string;
  description?: string;
  recipientDID: string;
}

export interface PaymentResponse {
  address: string;
  amount: string;
  currency: string;
  network: string;
  expiresAt?: string;
  paymentId?: string;
}

export interface ChallengeMessage {
  domain: string;
  address: string;
  statement: string;
  nonce: string;
  issuedAt: string;
  expiresAt: string;
  chainId: number;
}
