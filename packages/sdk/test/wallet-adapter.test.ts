import { describe, it, expect } from 'vitest';
import { StandardWalletAdapter } from '../src/wallet/adapters/standard.js';
import { createWalletAdapter } from '../src/wallet/adapter-factory.js';
import { WalletProvider } from '@eterecitizen/common';

// Deterministic test private key (never use on mainnet!)
const TEST_PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
const TEST_ADDRESS = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'; // hardhat account 0

describe('StandardWalletAdapter', () => {
  it('should create adapter from private key', () => {
    const adapter = new StandardWalletAdapter({ privateKey: TEST_PRIVATE_KEY });
    expect(adapter.provider).toBe(WalletProvider.Standard);
  });

  it('should return the correct address', async () => {
    const adapter = new StandardWalletAdapter({ privateKey: TEST_PRIVATE_KEY });
    const address = await adapter.getAddress();
    expect(address.toLowerCase()).toBe(TEST_ADDRESS.toLowerCase());
  });

  it('should sign messages', async () => {
    const adapter = new StandardWalletAdapter({ privateKey: TEST_PRIVATE_KEY });
    const signature = await adapter.signMessage('hello world');
    expect(signature).toBeTruthy();
    expect(signature.startsWith('0x')).toBe(true);
    expect(signature.length).toBeGreaterThan(10);
  });

  it('should negotiate payment', async () => {
    const adapter = new StandardWalletAdapter({ privateKey: TEST_PRIVATE_KEY });
    const response = await adapter.negotiatePayment({
      amount: '0.01',
      currency: 'ETH',
      network: 'base-sepolia',
      recipientDID: 'did:ethr:0x14a34:0x0000000000000000000000000000000000000001',
    });
    expect(response.address.toLowerCase()).toBe(TEST_ADDRESS.toLowerCase());
    expect(response.amount).toBe('0.01');
    expect(response.currency).toBe('ETH');
  });

  it('should throw if no key or mnemonic provided', () => {
    expect(() => new StandardWalletAdapter({})).toThrow('privateKey or mnemonic');
  });
});

describe('createWalletAdapter', () => {
  it('should create standard adapter from enum', () => {
    const adapter = createWalletAdapter({
      provider: WalletProvider.Standard,
      privateKey: TEST_PRIVATE_KEY,
    });
    expect(adapter.provider).toBe(WalletProvider.Standard);
  });

  it('should create standard adapter from string', () => {
    const adapter = createWalletAdapter({
      provider: 'standard',
      privateKey: TEST_PRIVATE_KEY,
    });
    expect(adapter.provider).toBe(WalletProvider.Standard);
  });

  it('should create stub adapters for other providers', () => {
    // These are stubs that throw on actual operations
    const coinbase = createWalletAdapter({ provider: WalletProvider.CoinbaseCDP, apiKey: 'test' });
    expect(coinbase.provider).toBe(WalletProvider.CoinbaseCDP);

    const openfort = createWalletAdapter({ provider: WalletProvider.Openfort, apiKey: 'test' });
    expect(openfort.provider).toBe(WalletProvider.Openfort);

    const moonpay = createWalletAdapter({ provider: WalletProvider.MoonPay, apiKey: 'test' });
    expect(moonpay.provider).toBe(WalletProvider.MoonPay);

    const conway = createWalletAdapter({ provider: WalletProvider.Conway, apiKey: 'test' });
    expect(conway.provider).toBe(WalletProvider.Conway);
  });

  it('should throw for unknown provider', () => {
    expect(() => createWalletAdapter({ provider: 'unknown-wallet' })).toThrow('Unknown wallet provider');
  });
});
