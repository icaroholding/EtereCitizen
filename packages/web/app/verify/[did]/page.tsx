import { IdentityCard } from '@/components/IdentityCard';
import { fetchIdentityCard } from '@/lib/api-client';
import Link from 'next/link';

export default async function VerifyPage({ params }: { params: { did: string } }) {
  const did = decodeURIComponent(params.did);

  let data;
  let error;

  try {
    data = await fetchIdentityCard(did);
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to fetch identity card';
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <Link href="/" className="text-citizen-600 text-sm hover:underline mb-6 inline-block">
        &larr; Back to search
      </Link>

      <h1 className="text-2xl font-bold mb-8">Agent Verification</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {data && (
        <div className="flex justify-center">
          <IdentityCard data={data} />
        </div>
      )}
    </div>
  );
}
