import Link from 'next/link';
import { ReactElement } from 'react';

export default function NotFound(): ReactElement {
  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center">
      <div className="text-center">
        <h1 className="text-primary mb-4 text-6xl font-bold">404</h1>
        <h2 className="text-primary mb-2 text-2xl font-semibold">Page Not Found</h2>
        <p className="text-secondary mb-6 max-w-md">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block rounded bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
        >
          Go back home
        </Link>
      </div>
    </div>
  );
}
