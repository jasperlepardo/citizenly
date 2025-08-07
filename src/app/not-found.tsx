import Link from 'next/link';

export default function NotFound(): JSX.Element {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="mb-4 text-6xl font-bold text-primary">404</h1>
        <h2 className="mb-2 text-2xl font-semibold text-primary">Page Not Found</h2>
        <p className="mb-6 max-w-md text-secondary">
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
