"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function RegistrationButton({
  eventId,
  isRegistered,
  isFull,
}: {
  eventId: string;
  isRegistered: boolean;
  isFull: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleToggle() {
    setPending(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      if (isRegistered) {
        await supabase
          .from("event_registrations")
          .delete()
          .eq("event_id", eventId)
          .eq("user_id", user.id);
      } else {
        await supabase.from("event_registrations").insert({
          event_id: eventId,
          user_id: user.id,
          status: "registered",
        });
      }

      router.refresh();
    } finally {
      setPending(false);
    }
  }

  if (!isRegistered && isFull) {
    return (
      <button
        disabled
        className="w-full rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-muted"
      >
        定員に達しました
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      disabled={pending}
      className={`w-full rounded-xl px-4 py-2.5 text-sm font-medium transition-all disabled:opacity-50 ${
        isRegistered
          ? "border border-red-200 text-red-600 hover:bg-red-50"
          : "bg-gradient-to-r from-primary to-accent text-white shadow-md shadow-primary/20 hover:shadow-lg"
      }`}
    >
      {pending
        ? "処理中..."
        : isRegistered
          ? "参加をキャンセル"
          : "参加登録する"}
    </button>
  );
}
