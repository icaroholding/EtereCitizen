import { describe, it, expect } from 'vitest';
import { buildAgentDIDDocument } from '../src/identity/did-document-builder.js';

describe('did-document-builder', () => {
  const testDID = 'did:ethr:0x14a34:0x1234567890abcdef1234567890abcdef12345678';
  const testName = 'TestAgent';

  it('should build a valid DID document', () => {
    const doc = buildAgentDIDDocument(testDID, testName);
    expect(doc.id).toBe(testDID);
    expect(doc['@context']).toBeDefined();
    expect(Array.isArray(doc['@context'])).toBe(true);
  });

  it('should include verification method with correct controller', () => {
    const doc = buildAgentDIDDocument(testDID, testName);
    expect(doc.verificationMethod).toHaveLength(1);
    expect(doc.verificationMethod[0].controller).toBe(testDID);
    expect(doc.verificationMethod[0].type).toBe('EcdsaSecp256k1RecoveryMethod2020');
  });

  it('should include authentication and assertionMethod', () => {
    const doc = buildAgentDIDDocument(testDID, testName);
    expect(doc.authentication).toHaveLength(1);
    expect(doc.assertionMethod).toHaveLength(1);
    expect(doc.authentication[0]).toBe(`${testDID}#controller`);
  });

  it('should include agent and metadata services', () => {
    const doc = buildAgentDIDDocument(testDID, testName);
    expect(doc.service.length).toBeGreaterThanOrEqual(2);

    const agentService = doc.service.find((s) => s.id.endsWith('#agent'));
    expect(agentService).toBeDefined();
    expect(agentService!.serviceEndpoint).toContain('eterecitizen.ai');

    const metadataService = doc.service.find((s) => s.id.endsWith('#metadata'));
    expect(metadataService).toBeDefined();
    const metadata = JSON.parse(metadataService!.serviceEndpoint as string);
    expect(metadata.name).toBe(testName);
    expect(metadata.protocolVersion).toBe('0.3');
  });

  it('should include additional services when provided', () => {
    const doc = buildAgentDIDDocument(testDID, testName, [
      { id: `${testDID}#custom`, type: 'CustomService', serviceEndpoint: 'https://example.com' },
    ]);
    expect(doc.service).toHaveLength(3); // agent + metadata + custom
    const custom = doc.service.find((s) => s.id.endsWith('#custom'));
    expect(custom).toBeDefined();
    expect(custom!.serviceEndpoint).toBe('https://example.com');
  });

  it('should extract chain ID from DID for blockchainAccountId', () => {
    const doc = buildAgentDIDDocument(testDID, testName);
    const vm = doc.verificationMethod[0];
    // 0x14a34 = 84532 (Base Sepolia)
    expect(vm.blockchainAccountId).toContain('eip155:84532:');
  });

  it('should set created timestamp', () => {
    const doc = buildAgentDIDDocument(testDID, testName);
    expect(doc.created).toBeDefined();
    expect(new Date(doc.created!).getTime()).toBeLessThanOrEqual(Date.now());
  });
});
