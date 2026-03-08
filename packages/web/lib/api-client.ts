const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export interface IdentityCardResponse {
  did: string;
  verificationLevel: number;
  categoryRatings: Array<{
    category: string;
    rawScore: number;
    decayedScore: number;
    reviewCount: number;
  }>;
  overallScore: number;
  reviewCount: number;
  walletConnected: boolean;
  agentAge: number;
  verified: boolean;
  flags: string[];
}

export interface SearchResponse {
  agents: Array<{
    did: string;
    name: string;
    capabilities: string[];
    verificationLevel: number;
    overallScore: number;
    totalReviews: number;
  }>;
  total: number;
}

export async function fetchIdentityCard(did: string): Promise<IdentityCardResponse> {
  return apiFetch(`/card/${encodeURIComponent(did)}`);
}

export async function fetchVerification(did: string) {
  return apiFetch(`/verify/${encodeURIComponent(did)}`);
}

export async function searchAgents(params: {
  capability?: string;
  minRating?: number;
  minLevel?: number;
  limit?: number;
}): Promise<SearchResponse> {
  const query = new URLSearchParams();
  if (params.capability) query.set('capability', params.capability);
  if (params.minRating) query.set('minRating', String(params.minRating));
  if (params.minLevel) query.set('minLevel', String(params.minLevel));
  if (params.limit) query.set('limit', String(params.limit));
  return apiFetch(`/search?${query}`);
}
