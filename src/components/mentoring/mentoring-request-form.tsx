"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function MentoringRequestForm({ mentorId }: { mentorId: string }) {
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

      const message = (formData.get("message") as string).trim();

      if (!message) {
        setError("メッセージを入力してください");
        return;
      }

      const { error: insertError } = await supabase
        .from("mentoring_requests")
        .insert({
          mentor_id: mentorId,
          mentee_id: user.id,
          message,
        });

      if (insertError) {
        if (insertError.code === "23505") {
          setError("既に申請済みです");
        } else {
          setError(insertError.message);
        }
        return;
      }

      router.push("/mentoring");
    } catch {
      setError("申請に失敗しました");
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
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
          メッセージ
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          placeholder="メンターに伝えたいこと、相談したいテーマなどを書きましょう"
          className="w-full rounded-lg border border-border px-3.5 py-2.5 text-sm leading-relaxed focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-gradient-to-r from-primary to-accent px-4 py-2.5 text-sm font-medium text-white shadow-md shadow-primary/20 transition-all hover:shadow-lg disabled:opacity-50"
      >
        {pending ? "送信中..." : "メンタリングを申請"}
      </button>
    </form>
  );
}
