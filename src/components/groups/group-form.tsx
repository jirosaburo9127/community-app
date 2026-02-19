"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function GroupForm() {
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

      if (!name) {
        setError("グループ名を入力してください");
        return;
      }

      const slug =
        name
          .toLowerCase()
          .replace(/[^a-z0-9\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]+/g, "-")
          .replace(/^-|-$/g, "") || Date.now().toString();

      // Handle avatar upload
      let avatar_url: string | null = null;
      const avatar = formData.get("avatar") as File | null;
      if (avatar && avatar.size > 0) {
        const ext = avatar.name.split(".").pop();
        const path = `groups/${user.id}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("post-images")
          .upload(path, avatar);

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from("post-images")
            .getPublicUrl(path);
          avatar_url = urlData.publicUrl;
        }
      }

      const { data: group, error: insertError } = await supabase
        .from("groups")
        .insert({
          name,
          slug,
          description,
          avatar_url,
          creator_id: user.id,
        })
        .select()
        .single();

      if (insertError) {
        setError(insertError.message);
        return;
      }

      // Add creator as admin member
      await supabase.from("group_members").insert({
        group_id: group.id,
        user_id: user.id,
        role: "管理者",
      });

      router.push(`/groups/${group.slug}`);
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
          グループ名
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          maxLength={100}
          placeholder="例：デザインチーム"
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
          placeholder="グループの説明を入力..."
          className="w-full rounded-lg border border-border px-3.5 py-2.5 text-sm leading-relaxed focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <div>
        <label htmlFor="avatar" className="block text-sm font-medium text-gray-700 mb-1">
          アイコン画像（任意）
        </label>
        <input
          id="avatar"
          name="avatar"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="block w-full text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-primary/8 file:px-4 file:py-2.5 file:text-sm file:font-medium file:text-primary file:cursor-pointer"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-gradient-to-r from-primary to-accent px-4 py-2.5 text-sm font-medium text-white shadow-md shadow-primary/20 transition-all hover:shadow-lg disabled:opacity-50"
      >
        {pending ? "作成中..." : "グループを作成"}
      </button>
    </form>
  );
}
