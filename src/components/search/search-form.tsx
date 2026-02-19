"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

export function SearchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const currentQuery = searchParams.get("q") ?? "";

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const q = formData.get("q") as string;
    if (q.trim()) {
      startTransition(() => {
        router.push(`/search?q=${encodeURIComponent(q.trim())}`);
      });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <Search
        size={18}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
      />
      <input
        type="text"
        name="q"
        placeholder="投稿・スタートアップ・メンバーを検索..."
        defaultValue={currentQuery}
        className="w-full rounded-xl border border-border bg-white pl-10 pr-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      />
      {isPending && (
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}
    </form>
  );
}
