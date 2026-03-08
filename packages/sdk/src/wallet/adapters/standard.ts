import { createWalletClient, http, type WalletClient, type Account } from 'viem';
import { privateKeyToAccount, mnemonicToAccount } from 'viem/accounts';
import { baseSepolia, base } from 'viem/chains';
import {
  WalletProvider,
  type WalletAdapter,
  type PaymentRequest,
  type PaymentResponse,
} from '@eterecitizen/common';

export interface StandardWalletConfig {
  privateKey?: string;
  mnemonic?: string;
  network?: 'base' | 'base-sepolia';
}

export class StandardWalletAdapter implements WalletAdapter {
  readonly provider = WalletProvider.Standard;
  private client: WalletClient;
  private account: Account;

  constructor(config: StandardWalletConfig) {
    if (!config.privateKey && !config.mnemonic) {
      throw new Error('Either privateKey or mnemonic is required for standard wallet');
    }

    this.account = config.privateKey
      ? privateKeyToAccount(config.privateKey as `0x${string}`)
      : mnemonicToAccount(config.mnemonic!);

    const chain = config.network === 'base' ? base : baseSepolia;

    this.client = createWalletClient({
      account: this.account,
      chain,
      transport: http(),
    });
  }

  async getAddress(): Promise<string> {
    return this.account.address;
  }

  async signMessage(message: string): Promise<string> {
    return this.client.signMessage({
      account: this.account,
      message,
    });
  }

  async negotiatePayment(request: PaymentRequest): Promise<PaymentResponse> {
    // For standard wallets, we simply return the wallet address
    // The actual payment is handled by the caller
    return {
      address: this.account.address,
      amount: request.amount,
      currency: request.currency,
      network: request.network,
    };
  }
}
