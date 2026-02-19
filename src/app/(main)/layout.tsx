import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Sidebar } from "@/components/layout/sidebar";
import { createClient } from "@/lib/supabase/server";
import { getCategories } from "@/lib/queries/categories";
import { getUnreadNotificationCount } from "@/lib/queries/notifications";
import { getUnreadMessageCount } from "@/lib/queries/messages";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let displayName: string | undefined;

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .maybeSingle();
      displayName = profile?.display_name ?? undefined;
    }
  } catch (e) {
    console.error("Layout: failed to fetch user info:", e);
  }

  const [categories, unreadNotifications, unreadMessages] = await Promise.all([
    getCategories(),
    getUnreadNotificationCount(),
    getUnreadMessageCount(),
  ]);

  return (
    <div className="min-h-screen bg-surface">
      <Header
        displayName={displayName}
        categories={categories}
        unreadMessages={unreadMessages}
        unreadNotifications={unreadNotifications}
      />
      <div className="mx-auto max-w-6xl px-4 pb-20 pt-6 lg:pb-8">
        <div className="flex gap-8">
          <Suspense fallback={null}>
            <Sidebar
              categories={categories}
              unreadMessages={unreadMessages}
              unreadNotifications={unreadNotifications}
            />
          </Suspense>
          <main className="min-w-0 flex-1">
            {children}
          </main>
        </div>
      </div>
      <BottomNav unreadMessages={unreadMessages} />
    </div>
  );
}
