"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function EventForm() {
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
      const description = (formData.get("description") as string).trim();
      const event_date = formData.get("event_date") as string;
      const end_date = (formData.get("end_date") as string) || null;
      const location = (formData.get("location") as string).trim();
      const capacityStr = formData.get("capacity") as string;
      const capacity = capacityStr ? Number(capacityStr) : null;

      if (!title || !event_date) {
        setError("タイトルと開催日時を入力してください");
        return;
      }

      // Handle image upload
      let image_url: string | null = null;
      const image = formData.get("image") as File | null;
      if (image && image.size > 0) {
        const ext = image.name.split(".").pop();
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("event-images")
          .upload(path, image);

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from("event-images")
            .getPublicUrl(path);
          image_url = urlData.publicUrl;
        }
      }

      const { data: event, error: insertError } = await supabase
        .from("events")
        .insert({
          title,
          description,
          event_date: new Date(event_date).toISOString(),
          end_date: end_date ? new Date(end_date).toISOString() : null,
          location,
          capacity,
          image_url,
          organizer_id: user.id,
        })
        .select()
        .single();

      if (insertError) {
        setError(insertError.message);
        return;
      }

      router.push(`/events/${event.id}`);
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
          イベント名
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          maxLength={100}
          placeholder="例：ピッチイベント Vol.3"
          className="w-full rounded-lg border border-border px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="event_date" className="block text-sm font-medium text-gray-700 mb-1">
            開始日時
          </label>
          <input
            id="event_date"
            name="event_date"
            type="datetime-local"
            required
            className="w-full rounded-lg border border-border px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div>
          <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">
            終了日時（任意）
          </label>
          <input
            id="end_date"
            name="end_date"
            type="datetime-local"
            className="w-full rounded-lg border border-border px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
          場所
        </label>
        <input
          id="location"
          name="location"
          type="text"
          placeholder="例：コワーキングスペース3F"
          className="w-full rounded-lg border border-border px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <div>
        <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-1">
          定員（任意）
        </label>
        <input
          id="capacity"
          name="capacity"
          type="number"
          min="1"
          placeholder="人数制限なしの場合は空欄"
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
          placeholder="イベントの詳細を書きましょう"
          className="w-full rounded-lg border border-border px-3.5 py-2.5 text-sm leading-relaxed focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <div>
        <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
          カバー画像（任意）
        </label>
        <input
          id="image"
          name="image"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="block w-full text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-primary/8 file:px-4 file:py-2.5 file:text-sm file:font-medium file:text-primary file:cursor-pointer"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md disabled:opacity-50"
      >
        {pending ? "作成中..." : "イベントを作成"}
      </button>
    </form>
  );
}
