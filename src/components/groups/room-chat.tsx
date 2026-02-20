"use client";

import type { RoomMessage } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { RoomMessageInput } from "./room-message-input";
import Image from "next/image";
import { useEffect, useRef, useState, useCallback } from "react";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";

export function RoomChat({
  roomId,
  currentUserId,
  initialMessages,
}: {
  roomId: string;
  currentUserId: string;
  initialMessages: RoomMessage[];
}) {
  const [messages, setMessages] = useState<RoomMessage[]>(initialMessages);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Subscribe to realtime messages
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "room_messages",
          filter: `room_id=eq.${roomId}`,
        },
        async (payload) => {
          const newMsg = payload.new as RoomMessage;

          // Skip own messages (already added optimistically)
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
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, currentUserId]);

  // Optimistic add for sent messages
  const handleMessageSent = useCallback(
    (msg: {
      id: string;
      room_id: string;
      sender_id: string;
      body: string;
      created_at: string;
    }) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg as RoomMessage];
      });
    },
    []
  );

  return (
    <div className="flex h-full flex-col">
      {/* Messages */}
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="text-center text-sm text-muted py-8">
            まだメッセージがありません。最初のメッセージを送信しましょう！
          </p>
        )}
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
              {!isMine &&
                (msg.profiles?.avatar_url ? (
                  <Image
                    src={msg.profiles.avatar_url}
                    alt={msg.profiles.display_name}
                    width={28}
                    height={28}
                    className="h-7 w-7 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-[10px] font-bold text-white">
                    {msg.profiles?.display_name?.charAt(0) ?? "?"}
                  </div>
                ))}
              <div>
                {!isMine && msg.profiles && (
                  <p className="mb-0.5 text-[10px] font-medium text-muted ml-1">
                    {msg.profiles.display_name}
                  </p>
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
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border bg-white p-3">
        <RoomMessageInput
          roomId={roomId}
          senderId={currentUserId}
          onMessageSent={handleMessageSent}
        />
      </div>
    </div>
  );
}
