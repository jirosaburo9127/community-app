"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function toggleReaction(postId: string, emoji: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "ログインが必要です" };
  }

  // Check if reaction already exists
  const { data: existing } = await supabase
    .from("reactions")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .eq("emoji", emoji)
    .single();

  if (existing) {
    // Remove reaction
    await supabase.from("reactions").delete().eq("id", existing.id);
  } else {
    // Add reaction
    await supabase.from("reactions").insert({
      post_id: postId,
      user_id: user.id,
      emoji,
    });
  }

  revalidatePath("/home");
  revalidatePath(`/posts/${postId}`);
}
