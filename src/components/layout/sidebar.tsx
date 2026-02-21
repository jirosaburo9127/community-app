"use client";

import { cn } from "@/lib/utils";
import type { Category } from "@/lib/types";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useUnreadCounts } from "./unread-count-provider";
import { Home, Users, UsersRound, Rocket, Calendar, Zap, BookOpen, Briefcase, PenSquare, Bookmark, Trophy, User, Search, Bell, MessageCircle, GraduationCap, Library } from "lucide-react";

const navItems = [
  { href: "/home", label: "ホーム", icon: Home },
  { href: "/members", label: "メンバー", icon: Users },
  { href: "/startups", label: "スタートアップ", icon: Rocket },
  { href: "/groups", label: "グループ", icon: UsersRound },
  { href: "/events", label: "イベント", icon: Calendar },
  { href: "/jobs", label: "求人/コラボ", icon: Briefcase },
  { href: "/mentoring", label: "メンタリング", icon: GraduationCap },
  { href: "/resources", label: "リソース", icon: Library },
  { href: "/challenges", label: "チャレンジ", icon: Zap },
  { href: "/learning", label: "学習", icon: BookOpen },
  { href: "/ranking", label: "ランキング", icon: Trophy },
  { href: "/messages", label: "メッセージ", icon: MessageCircle, badgeKey: "messages" as const },
  { href: "/notifications", label: "通知", icon: Bell, badgeKey: "notifications" as const },
  { href: "/search", label: "検索", icon: Search },
  { href: "/bookmarks", label: "保存済み", icon: Bookmark },
  { href: "/profile", label: "マイページ", icon: User },
];

export function Sidebar({
  categories,
}: {
  categories: Category[];
}) {
  const { messages: unreadMessages, notifications: unreadNotifications } = useUnreadCounts();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category");
  const isHome = pathname === "/home";

  return (
    <aside className="hidden lg:block w-60 shrink-0">
      <div className="sticky top-20 space-y-6">

        {/* ナビゲーション */}
        <nav className="space-y-0.5">
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
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <item.icon size={18} />
                <span className="flex-1">{item.label}</span>
                {badge > 0 && (
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* 投稿ボタン */}
        <Link
          href="/posts/new"
          className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-accent px-4 py-2.5 text-sm font-medium text-white shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:-translate-y-0.5"
        >
          <PenSquare size={16} />
          投稿する
        </Link>

        {/* カテゴリ */}
        <div>
          <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted">
            カテゴリ
          </h3>
          <div className="space-y-0.5">
            <Link
              href="/home"
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-all",
                isHome && !currentCategory
                  ? "bg-primary/10 font-medium text-primary"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <span className="text-base">📋</span>
              すべて
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/home?category=${cat.slug}`}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-all",
                  isHome && currentCategory === cat.slug
                    ? "bg-primary/10 font-medium text-primary"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <span className="text-base">{cat.icon_emoji}</span>
                {cat.name}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </aside>
  );
}
