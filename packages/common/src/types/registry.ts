export interface AgentRegistryEntry {
  did: string;
  name: string;
  capabilities: string[];
  verificationLevel: number;
  overallScore: number;
  totalReviews: number;
  registeredAt: string;
  updatedAt?: string;
  active: boolean;
}

export interface SearchFilters {
  capability?: string;
  minRating?: number;
  minLevel?: number;
  name?: string;
  active?: boolean;
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  agents: AgentRegistryEntry[];
  total: number;
  offset: number;
  limit: number;
}
