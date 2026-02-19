"use client";

import { createClient } from "@/lib/supabase/client";
import { MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function DmButton({
  currentUserId,
  targetUserId,
}: {
  currentUserId: string;
  targetUserId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (loading || currentUserId === targetUserId) return;
    setLoading(true);

    const supabase = createClient();
    const [p1, p2] =
      currentUserId < targetUserId
        ? [currentUserId, targetUserId]
        : [targetUserId, currentUserId];

    // Find existing conversation
    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .eq("participant1", p1)
      .eq("participant2", p2)
      .maybeSingle();

    if (existing) {
      router.push(`/messages/${existing.id}`);
      return;
    }

    // Create new conversation
    const { data: created, error } = await supabase
      .from("conversations")
      .insert({ participant1: p1, participant2: p2 })
      .select("id")
      .single();

    if (error) {
      console.error("Failed to create conversation:", error.message);
      setLoading(false);
      return;
    }

    router.push(`/messages/${created.id}`);
  }

  if (currentUserId === targetUserId) return null;

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="flex items-center gap-1.5 rounded-lg border border-border bg-white px-3.5 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 hover:shadow-sm disabled:opacity-50"
    >
      <MessageCircle size={16} />
      {loading ? "..." : "メッセージ"}
    </button>
  );
}
