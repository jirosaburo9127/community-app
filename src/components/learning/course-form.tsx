"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Course } from "@/lib/types";

export function CourseForm({ course }: { course?: Course }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const isEdit = !!course;

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
      const description = (formData.get("description") as string).trim();
      const difficulty = formData.get("difficulty") as string;
      const isPublished = formData.get("is_published") === "on";

      if (!title) {
        setError("タイトルを入力してください");
        return;
      }

      // Handle cover image upload
      let cover_image_url: string | null = course?.cover_image_url ?? null;
      const coverImage = formData.get("cover_image") as File | null;
      if (coverImage && coverImage.size > 0) {
        const ext = coverImage.name.split(".").pop();
        const path = `courses/${user.id}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("course-images")
          .upload(path, coverImage);

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from("course-images")
            .getPublicUrl(path);
          cover_image_url = urlData.publicUrl;
        }
      }

      if (isEdit && course) {
        const { error: updateError } = await supabase
          .from("courses")
          .update({
            title,
            description,
            difficulty,
            cover_image_url,
            is_published: isPublished,
            updated_at: new Date().toISOString(),
          })
          .eq("id", course.id);

        if (updateError) {
          setError(updateError.message);
          return;
        }
        router.push(`/learning/${course.id}`);
      } else {
        const { data: newCourse, error: insertError } = await supabase
          .from("courses")
          .insert({
            title,
            description,
            difficulty,
            cover_image_url,
            is_published: isPublished,
            instructor_id: user.id,
          })
          .select()
          .single();

        if (insertError) {
          setError(insertError.message);
          return;
        }
        router.push(`/learning/${newCourse.id}`);
      }
    } catch {
      setError("保存に失敗しました");
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
          maxLength={200}
          defaultValue={course?.title}
          placeholder="例：Webマーケティング入門"
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
          defaultValue={course?.description}
          placeholder="コースの概要を入力..."
          className="w-full rounded-lg border border-border px-3.5 py-2.5 text-sm leading-relaxed focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <div>
        <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">
          難易度
        </label>
        <select
          id="difficulty"
          name="difficulty"
          defaultValue={course?.difficulty ?? "beginner"}
          className="w-full rounded-lg border border-border px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="beginner">初級</option>
          <option value="intermediate">中級</option>
          <option value="advanced">上級</option>
        </select>
      </div>

      <div>
        <label htmlFor="cover_image" className="block text-sm font-medium text-gray-700 mb-1">
          カバー画像（任意）
        </label>
        <input
          id="cover_image"
          name="cover_image"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="block w-full text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-primary/8 file:px-4 file:py-2.5 file:text-sm file:font-medium file:text-primary file:cursor-pointer"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="is_published"
          name="is_published"
          type="checkbox"
          defaultChecked={course?.is_published ?? false}
          className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
        />
        <label htmlFor="is_published" className="text-sm font-medium text-gray-700">
          公開する
        </label>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-gradient-to-r from-primary to-accent px-4 py-2.5 text-sm font-medium text-white shadow-md shadow-primary/20 transition-all hover:shadow-lg disabled:opacity-50"
      >
        {pending ? "保存中..." : isEdit ? "コースを更新" : "コースを作成"}
      </button>
    </form>
  );
}
