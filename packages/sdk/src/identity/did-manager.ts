import type { DIDCreateOptions, DIDResolutionResult, AgentDIDDocument, DIDUpdateOptions } from '@eterecitizen/common';
import { NETWORKS, type NetworkName, addressToDID } from '@eterecitizen/common';
import type { VeramoAgent } from './veramo-config.js';
import { buildAgentDIDDocument } from './did-document-builder.js';
import { IPFSStorage } from './ipfs-storage.js';

export class DIDManager {
  private agent: VeramoAgent;
  private ipfs: IPFSStorage;
  private network: NetworkName;

  constructor(agent: VeramoAgent, ipfs: IPFSStorage, network: NetworkName = 'base-sepolia') {
    this.agent = agent;
    this.ipfs = ipfs;
    this.network = network;
  }

  async createDID(options: DIDCreateOptions = {}): Promise<string> {
    const network = options.network || this.network;
    const chainIdHex = `0x${NETWORKS[network].chainId.toString(16)}`;

    const identifier = await this.agent.didManagerCreate({
      provider: `did:ethr:${chainIdHex}`,
      alias: options.alias,
    });

    return identifier.did;
  }

  async resolveDID(did: string): Promise<DIDResolutionResult> {
    try {
      const result = await this.agent.resolveDid({ didUrl: did });
      return {
        didDocument: result.didDocument as AgentDIDDocument | null,
        didResolutionMetadata: result.didResolutionMetadata,
        didDocumentMetadata: result.didDocumentMetadata,
      };
    } catch (error) {
      return {
        didDocument: null,
        didResolutionMetadata: {
          error: 'notFound',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        didDocumentMetadata: {},
      };
    }
  }

  async buildAndStoreDIDDocument(
    did: string,
    name: string,
    services?: AgentDIDDocument['service'],
  ): Promise<{ cid: string; document: AgentDIDDocument }> {
    const document = buildAgentDIDDocument(did, name, services);
    const cid = await this.ipfs.uploadJSON(document);
    return { cid, document };
  }

  async updateDIDDocument(
    did: string,
    _updates: DIDUpdateOptions,
  ): Promise<void> {
    // Use ERC-1056 setAttribute to update the DID document reference
    // The actual DID document is stored on IPFS, and the CID is referenced on-chain
    const identifier = await this.agent.didManagerGet({ did });
    if (!identifier) {
      throw new Error(`DID not found: ${did}`);
    }
    // In a full implementation, this would call the ERC-1056 registry
    // to update attributes. For now, we just verify the DID exists.
  }

  async getDIDsManaged(): Promise<string[]> {
    const identifiers = await this.agent.didManagerFind();
    return identifiers.map((id) => id.did);
  }
}
