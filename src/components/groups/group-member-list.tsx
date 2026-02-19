"use client";

import { createClient } from "@/lib/supabase/client";
import type { GroupMember } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function GroupMemberList({
  members,
  groupId,
  currentUserId,
  creatorId,
}: {
  members: GroupMember[];
  groupId: string;
  currentUserId: string | null;
  creatorId: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const isMember = members.some((m) => m.user_id === currentUserId);

  async function handleJoin() {
    if (!currentUserId) return;
    setPending(true);
    try {
      const supabase = createClient();
      await supabase.from("group_members").insert({
        group_id: groupId,
        user_id: currentUserId,
        role: "member",
      });
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  async function handleLeave() {
    if (!currentUserId) return;
    setPending(true);
    try {
      const supabase = createClient();
      await supabase
        .from("group_members")
        .delete()
        .eq("group_id", groupId)
        .eq("user_id", currentUserId);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">
          メンバー ({members.length})
        </h3>
        {currentUserId && currentUserId !== creatorId && (
          isMember ? (
            <button
              onClick={handleLeave}
              disabled={pending}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-gray-50 disabled:opacity-50"
            >
              {pending ? "処理中..." : "退出する"}
            </button>
          ) : (
            <button
              onClick={handleJoin}
              disabled={pending}
              className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {pending ? "処理中..." : "参加する"}
            </button>
          )
        )}
      </div>

      <div className="space-y-2">
        {members.map((member) => (
          <Link
            key={member.id}
            href={`/members/${member.user_id}`}
            className="flex items-center gap-3 rounded-lg border border-border bg-white p-3 transition-colors hover:bg-gray-50"
          >
            {member.profiles?.avatar_url ? (
              <Image
                src={member.profiles.avatar_url}
                alt={member.profiles.display_name}
                width={36}
                height={36}
                className="h-9 w-9 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-sm font-bold text-white">
                {member.profiles?.display_name?.charAt(0) ?? "?"}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900">
                {member.profiles?.display_name}
              </p>
              <p className="text-xs text-muted">{member.role}</p>
            </div>
            {member.user_id === creatorId && (
              <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent">
                作成者
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
