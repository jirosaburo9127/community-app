"use client";

import { createClient } from "@/lib/supabase/client";
import { Send } from "lucide-react";
import { useState } from "react";

export function MessageInput({
  conversationId,
  senderId,
  onMessageSent,
}: {
  conversationId: string;
  senderId: string;
  onMessageSent?: (msg: { id: string; conversation_id: string; sender_id: string; body: string; is_read: boolean; created_at: string }) => void;
}) {
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = body.trim();
    if (!text || sending) return;

    setSending(true);
    setBody("");
    const supabase = createClient();

    const { data, error } = await supabase
      .from("direct_messages")
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        body: text,
      })
      .select()
      .single();

    if (error) {
      console.error("Failed to send message:", error.message);
      setBody(text);
    } else if (data && onMessageSent) {
      onMessageSent(data);
    }
    setSending(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        type="text"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="メッセージを入力..."
        className="flex-1 rounded-xl border border-border bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      />
      <button
        type="submit"
        disabled={!body.trim() || sending}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-md transition-all hover:shadow-md disabled:opacity-50"
      >
        <Send size={16} />
      </button>
    </form>
  );
}
