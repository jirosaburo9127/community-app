import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Sidebar } from "@/components/layout/sidebar";
import { UnreadCountProvider } from "@/components/layout/unread-count-provider";
import { getCategories } from "@/lib/queries/categories";
import { headers } from "next/headers";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [categories, headerStore] = await Promise.all([
    getCategories(),
    headers(),
  ]);

  const encoded = headerStore.get("x-display-name");
  const displayName = encoded ? decodeURIComponent(encoded) : undefined;

  return (
    <UnreadCountProvider>
      <div className="min-h-screen bg-surface">
        <Header
          displayName={displayName}
          categories={categories}
        />
        <div className="mx-auto max-w-6xl px-4 pb-20 pt-6 lg:pb-8">
          <div className="flex gap-8">
            <Suspense fallback={null}>
              <Sidebar categories={categories} />
            </Suspense>
            <main className="min-w-0 flex-1">
              {children}
            </main>
          </div>
        </div>
        <BottomNav />
      </div>
    </UnreadCountProvider>
  );
}
