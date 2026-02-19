"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  Calendar,
  Trophy,
  Mail,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "ダッシュボード", icon: LayoutDashboard },
  { href: "/admin/users", label: "ユーザー管理", icon: Users },
  { href: "/admin/invitations", label: "招待管理", icon: Mail },
  { href: "/admin/posts", label: "投稿管理", icon: FileText },
  { href: "/admin/events", label: "イベント管理", icon: Calendar },
  { href: "/admin/challenges", label: "チャレンジ管理", icon: Trophy },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex w-56 shrink-0 flex-col gap-1">
      {navItems.map((item) => {
        const isActive =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? "bg-primary text-white"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <item.icon size={18} />
            {item.label}
          </Link>
        );
      })}
    </aside>
  );
}
