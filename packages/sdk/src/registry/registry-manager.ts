import type { AgentRegistryEntry, SearchFilters, SearchResult, AgentProfile } from '@eterecitizen/common';
import { ERC8004Client } from './erc8004-client.js';

export class RegistryManager {
  private client: ERC8004Client;

  constructor(client?: ERC8004Client) {
    this.client = client || new ERC8004Client();
  }

  async registerAgent(profile: AgentProfile): Promise<void> {
    const entry: AgentRegistryEntry = {
      did: profile.did,
      name: profile.name,
      capabilities: profile.capabilities.map((c) => c.name),
      verificationLevel: profile.verificationLevel,
      overallScore: 0,
      totalReviews: 0,
      registeredAt: new Date().toISOString(),
      active: true,
    };

    await this.client.register(entry);
  }

  async updateAgent(did: string, updates: Partial<AgentRegistryEntry>): Promise<void> {
    await this.client.update(did, updates);
  }

  async getAgent(did: string): Promise<AgentRegistryEntry | null> {
    return this.client.get(did);
  }

  async searchAgents(filters: SearchFilters): Promise<SearchResult> {
    return this.client.search(filters);
  }

  async deactivateAgent(did: string): Promise<void> {
    await this.client.deactivate(did);
  }
}
