const LEVEL_CONFIG = {
  0: { label: 'Unverified', color: 'bg-gray-100 text-gray-700' },
  1: { label: 'Domain', color: 'bg-blue-100 text-blue-700' },
  2: { label: 'Business', color: 'bg-green-100 text-green-700' },
  3: { label: 'KYC', color: 'bg-yellow-100 text-yellow-700' },
} as const;

export function TrustBadge({ level }: { level: number }) {
  const config = LEVEL_CONFIG[level as keyof typeof LEVEL_CONFIG] || LEVEL_CONFIG[0];

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
      Level {level} — {config.label}
    </span>
  );
}
