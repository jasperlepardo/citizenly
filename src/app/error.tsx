'use client';

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="mx-auto max-w-md p-6 text-center">
        <div className="mb-6">
          <h1 className="text-danger mb-2 text-2xl font-bold">Something went wrong</h1>
          <p className="text-secondary">An unexpected error occurred. Please try again.</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={reset}
            className="w-full rounded-md bg-primary-600 px-4 py-2 text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Try again
          </button>

          <button
            onClick={() => (window.location.href = '/dashboard')}
            className="w-full rounded-md bg-neutral-200 px-4 py-2 text-neutral-700 transition-colors hover:bg-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
