export interface IPFSStorageConfig {
  apiKey: string;
  secretKey: string;
  gateway?: string;
}

export class IPFSStorage {
  private apiKey: string;
  private secretKey: string;
  private gateway: string;
  private pinataApiUrl = 'https://api.pinata.cloud';

  constructor(config: IPFSStorageConfig) {
    this.apiKey = config.apiKey;
    this.secretKey = config.secretKey;
    this.gateway = config.gateway || 'https://gateway.pinata.cloud/ipfs';
  }

  async uploadJSON(data: unknown): Promise<string> {
    const response = await fetch(`${this.pinataApiUrl}/pinning/pinJSONToIPFS`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        pinata_api_key: this.apiKey,
        pinata_secret_api_key: this.secretKey,
      },
      body: JSON.stringify({
        pinataContent: data,
        pinataMetadata: {
          name: 'eterecitizen-did-document',
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`IPFS upload failed: ${response.statusText}`);
    }

    const result = (await response.json()) as { IpfsHash: string };
    return result.IpfsHash;
  }

  async fetchJSON<T>(cid: string): Promise<T> {
    const response = await fetch(`${this.gateway}/${cid}`);
    if (!response.ok) {
      throw new Error(`IPFS fetch failed: ${response.statusText}`);
    }
    return response.json() as Promise<T>;
  }

  getGatewayUrl(cid: string): string {
    return `${this.gateway}/${cid}`;
  }
}
