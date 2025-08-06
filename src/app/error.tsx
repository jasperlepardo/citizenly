'use client';

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md mx-auto text-center p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-danger mb-2">Something went wrong</h1>
          <p className="text-secondary">An unexpected error occurred. Please try again.</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={reset}
            className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
          >
            Try again
          </button>

          <button
            onClick={() => (window.location.href = '/dashboard')}
            className="w-full px-4 py-2 bg-neutral-200 text-neutral-700 rounded-md hover:bg-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
