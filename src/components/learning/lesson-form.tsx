"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LessonForm({ courseId, lessonCount }: { courseId: string; lessonCount: number }) {
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
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("ログインが必要です");
        return;
      }

      const title = (formData.get("title") as string).trim();
      const content = (formData.get("content") as string).trim();

      if (!title) {
        setError("タイトルを入力してください");
        return;
      }

      const { error: insertError } = await supabase
        .from("lessons")
        .insert({
          course_id: courseId,
          title,
          content,
          sort_order: lessonCount + 1,
        });

      if (insertError) {
        setError(insertError.message);
        return;
      }

      router.push(`/learning/${courseId}`);
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
          レッスンタイトル
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          maxLength={200}
          placeholder="例：第1章 マーケティングの基本"
          className="w-full rounded-lg border border-border px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
          本文（Markdown対応）
        </label>
        <textarea
          id="content"
          name="content"
          rows={15}
          placeholder="レッスンの内容を入力..."
          className="w-full rounded-lg border border-border px-3.5 py-2.5 text-sm font-mono leading-relaxed focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md disabled:opacity-50"
      >
        {pending ? "追加中..." : "レッスンを追加"}
      </button>
    </form>
  );
}
