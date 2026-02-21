"use client";

import { createClient } from "@/lib/supabase/client";
import { MENTORING_EXPERTISE_AREAS } from "@/lib/constants";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function MentorRegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [areas, setAreas] = useState<string[]>([]);

  function toggleArea(value: string) {
    setAreas((prev) =>
      prev.includes(value)
        ? prev.filter((a) => a !== value)
        : [...prev, value]
    );
  }

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

      if (areas.length === 0) {
        setError("得意分野を1つ以上選択してください");
        return;
      }

      const bio = (formData.get("bio") as string).trim();
      const maxMentees = parseInt(formData.get("max_mentees") as string) || 3;

      const { error: insertError } = await supabase
        .from("mentor_profiles")
        .insert({
          user_id: user.id,
          expertise_areas: areas,
          bio,
          max_mentees: maxMentees,
        });

      if (insertError) {
        if (insertError.code === "23505") {
          setError("既にメンター登録済みです");
        } else {
          setError(insertError.message);
        }
        return;
      }

      router.push("/mentoring");
    } catch {
      setError("登録に失敗しました");
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
        <label className="block text-sm font-medium text-gray-700 mb-2">
          得意分野（複数選択可）
        </label>
        <div className="flex flex-wrap gap-2">
          {MENTORING_EXPERTISE_AREAS.map((area) => (
            <button
              key={area.value}
              type="button"
              onClick={() => toggleArea(area.value)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                areas.includes(area.value)
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {area.emoji} {area.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
          自己紹介・メッセージ
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={4}
          placeholder="メンティーへのメッセージや経験を書きましょう"
          className="w-full rounded-lg border border-border px-3.5 py-2.5 text-sm leading-relaxed focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <div>
        <label htmlFor="max_mentees" className="block text-sm font-medium text-gray-700 mb-1">
          受入可能人数
        </label>
        <select
          id="max_mentees"
          name="max_mentees"
          className="w-full rounded-lg border border-border px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          {[1, 2, 3, 5, 10].map((n) => (
            <option key={n} value={n}>
              {n}名
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-gradient-to-r from-primary to-accent px-4 py-2.5 text-sm font-medium text-white shadow-md shadow-primary/20 transition-all hover:shadow-lg disabled:opacity-50"
      >
        {pending ? "登録中..." : "メンターとして登録"}
      </button>
    </form>
  );
}
