import { ReactElement } from 'react';

export default function Loading(): ReactElement {
  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center">
      <div className="text-center">
        <div className="inline-block size-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        <p className="text-secondary mt-4">Loading...</p>
      </div>
    </div>
  );
}
