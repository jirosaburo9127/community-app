import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Sidebar } from "@/components/layout/sidebar";
import { UnreadCountProvider } from "@/components/layout/unread-count-provider";
import { createClient } from "@/lib/supabase/server";
import { getCategories } from "@/lib/queries/categories";
import { Suspense } from "react";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const [{ data: { user } }, categories] = await Promise.all([
    supabase.auth.getUser(),
    getCategories(),
  ]);

  let displayName: string | undefined;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .maybeSingle();
    displayName = profile?.display_name ?? undefined;
  }

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
