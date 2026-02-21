"use client";

import type { DirectMessage } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { MessageInput } from "./message-input";
import Image from "next/image";
import { useEffect, useRef, useState, useCallback } from "react";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";

export function MessageThread({
  conversationId,
  currentUserId,
  initialMessages,
}: {
  conversationId: string;
  currentUserId: string;
  initialMessages: DirectMessage[];
}) {
  const [messages, setMessages] = useState<DirectMessage[]>(initialMessages);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark unread messages as read
  useEffect(() => {
    const unreadIds = messages
      .filter((m) => !m.is_read && m.sender_id !== currentUserId)
      .map((m) => m.id);

    if (unreadIds.length === 0) return;

    const supabase = createClient();
    supabase
      .from("direct_messages")
      .update({ is_read: true })
      .in("id", unreadIds)
      .then(({ error }) => {
        if (error) console.error("Failed to mark as read:", error.message);
      });
  }, [messages, currentUserId]);

  // Subscribe to realtime messages (for receiving from other user)
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`dm:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "direct_messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          const newMsg = payload.new as DirectMessage;

          // Skip if it's our own message (already added optimistically)
          if (newMsg.sender_id === currentUserId) return;

          // Fetch sender profile
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", newMsg.sender_id)
            .single();

          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, { ...newMsg, profiles: profile ?? undefined }];
          });

          // Mark as read
          await supabase
            .from("direct_messages")
            .update({ is_read: true })
            .eq("id", newMsg.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, currentUserId]);

  // Optimistic add for sent messages
  const handleMessageSent = useCallback(
    (msg: { id: string; conversation_id: string; sender_id: string; body: string; is_read: boolean; created_at: string }) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg as DirectMessage];
      });
    },
    []
  );

  return (
    <div className="flex h-full flex-col">
      {/* Messages */}
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((msg) => {
          const isMine = msg.sender_id === currentUserId;
          const timeAgo = formatDistanceToNow(new Date(msg.created_at), {
            addSuffix: true,
            locale: ja,
          });

          return (
            <div
              key={msg.id}
              className={`flex items-end gap-2 ${isMine ? "flex-row-reverse" : ""}`}
            >
              {!isMine && (
                msg.profiles?.avatar_url ? (
                  <Image
                    src={msg.profiles.avatar_url}
                    alt={msg.profiles.display_name}
                    width={28}
                    height={28}
                    className="h-7 w-7 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                    {msg.profiles?.display_name?.charAt(0) ?? "?"}
                  </div>
                )
              )}
              <div
                className={`max-w-[70%] rounded-2xl px-3.5 py-2 text-sm ${
                  isMine
                    ? "bg-primary text-white rounded-br-md"
                    : "bg-gray-100 text-gray-900 rounded-bl-md"
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{msg.body}</p>
                <p
                  className={`mt-1 text-[10px] ${
                    isMine ? "text-white/60" : "text-gray-400"
                  }`}
                >
                  {timeAgo}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border bg-white p-3">
        <MessageInput
          conversationId={conversationId}
          senderId={currentUserId}
          onMessageSent={handleMessageSent}
        />
      </div>
    </div>
  );
}
