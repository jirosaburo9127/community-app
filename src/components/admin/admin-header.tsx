"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, LayoutDashboard, Users, FileText, Calendar, Trophy, Mail, Menu, X } from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/admin", label: "ダッシュボード", icon: LayoutDashboard },
  { href: "/admin/users", label: "ユーザー", icon: Users },
  { href: "/admin/invitations", label: "招待", icon: Mail },
  { href: "/admin/posts", label: "投稿", icon: FileText },
  { href: "/admin/events", label: "イベント", icon: Calendar },
  { href: "/admin/challenges", label: "チャレンジ", icon: Trophy },
];

export function AdminHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-white">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button
            className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <h1 className="text-base font-bold text-gray-900">管理画面</h1>
        </div>
        <Link
          href="/home"
          className="flex items-center gap-1.5 text-sm text-muted hover:text-gray-700 transition-colors"
        >
          <ArrowLeft size={16} />
          サイトに戻る
        </Link>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="lg:hidden border-t border-border bg-white px-4 py-2">
          {navItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
