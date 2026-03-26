'use client';

import { useState } from 'react';
import { SERVICE_CATEGORIES, CATEGORY_DESCRIPTIONS } from '@eterecitizen/common';

interface SearchFormProps {
  onSearch: (params: {
    capability: string;
    minRating: string;
    minLevel: string;
  }) => void;
  loading?: boolean;
}

export function SearchForm({ onSearch, loading }: SearchFormProps) {
  const [capability, setCapability] = useState('');
  const [minRating, setMinRating] = useState('');
  const [minLevel, setMinLevel] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ capability, minRating, minLevel });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Capability</label>
          <select
            value={capability}
            onChange={(e) => setCapability(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm"
          >
            <option value="">Any</option>
            {SERVICE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat} title={CATEGORY_DESCRIPTIONS[cat]}>
                {cat.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Min Rating</label>
          <input
            type="number"
            min="0"
            max="5"
            step="0.5"
            value={minRating}
            onChange={(e) => setMinRating(e.target.value)}
            placeholder="0.0"
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Min Level</label>
          <select
            value={minLevel}
            onChange={(e) => setMinLevel(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm"
          >
            <option value="">Any</option>
            <option value="1">1 — Domain</option>
            <option value="2">2 — Business</option>
            <option value="3">3 — KYC</option>
          </select>
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="px-6 py-2 bg-citizen-600 text-white rounded-lg text-sm font-medium hover:bg-citizen-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Searching...' : 'Search Agents'}
      </button>
    </form>
  );
}
