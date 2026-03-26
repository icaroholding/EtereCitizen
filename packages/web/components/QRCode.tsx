'use client';

/**
 * Simple QR code placeholder that links to the verification page.
 * Uses a stylized QR icon since generating real QR codes client-side
 * would require a library. The actual QR can be scanned via the link.
 */
export function QRCode({ did, size = 72 }: { did: string; size?: number }) {
  const verifyUrl = `https://eterecitizen.io/verify/${encodeURIComponent(did)}`;

  return (
    <a
      href={verifyUrl}
      target="_blank"
      rel="noopener noreferrer"
      title="Verify this agent"
      className="flex-shrink-0 group"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 72 72"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="border border-gray-200 rounded p-1 group-hover:border-citizen-400 transition-colors"
      >
        {/* QR pattern - stylized grid */}
        <rect x="4" y="4" width="20" height="20" rx="2" fill="#1a1a1a" />
        <rect x="8" y="8" width="12" height="12" rx="1" fill="white" />
        <rect x="11" y="11" width="6" height="6" fill="#1a1a1a" />

        <rect x="48" y="4" width="20" height="20" rx="2" fill="#1a1a1a" />
        <rect x="52" y="8" width="12" height="12" rx="1" fill="white" />
        <rect x="55" y="11" width="6" height="6" fill="#1a1a1a" />

        <rect x="4" y="48" width="20" height="20" rx="2" fill="#1a1a1a" />
        <rect x="8" y="52" width="12" height="12" rx="1" fill="white" />
        <rect x="11" y="55" width="6" height="6" fill="#1a1a1a" />

        {/* Data modules */}
        <rect x="28" y="4" width="4" height="4" fill="#1a1a1a" />
        <rect x="36" y="4" width="4" height="4" fill="#1a1a1a" />
        <rect x="28" y="12" width="4" height="4" fill="#1a1a1a" />
        <rect x="32" y="8" width="4" height="4" fill="#1a1a1a" />
        <rect x="40" y="8" width="4" height="4" fill="#1a1a1a" />

        <rect x="4" y="28" width="4" height="4" fill="#1a1a1a" />
        <rect x="12" y="28" width="4" height="4" fill="#1a1a1a" />
        <rect x="8" y="32" width="4" height="4" fill="#1a1a1a" />
        <rect x="16" y="32" width="4" height="4" fill="#1a1a1a" />
        <rect x="4" y="36" width="4" height="4" fill="#1a1a1a" />
        <rect x="12" y="40" width="4" height="4" fill="#1a1a1a" />

        <rect x="28" y="28" width="4" height="4" fill="#006fc7" />
        <rect x="32" y="32" width="4" height="4" fill="#006fc7" />
        <rect x="36" y="28" width="4" height="4" fill="#006fc7" />
        <rect x="40" y="32" width="4" height="4" fill="#006fc7" />
        <rect x="28" y="36" width="4" height="4" fill="#006fc7" />

        <rect x="48" y="28" width="4" height="4" fill="#1a1a1a" />
        <rect x="52" y="32" width="4" height="4" fill="#1a1a1a" />
        <rect x="56" y="28" width="4" height="4" fill="#1a1a1a" />
        <rect x="60" y="32" width="4" height="4" fill="#1a1a1a" />
        <rect x="64" y="28" width="4" height="4" fill="#1a1a1a" />

        <rect x="28" y="48" width="4" height="4" fill="#1a1a1a" />
        <rect x="32" y="52" width="4" height="4" fill="#1a1a1a" />
        <rect x="36" y="56" width="4" height="4" fill="#1a1a1a" />
        <rect x="40" y="48" width="4" height="4" fill="#1a1a1a" />
        <rect x="28" y="60" width="4" height="4" fill="#1a1a1a" />

        <rect x="48" y="48" width="4" height="4" fill="#1a1a1a" />
        <rect x="56" y="52" width="4" height="4" fill="#1a1a1a" />
        <rect x="52" y="56" width="4" height="4" fill="#1a1a1a" />
        <rect x="60" y="48" width="4" height="4" fill="#1a1a1a" />
        <rect x="64" y="56" width="4" height="4" fill="#1a1a1a" />
        <rect x="48" y="64" width="4" height="4" fill="#1a1a1a" />
        <rect x="56" y="60" width="4" height="4" fill="#1a1a1a" />
        <rect x="64" y="64" width="4" height="4" fill="#1a1a1a" />
      </svg>
    </a>
  );
}
