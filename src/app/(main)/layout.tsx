import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Sidebar } from "@/components/layout/sidebar";
import { UnreadCountProvider } from "@/components/layout/unread-count-provider";
import { createClient } from "@/lib/supabase/server";
import { getCategories } from "@/lib/queries/categories";
import { Suspense } from "react";
import { cookies, headers } from "next/headers";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [headerStore, cookieStore, categories] = await Promise.all([
    headers(),
    cookies(),
    getCategories(),
  ]);

  // ミドルウェアからユーザーID取得（getUser()の二重呼び出し回避）
  const userId = headerStore.get("x-user-id");

  // displayNameはCookieキャッシュを優先、なければDB問い合わせ
  let displayName = cookieStore.get("display_name")?.value;
  if (!displayName && userId) {
    const supabase = await createClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", userId)
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
