"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { getCategoryColor } from "@/lib/constants";
import type { Category } from "@/lib/types";
import { useUnreadCounts } from "./unread-count-provider";
import { useState, useEffect, useRef } from "react";
import { Home, Users, UsersRound, Rocket, Calendar, Zap, BookOpen, Briefcase, PenSquare, Bookmark, Trophy, User, Search, Bell, MessageCircle, LogOut, Menu, X, GraduationCap, Library } from "lucide-react";

export function Header({
  displayName,
  categories = [],
}: {
  displayName?: string;
  categories?: Category[];
}) {
  const { messages: unreadMessages, notifications: unreadNotifications } = useUnreadCounts();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { href: "/home", label: "ホーム", icon: Home },
    { href: "/members", label: "メンバー", icon: Users },
    { href: "/startups", label: "スタートアップ", icon: Rocket },
    { href: "/groups", label: "グループ", icon: UsersRound },
    { href: "/events", label: "イベント", icon: Calendar },
    { href: "/jobs", label: "求人", icon: Briefcase },
    { href: "/mentoring", label: "メンタリング", icon: GraduationCap },
    { href: "/resources", label: "リソース", icon: Library },
    { href: "/challenges", label: "チャレンジ", icon: Zap },
    { href: "/learning", label: "学習", icon: BookOpen },
    { href: "/ranking", label: "ランキング", icon: Trophy },
    { href: "/messages", label: "DM", icon: MessageCircle, badgeKey: "messages" as const },
    { href: "/notifications", label: "通知", icon: Bell, badgeKey: "notifications" as const },
    { href: "/search", label: "検索", icon: Search },
    { href: "/posts/new", label: "投稿", icon: PenSquare },
    { href: "/bookmarks", label: "保存", icon: Bookmark },
    { href: "/profile", label: "マイページ", icon: User },
  ];

  // 外側クリックで閉じる
  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  // ページ遷移で閉じる
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname, currentCategory]);

  async function handleLogout() {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <header ref={menuRef} className="sticky top-0 z-40 w-full border-b border-border bg-white/80 backdrop-blur-lg">
      <div className="mx-auto flex h-14 sm:h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">

        {/* ロゴ */}
        <Link href="/home" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-sm font-bold text-white">
            IH
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Incubation Hub
          </span>
        </Link>

        {/* モバイル用：ハンバーガーボタン（sm未満） */}
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="sm:hidden flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* タブレット用ナビ（sm〜lg） */}
        <nav className="hidden sm:flex items-center gap-1 lg:hidden">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              pathname.startsWith(item.href + "/");

            const badge =
              "badgeKey" in item && item.badgeKey === "messages"
                ? unreadMessages
                : "badgeKey" in item && item.badgeKey === "notifications"
                  ? unreadNotifications
                  : 0;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <item.icon size={16} />
                {item.label}
                {badge > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* PC用（lg〜）：検索 + ユーザー情報 + ログアウト */}
        <div className="hidden lg:flex items-center gap-3">
          <Link
            href="/search"
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
              pathname === "/search"
                ? "bg-primary/10 text-primary"
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            )}
            title="検索"
          >
            <Search size={18} />
          </Link>

          {displayName && (
            <Link
              href="/profile"
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-gray-100"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-xs font-bold text-white">
                {displayName.charAt(0)}
              </div>
              <span className="text-sm font-medium text-gray-700">{displayName}</span>
            </Link>
          )}

          <button
            onClick={handleLogout}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
            title="ログアウト"
          >
            <LogOut size={18} />
          </button>
        </div>

      </div>

      {/* モバイル用メニュー（sm未満） */}
      {menuOpen && (
        <div className="sm:hidden border-t border-border bg-white shadow-lg max-h-[calc(100dvh-3.5rem)] overflow-y-auto">

          {/* ナビゲーション — グリッド */}
          <div className="px-4 pt-3 pb-2">
            <div className="grid grid-cols-4 gap-1">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");

                const badge =
                  "badgeKey" in item && item.badgeKey === "messages"
                    ? unreadMessages
                    : "badgeKey" in item && item.badgeKey === "notifications"
                      ? unreadNotifications
                      : 0;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "relative flex flex-col items-center gap-1 rounded-xl px-1 py-2.5 text-[11px] font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    <item.icon size={20} />
                    {item.label}
                    {badge > 0 && (
                      <span className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                        {badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* カテゴリ */}
          <div className="border-t border-border px-4 pt-3 pb-2">
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted">カテゴリ</p>
            <div className="flex flex-wrap gap-1.5">
              <Link
                href="/home"
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  pathname === "/home" && !currentCategory
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-600"
                )}
              >
                すべて
              </Link>
              {categories.map((cat) => {
                const color = getCategoryColor(cat.slug);
                const isActive = currentCategory === cat.slug;
                return (
                  <Link
                    key={cat.slug}
                    href={`/home?category=${cat.slug}`}
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                      isActive
                        ? cn(color.tab, "text-white")
                        : "bg-gray-100 text-gray-600"
                    )}
                  >
                    {cat.icon_emoji} {cat.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* ログアウト */}
          <div className="border-t border-border px-4 py-3">
            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-50"
            >
              <LogOut size={16} /> ログアウト
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
