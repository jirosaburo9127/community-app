"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function StartupBoardButton({
  startupId,
  startupName,
  startupSlug,
  members,
}: {
  startupId: string;
  startupName: string;
  startupSlug: string;
  members: { user_id: string; role: string }[];
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleCreate() {
    setPending(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Create group linked to startup
      const { data: group, error } = await supabase
        .from("groups")
        .insert({
          name: `${startupName} 掲示板`,
          slug: `startup-${startupSlug}`,
          description: `${startupName} のチーム掲示板`,
          creator_id: user.id,
          startup_id: startupId,
        })
        .select()
        .single();

      if (error || !group) return;

      // Add all startup members as group members
      const memberInserts = members.map((m) => ({
        group_id: group.id,
        user_id: m.user_id,
        role: m.role,
      }));

      if (memberInserts.length > 0) {
        await supabase.from("group_members").insert(memberInserts);
      }

      router.push(`/groups/${group.slug}`);
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      onClick={handleCreate}
      disabled={pending}
      className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-primary to-accent px-4 py-2 text-sm font-medium text-white shadow-md shadow-primary/20 transition-all hover:shadow-lg disabled:opacity-50"
    >
      {pending ? "作成中..." : "掲示板を作成"}
    </button>
  );
}
