'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function DIDInput() {
  const [did, setDid] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (did.trim()) {
      router.push(`/verify/${encodeURIComponent(did.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 w-full max-w-2xl">
      <input
        type="text"
        value={did}
        onChange={(e) => setDid(e.target.value)}
        placeholder="did:ethr:0x14a34:0x..."
        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-citizen-500 focus:border-transparent"
      />
      <button
        type="submit"
        className="px-6 py-3 bg-citizen-600 text-white rounded-lg text-sm font-medium hover:bg-citizen-700 transition-colors"
      >
        Verify
      </button>
    </form>
  );
}
