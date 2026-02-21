export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-lg font-bold text-white">
            n
          </div>
          <h1 className="text-2xl font-bold text-gray-900">nest</h1>
          <p className="mt-1 text-sm text-muted">小さな挑戦を続けられる場所</p>
        </div>
        <div className="rounded-2xl bg-white p-8 shadow-none border border-border">
          {children}
        </div>
      </div>
    </div>
  );
}
