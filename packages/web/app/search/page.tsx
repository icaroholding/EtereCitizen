'use client';

import { useState } from 'react';
import { SearchForm } from '@/components/SearchForm';
import { RatingDisplay } from '@/components/RatingDisplay';
import { TrustBadge } from '@/components/TrustBadge';
import Link from 'next/link';

interface AgentResult {
  did: string;
  name: string;
  capabilities: string[];
  verificationLevel: number;
  overallScore: number;
  totalReviews: number;
}

export default function SearchPage() {
  const [results, setResults] = useState<AgentResult[]>([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (params: {
    capability: string;
    minRating: string;
    minLevel: string;
  }) => {
    const query = new URLSearchParams();
    if (params.capability) query.set('capability', params.capability);
    if (params.minRating) query.set('minRating', params.minRating);
    if (params.minLevel) query.set('minLevel', params.minLevel);

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
      const res = await fetch(`${apiBase}/search?${query}`);
      const data = await res.json();
      setResults(data.agents || []);
    } catch {
      setResults([]);
    }
    setSearched(true);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-2xl font-bold mb-8">Search Agents</h1>

      <SearchForm onSearch={handleSearch} />

      {searched && (
        <div className="mt-8">
          {results.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No agents found.</p>
          ) : (
            <div className="space-y-4">
              {results.map((agent) => (
                <Link
                  key={agent.did}
                  href={`/verify/${encodeURIComponent(agent.did)}`}
                  className="block bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{agent.name}</h3>
                      <p className="text-xs text-gray-500 font-mono mt-1">{agent.did}</p>
                      {agent.capabilities.length > 0 && (
                        <div className="flex gap-2 mt-2">
                          {agent.capabilities.map((cap) => (
                            <span key={cap} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                              {cap}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <TrustBadge level={agent.verificationLevel} />
                      <div className="mt-2">
                        <RatingDisplay score={agent.overallScore} count={agent.totalReviews} />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
