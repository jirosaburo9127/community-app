"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function RequestActions({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleAction(status: "accepted" | "rejected") {
    setPending(true);
    const supabase = createClient();
    await supabase
      .from("mentoring_requests")
      .update({ status })
      .eq("id", requestId);
    router.refresh();
    setPending(false);
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => handleAction("accepted")}
        disabled={pending}
        className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
      >
        承認
      </button>
      <button
        onClick={() => handleAction("rejected")}
        disabled={pending}
        className="rounded-lg bg-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-300 disabled:opacity-50"
      >
        却下
      </button>
    </div>
  );
}
