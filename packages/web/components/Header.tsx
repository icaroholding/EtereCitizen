import Link from 'next/link';

export function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-citizen-700">
          EtereCitizen
        </Link>
        <nav className="flex gap-6 text-sm">
          <Link href="/" className="text-gray-600 hover:text-citizen-600">
            Verify
          </Link>
          <Link href="/search" className="text-gray-600 hover:text-citizen-600">
            Search
          </Link>
        </nav>
      </div>
    </header>
  );
}
