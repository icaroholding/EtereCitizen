import { WalletProvider, type WalletAdapter, type WalletConfig } from '@eterecitizen/common';
import { StandardWalletAdapter } from './adapters/standard.js';
import { CoinbaseCDPAdapter } from './adapters/coinbase-cdp.js';
import { OpenfortAdapter } from './adapters/openfort.js';
import { MoonPayAdapter } from './adapters/moonpay.js';
import { ConwayAdapter } from './adapters/conway.js';

export function createWalletAdapter(config: WalletConfig): WalletAdapter {
  const provider =
    typeof config.provider === 'string'
      ? (config.provider as WalletProvider)
      : config.provider;

  switch (provider) {
    case WalletProvider.Standard:
    case 'standard':
      return new StandardWalletAdapter({
        privateKey: config.privateKey,
        mnemonic: config.mnemonic,
        network: config.network as 'base' | 'base-sepolia',
      });

    case WalletProvider.CoinbaseCDP:
    case 'coinbase-cdp':
      return new CoinbaseCDPAdapter({
        apiKey: config.apiKey || '',
        network: config.network,
      });

    case WalletProvider.Openfort:
    case 'openfort':
      return new OpenfortAdapter({
        apiKey: config.apiKey || '',
        network: config.network,
      });

    case WalletProvider.MoonPay:
    case 'moonpay':
      return new MoonPayAdapter({
        apiKey: config.apiKey || '',
        network: config.network,
      });

    case WalletProvider.Conway:
    case 'conway':
      return new ConwayAdapter({
        apiKey: config.apiKey || '',
        network: config.network,
      });

    default:
      throw new Error(`Unknown wallet provider: ${provider}`);
  }
}
