"use client";

import type { ProfileRole } from "@/lib/types";
import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

const roles: { value: ProfileRole | ""; label: string }[] = [
  { value: "", label: "すべて" },
  { value: "student", label: "学生" },
  { value: "entrepreneur", label: "起業家" },
  { value: "mentor", label: "メンター" },
  { value: "investor", label: "投資家" },
];

export function MemberSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentRole = searchParams.get("role") ?? "";
  const currentSearch = searchParams.get("search") ?? "";

  function updateParams(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    startTransition(() => {
      router.push(`/members?${params.toString()}`);
    });
  }

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
        />
        <input
          type="text"
          placeholder="名前・会社名で検索..."
          defaultValue={currentSearch}
          onChange={(e) => updateParams("search", e.target.value)}
          className="w-full rounded-lg border border-border bg-white pl-9 pr-3.5 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Role filter */}
      <div className="flex flex-wrap gap-2">
        {roles.map((role) => (
          <button
            key={role.value}
            onClick={() => updateParams("role", role.value)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              currentRole === role.value
                ? "bg-primary text-white"
                : "bg-white border border-border text-gray-600 hover:bg-gray-50"
            }`}
          >
            {role.label}
          </button>
        ))}
      </div>

      {isPending && (
        <div className="text-xs text-muted">検索中...</div>
      )}
    </div>
  );
}
