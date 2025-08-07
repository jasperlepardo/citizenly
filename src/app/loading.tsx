export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-4">
        <div className="border-primary size-12 animate-spin rounded-full border-b-2"></div>
        <p className="font-medium text-secondary">Loading...</p>
        <p className="text-sm text-muted">RBI System</p>
      </div>
    </div>
  );
}
