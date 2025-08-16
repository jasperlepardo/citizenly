import Link from 'next/link';
import { ReactElement } from 'react';

export default function NotFound(): ReactElement {
  return (
    <div className="bg-white dark:bg-gray-800 flex min-h-screen flex-col items-center justify-center">
      <div className="text-center">
        <h1 className="mb-4 text-6xl font-bold text-gray-600 dark:text-gray-300">404</h1>
        <h2 className="mb-2 text-2xl font-semibold text-gray-600 dark:text-gray-300">Page Not Found</h2>
        <p className="mb-6 max-w-md text-gray-600 dark:text-gray-400">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block rounded-sm bg-blue-600 px-4 py-2 font-medium text-white dark:text-black transition-colors hover:bg-blue-700"
        >
          Go back home
        </Link>
      </div>
    </div>
  );
}
