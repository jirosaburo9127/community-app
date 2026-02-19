"use client";

import { createClient } from "@/lib/supabase/client";
import type { StartupStage } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useState } from "react";

const stageOptions: { value: StartupStage; label: string }[] = [
  { value: "idea", label: "アイデア" },
  { value: "mvp", label: "MVP" },
  { value: "seed", label: "シード" },
  { value: "series_a", label: "シリーズA" },
];

export function StartupForm() {
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

      const name = (formData.get("name") as string).trim();
      const description = (formData.get("description") as string).trim();
      const stage = formData.get("stage") as StartupStage;
      const industry = (formData.get("industry") as string).trim();
      const website_url = (formData.get("website_url") as string).trim();

      if (!name) {
        setError("スタートアップ名を入力してください");
        return;
      }

      // Generate slug from name
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]+/g, "-")
        .replace(/^-|-$/g, "")
        || Date.now().toString();

      // Handle logo upload
      let logo_url: string | null = null;
      const logo = formData.get("logo") as File | null;
      if (logo && logo.size > 0) {
        const ext = logo.name.split(".").pop();
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("startup-logos")
          .upload(path, logo);

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from("startup-logos")
            .getPublicUrl(path);
          logo_url = urlData.publicUrl;
        }
      }

      const { data: startup, error: insertError } = await supabase
        .from("startups")
        .insert({
          name,
          slug,
          logo_url,
          description,
          stage,
          industry,
          website_url,
          creator_id: user.id,
        })
        .select()
        .single();

      if (insertError) {
        setError(insertError.message);
        return;
      }

      // Add creator as a member
      await supabase.from("startup_members").insert({
        startup_id: startup.id,
        user_id: user.id,
        role: "代表",
      });

      router.push(`/startups/${startup.slug}`);
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
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          スタートアップ名
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          maxLength={100}
          placeholder="例：TechVenture Inc."
          className="w-full rounded-lg border border-border px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <div>
        <label htmlFor="stage" className="block text-sm font-medium text-gray-700 mb-1">
          ステージ
        </label>
        <select
          id="stage"
          name="stage"
          required
          className="w-full rounded-lg border border-border px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          {stageOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1">
          業界
        </label>
        <input
          id="industry"
          name="industry"
          type="text"
          placeholder="例：EdTech, FinTech, HealthTech"
          className="w-full rounded-lg border border-border px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          説明
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          placeholder="スタートアップの概要を書きましょう"
          className="w-full rounded-lg border border-border px-3.5 py-2.5 text-sm leading-relaxed focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <div>
        <label htmlFor="website_url" className="block text-sm font-medium text-gray-700 mb-1">
          ウェブサイト（任意）
        </label>
        <input
          id="website_url"
          name="website_url"
          type="url"
          placeholder="https://..."
          className="w-full rounded-lg border border-border px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <div>
        <label htmlFor="logo" className="block text-sm font-medium text-gray-700 mb-1">
          ロゴ（任意）
        </label>
        <input
          id="logo"
          name="logo"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/svg+xml"
          className="block w-full text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-primary/8 file:px-4 file:py-2.5 file:text-sm file:font-medium file:text-primary file:cursor-pointer"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-gradient-to-r from-primary to-accent px-4 py-2.5 text-sm font-medium text-white shadow-md shadow-primary/20 transition-all hover:shadow-lg disabled:opacity-50"
      >
        {pending ? "作成中..." : "スタートアップを登録"}
      </button>
    </form>
  );
}
