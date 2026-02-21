"use client";

import { createClient } from "@/lib/supabase/client";
import type { Category } from "@/lib/types";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function PostForm({
  categories,
  groupId,
  groupSlug,
}: {
  categories: Category[];
  groupId?: string;
  groupSlug?: string;
}) {
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

      const title = formData.get("title") as string;
      const body = formData.get("body") as string;
      const categoryId = Number(formData.get("categoryId"));

      if (!title?.trim() || !body?.trim() || (!groupId && !categoryId)) {
        setError("すべての項目を入力してください");
        return;
      }

      // Handle image upload
      const imageUrls: string[] = [];
      const image = formData.get("image") as File | null;
      if (image && image.size > 0) {
        const ext = image.name.split(".").pop();
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("post-images")
          .upload(path, image);

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from("post-images")
            .getPublicUrl(path);
          imageUrls.push(urlData.publicUrl);
        }
      }

      const insertData: Record<string, unknown> = {
        author_id: user.id,
        title,
        body,
        category_id: categoryId || null,
        image_urls: imageUrls,
      };
      if (groupId) {
        insertData.group_id = groupId;
      }

      const { data: post, error: insertError } = await supabase
        .from("posts")
        .insert(insertData)
        .select()
        .single();

      if (insertError) {
        setError(insertError.message);
        return;
      }

      router.push(groupSlug ? `/groups/${groupSlug}` : `/posts/${post.id}`);
    } catch {
      setError("投稿に失敗しました");
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
      {!groupId && (
        <div>
          <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">
            カテゴリ
          </label>
          <select
            id="categoryId"
            name="categoryId"
            required
            className="block w-full rounded-lg border border-border px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">選択してください</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon_emoji} {cat.name}
              </option>
            ))}
          </select>
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
          placeholder="投稿のタイトルを入力"
          className="block w-full rounded-lg border border-border px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
      <div>
        <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-1">
          本文
        </label>
        <textarea
          id="body"
          name="body"
          required
          rows={6}
          placeholder="内容を入力..."
          className="block w-full rounded-lg border border-border px-3.5 py-2.5 text-sm leading-relaxed focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
      <div>
        <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
          画像（任意）
        </label>
        <input
          id="image"
          name="image"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="block w-full text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-primary/8 file:px-4 file:py-2.5 file:text-sm file:font-medium file:text-primary file:cursor-pointer"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md disabled:opacity-50"
      >
        {pending ? "投稿中..." : "投稿する"}
      </button>
    </form>
  );
}
