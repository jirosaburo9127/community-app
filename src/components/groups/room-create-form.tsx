"use client";

import { createClient } from "@/lib/supabase/client";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function RoomCreateForm({ groupId }: { groupId: string }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || creating) return;

    setCreating(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("group_rooms").insert({
      group_id: groupId,
      name: trimmed,
      description: description.trim(),
      creator_id: user!.id,
    });

    if (error) {
      console.error("Failed to create room:", error.message);
      alert(
        error.message.includes("duplicate")
          ? "同じ名前のルームが既に存在します"
          : "ルームの作成に失敗しました"
      );
    } else {
      setName("");
      setDescription("");
      setOpen(false);
      router.refresh();
    }
    setCreating(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-primary/90"
      >
        <Plus size={14} />
        ルーム作成
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-border bg-white p-4 space-y-3"
    >
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="ルーム名（例: 雑談、開発）"
        className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        autoFocus
      />
      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="説明（任意）"
        className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={!name.trim() || creating}
          className="rounded-lg bg-primary px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {creating ? "作成中..." : "作成"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg border border-border px-4 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50"
        >
          キャンセル
        </button>
      </div>
    </form>
  );
}
