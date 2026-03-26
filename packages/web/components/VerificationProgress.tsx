const LEVELS = [
  { level: 0, label: 'Unverified', color: 'bg-gray-300', next: 'Add a DNS TXT record to verify your domain' },
  { level: 1, label: 'Domain', color: 'bg-blue-500', next: 'Submit business registration to reach Level 2' },
  { level: 2, label: 'Business', color: 'bg-green-500', next: 'Complete KYC verification to reach Level 3' },
  { level: 3, label: 'KYC', color: 'bg-yellow-500', next: null },
];

export function VerificationProgress({ level }: { level: number }) {
  const currentLevel = Math.min(Math.max(level, 0), 3);
  const nextStep = LEVELS[currentLevel]?.next;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1">
        {LEVELS.map((l, i) => (
          <div key={l.level} className="flex items-center flex-1">
            <div
              className={`h-2 rounded-full flex-1 ${
                i <= currentLevel ? l.color : 'bg-gray-200'
              }`}
            />
            {i < LEVELS.length - 1 && <div className="w-1" />}
          </div>
        ))}
      </div>
      <div className="flex justify-between text-[10px] text-gray-400">
        {LEVELS.map((l) => (
          <span
            key={l.level}
            className={l.level <= currentLevel ? 'text-gray-600 font-medium' : ''}
          >
            {l.label}
          </span>
        ))}
      </div>
      {nextStep && (
        <p className="text-xs text-citizen-600 mt-1">{nextStep}</p>
      )}
    </div>
  );
}
