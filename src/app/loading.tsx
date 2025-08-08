import { ReactElement } from 'react';

export default function Loading(): ReactElement {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="text-center">
        <div className="inline-block size-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        <p className="mt-4 text-secondary">Loading...</p>
      </div>
    </div>
  );
}
