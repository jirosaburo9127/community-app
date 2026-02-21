export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary via-primary-dark to-accent p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 text-lg font-bold text-white backdrop-blur-sm">
            わ
          </div>
          <h1 className="text-2xl font-bold text-white">まちのわ</h1>
          <p className="mt-1 text-sm text-white/70">小さな挑戦を続けられるあたたかい居場所</p>
        </div>
        <div className="rounded-2xl bg-white p-8 shadow-2xl shadow-black/10">
          {children}
        </div>
      </div>
    </div>
  );
}
