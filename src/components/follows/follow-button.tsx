"use client";

import { createClient } from "@/lib/supabase/client";
import { UserPlus, UserMinus } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function FollowButton({
  targetUserId,
  currentUserId,
  initialFollowing,
}: {
  targetUserId: string;
  currentUserId: string;
  initialFollowing: boolean;
}) {
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowing);
  const [pending, setPending] = useState(false);

  if (currentUserId === targetUserId) return null;

  async function handleToggle() {
    setPending(true);
    try {
      const supabase = createClient();
      if (following) {
        await supabase
          .from("follows")
          .delete()
          .eq("follower_id", currentUserId)
          .eq("following_id", targetUserId);
        setFollowing(false);
      } else {
        await supabase
          .from("follows")
          .insert({ follower_id: currentUserId, following_id: targetUserId });
        setFollowing(true);
      }
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={pending}
      className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition-all disabled:opacity-50 ${
        following
          ? "border border-border text-muted hover:bg-gray-50 hover:text-gray-700"
          : "bg-primary text-white hover:bg-primary/90 shadow-sm"
      }`}
    >
      {following ? (
        <>
          <UserMinus size={15} />
          フォロー中
        </>
      ) : (
        <>
          <UserPlus size={15} />
          フォロー
        </>
      )}
    </button>
  );
}
