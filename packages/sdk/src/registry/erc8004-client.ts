import type { AgentRegistryEntry, SearchFilters, SearchResult } from '@eterecitizen/common';

// ERC-8004 is the on-chain agent registry standard
// This client abstracts interaction with the registry contract

export class ERC8004Client {
  // In-memory registry for initial implementation
  // TODO: Replace with actual ERC-8004 contract interaction
  private registry: Map<string, AgentRegistryEntry> = new Map();

  async register(entry: AgentRegistryEntry): Promise<void> {
    this.registry.set(entry.did, entry);
  }

  async update(did: string, updates: Partial<AgentRegistryEntry>): Promise<void> {
    const existing = this.registry.get(did);
    if (!existing) throw new Error(`Agent not found in registry: ${did}`);
    this.registry.set(did, { ...existing, ...updates, updatedAt: new Date().toISOString() });
  }

  async get(did: string): Promise<AgentRegistryEntry | null> {
    return this.registry.get(did) || null;
  }

  async search(filters: SearchFilters): Promise<SearchResult> {
    let agents = Array.from(this.registry.values());

    if (filters.capability) {
      agents = agents.filter((a) => a.capabilities.includes(filters.capability!));
    }
    if (filters.minRating !== undefined) {
      agents = agents.filter((a) => a.overallScore >= filters.minRating!);
    }
    if (filters.minLevel !== undefined) {
      agents = agents.filter((a) => a.verificationLevel >= filters.minLevel!);
    }
    if (filters.name) {
      const query = filters.name.toLowerCase();
      agents = agents.filter((a) => a.name.toLowerCase().includes(query));
    }
    if (filters.active !== undefined) {
      agents = agents.filter((a) => a.active === filters.active);
    }

    const total = agents.length;
    const offset = filters.offset || 0;
    const limit = filters.limit || 20;
    agents = agents.slice(offset, offset + limit);

    return { agents, total, offset, limit };
  }

  async deactivate(did: string): Promise<void> {
    const existing = this.registry.get(did);
    if (existing) {
      existing.active = false;
      existing.updatedAt = new Date().toISOString();
    }
  }
}
