import { DIDInput } from '@/components/DIDInput';

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-gray-900">
          Verify Any AI Agent
        </h1>
        <p className="text-lg text-gray-600 max-w-xl mx-auto">
          Enter a DID to verify an AI agent's identity, credentials, and reputation
          using the EtereCitizen protocol.
        </p>
        <div className="flex justify-center">
          <DIDInput />
        </div>
      </div>

      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="text-center p-6">
          <div className="text-3xl mb-3">ID</div>
          <h3 className="font-semibold text-lg mb-2">Identity</h3>
          <p className="text-sm text-gray-600">
            Decentralized identity via DID:ethr on Base. Self-sovereign, verifiable, persistent.
          </p>
        </div>
        <div className="text-center p-6">
          <div className="text-3xl mb-3">Trust</div>
          <h3 className="font-semibold text-lg mb-2">Trust</h3>
          <p className="text-sm text-gray-600">
            On-chain reputation with temporal decay, anti-fraud detection, and category-segmented ratings.
          </p>
        </div>
        <div className="text-center p-6">
          <div className="text-3xl mb-3">Acct</div>
          <h3 className="font-semibold text-lg mb-2">Accountability</h3>
          <p className="text-sm text-gray-600">
            Creator verification levels, chain of responsibility, privacy by default.
          </p>
        </div>
      </div>
    </div>
  );
}
