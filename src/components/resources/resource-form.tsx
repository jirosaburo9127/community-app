"use client";

import { createClient } from "@/lib/supabase/client";
import { RESOURCE_CATEGORIES } from "@/lib/constants";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ResourceForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError("ログインが必要です");
        return;
      }

      const title = (formData.get("title") as string).trim();
      const url = (formData.get("url") as string).trim();
      const category = formData.get("category") as string;
      const description = (formData.get("description") as string).trim();

      if (!title || !url || !category) {
        setError("タイトル、URL、カテゴリを入力してください");
        return;
      }

      const { data: resource, error: insertError } = await supabase
        .from("resources")
        .insert({
          title,
          url,
          category,
          description,
          author_id: user.id,
        })
        .select()
        .single();

      if (insertError) {
        setError(insertError.message);
        return;
      }

      router.push(`/resources/${resource.id}`);
    } catch {
      setError("作成に失敗しました");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          タイトル
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          maxLength={100}
          placeholder="リソースのタイトル"
          className="w-full rounded-lg border border-border px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <div>
        <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
          URL
        </label>
        <input
          id="url"
          name="url"
          type="url"
          required
          placeholder="https://..."
          className="w-full rounded-lg border border-border px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
          カテゴリ
        </label>
        <select
          id="category"
          name="category"
          required
          className="w-full rounded-lg border border-border px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">選択してください</option>
          {RESOURCE_CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.emoji} {cat.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          説明（任意）
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          placeholder="リソースの概要や活用方法を書きましょう"
          className="w-full rounded-lg border border-border px-3.5 py-2.5 text-sm leading-relaxed focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-gradient-to-r from-primary to-accent px-4 py-2.5 text-sm font-medium text-white shadow-md shadow-primary/20 transition-all hover:shadow-lg disabled:opacity-50"
      >
        {pending ? "作成中..." : "リソースを共有"}
      </button>
    </form>
  );
}
