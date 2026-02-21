"use client";

import { cn } from "@/lib/utils";
import type { Category } from "@/lib/types";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";

export function CategoryTabs({ categories }: { categories: Category[] }) {
  const searchParams = useSearchParams();
  const current = searchParams.get("category");
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const currentCat = categories.find((c) => c.slug === current);
  const label = currentCat
    ? `${currentCat.icon_emoji} ${currentCat.name}`
    : "すべて";

  // 外側クリックで閉じる
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // ページ遷移で閉じる
  useEffect(() => {
    setOpen(false);
  }, [current]);

  return (
    <div ref={menuRef} className="relative mb-3">
      {/* トグルボタン */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-medium text-gray-800 shadow-sm transition-all hover:border-gray-300"
      >
        <span>{label}</span>
        {open ? <X size={18} className="text-gray-400" /> : <Menu size={18} className="text-gray-400" />}
      </button>

      {/* ドロップダウン */}
      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-xl border border-border bg-white py-1 shadow-lg">
          <Link
            href="/home"
            className={cn(
              "flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-colors",
              !current
                ? "bg-primary/8 text-primary"
                : "text-gray-700 hover:bg-gray-50"
            )}
          >
            <span className="text-base">📋</span>
            すべて
          </Link>
          {categories.map((cat) => {
            const isActive = current === cat.slug;
            return (
              <Link
                key={cat.slug}
                href={`/home?category=${cat.slug}`}
                className={cn(
                  "flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-gray-100 text-gray-900 font-semibold"
                    : "text-gray-700 hover:bg-gray-50"
                )}
              >
                <span className="text-base">{cat.icon_emoji}</span>
                {cat.name}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
