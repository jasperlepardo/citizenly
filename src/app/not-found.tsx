import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="mx-auto max-w-md p-6 text-center">
        <div className="mb-6">
          <h1 className="mb-4 text-6xl font-bold text-primary">404</h1>
          <h2 className="text-foreground mb-2 text-2xl font-bold">Page Not Found</h2>
          <p className="text-secondary">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/dashboard"
            className="block w-full rounded-md bg-primary-600 px-4 py-2 text-center text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Go to Dashboard
          </Link>

          <Link
            href="/"
            className="block w-full rounded-md bg-neutral-200 px-4 py-2 text-center text-neutral-700 transition-colors hover:bg-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2"
          >
            Go to Home
          </Link>
        </div>

        <div className="mt-8">
          <p className="text-sm text-secondary">
            Need help?{' '}
            <Link href="/help" className="text-primary hover:underline">
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
