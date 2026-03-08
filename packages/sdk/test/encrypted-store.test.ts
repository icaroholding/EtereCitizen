import { describe, it, expect } from 'vitest';
import { EncryptedStore } from '../src/storage/encrypted-store.js';

describe('EncryptedStore', () => {
  const password = 'test-password-12345';

  it('should encrypt and decrypt a string', () => {
    const store = new EncryptedStore(password);
    const original = 'Hello, EtereCitizen!';
    const encrypted = store.encrypt(original);
    const decrypted = store.decrypt(encrypted);
    expect(decrypted).toBe(original);
  });

  it('should produce different ciphertext for same plaintext', () => {
    const store = new EncryptedStore(password);
    const data = 'same data';
    const e1 = store.encrypt(data);
    const e2 = store.encrypt(data);
    expect(e1).not.toBe(e2); // random salt/IV each time
  });

  it('should fail to decrypt with wrong password', () => {
    const store1 = new EncryptedStore('password-one');
    const store2 = new EncryptedStore('password-two');
    const encrypted = store1.encrypt('secret');
    expect(() => store2.decrypt(encrypted)).toThrow();
  });

  it('should encrypt and decrypt JSON', () => {
    const store = new EncryptedStore(password);
    const data = { address: '0x123', balance: '1.5', nested: { key: 'value' } };
    const encrypted = store.encryptJSON(data);
    const decrypted = store.decryptJSON(encrypted);
    expect(decrypted).toEqual(data);
  });

  it('should handle empty string', () => {
    const store = new EncryptedStore(password);
    const encrypted = store.encrypt('');
    const decrypted = store.decrypt(encrypted);
    expect(decrypted).toBe('');
  });

  it('should handle unicode', () => {
    const store = new EncryptedStore(password);
    const data = 'Ciao! EtereCitizen protocollo per AI agent';
    const encrypted = store.encrypt(data);
    const decrypted = store.decrypt(encrypted);
    expect(decrypted).toBe(data);
  });

  it('should handle large data', () => {
    const store = new EncryptedStore(password);
    const data = 'x'.repeat(100000);
    const encrypted = store.encrypt(data);
    const decrypted = store.decrypt(encrypted);
    expect(decrypted).toBe(data);
  });
});
