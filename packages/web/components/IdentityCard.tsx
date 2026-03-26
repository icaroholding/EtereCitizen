import { TrustBadge } from './TrustBadge';
import { RatingDisplay } from './RatingDisplay';
import { VerificationProgress } from './VerificationProgress';
import { QRCode } from './QRCode';
import type { IdentityCardResponse } from '@/lib/api-client';

export function IdentityCard({ data }: { data: IdentityCardResponse }) {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden max-w-lg w-full">
      <div className="bg-citizen-600 px-6 py-4">
        <h2 className="text-white text-lg font-semibold">EtereCitizen Identity Card</h2>
      </div>

      <div className="px-6 py-5 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-500 uppercase tracking-wide">DID</p>
            <p className="text-sm font-mono break-all mt-1">{data.did}</p>
          </div>
          <QRCode did={data.did} size={72} />
        </div>

        <div className="flex items-center gap-3">
          <TrustBadge level={data.verificationLevel} />
          <span className={`text-sm ${data.verified ? 'text-green-600' : 'text-red-600'}`}>
            {data.verified ? 'Verified' : 'Not Verified'}
          </span>
        </div>

        <VerificationProgress level={data.verificationLevel} />

        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Overall Score</p>
          <RatingDisplay score={data.overallScore} count={data.reviewCount} />
        </div>

        {data.categoryRatings.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Categories</p>
            {data.categoryRatings.map((cat) => (
              <div key={cat.category} className="flex justify-between items-center py-1">
                <span className="text-sm text-gray-700">{cat.category}</span>
                <RatingDisplay score={cat.decayedScore} count={cat.reviewCount} />
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Wallet</p>
            <p className={data.walletConnected ? 'text-green-600' : 'text-gray-400'}>
              {data.walletConnected ? 'Connected' : 'Not connected'}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Age</p>
            <p>{data.agentAge} days</p>
          </div>
        </div>

        {data.flags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {data.flags.map((flag) => (
              <span key={flag} className="px-2 py-1 bg-orange-50 text-orange-700 text-xs rounded">
                {flag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
