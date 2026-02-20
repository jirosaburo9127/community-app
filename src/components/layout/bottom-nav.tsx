"use client";

import { cn } from "@/lib/utils";
import { useUnreadCounts } from "./unread-count-provider";
import { Home, Search, PlusCircle, MessageCircle, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/home", label: "ホーム", icon: Home },
  { href: "/search", label: "検索", icon: Search },
  { href: "/posts/new", label: "投稿", icon: PlusCircle, isCenter: true },
  { href: "/messages", label: "メッセージ", icon: MessageCircle, hasBadge: true },
  { href: "/profile", label: "マイページ", icon: User },
];

export function BottomNav() {
  const { messages: unreadMessages } = useUnreadCounts();
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-white/90 backdrop-blur-lg sm:hidden">
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");

          if (item.isCenter) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-0.5"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-white shadow-md shadow-primary/25">
                  <item.icon size={20} />
                </div>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center gap-0.5 px-3 py-1.5 text-[11px] font-medium transition-colors",
                isActive ? "text-primary" : "text-muted"
              )}
            >
              <div className="relative">
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
                {"hasBadge" in item && item.hasBadge && unreadMessages > 0 && (
                  <span className="absolute -right-1.5 -top-1 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-red-500 px-0.5 text-[8px] font-bold text-white">
                    {unreadMessages}
                  </span>
                )}
              </div>
              <span>{item.label}</span>
              {isActive && (
                <span className="absolute -top-0.5 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
