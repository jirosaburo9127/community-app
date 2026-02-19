"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function toggleBookmark(postId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "ログインが必要です" };
  }

  const { data: existing } = await supabase
    .from("bookmarks")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .single();

  if (existing) {
    await supabase.from("bookmarks").delete().eq("id", existing.id);
  } else {
    await supabase.from("bookmarks").insert({
      post_id: postId,
      user_id: user.id,
    });
  }

  revalidatePath(`/posts/${postId}`);
  revalidatePath("/bookmarks");
}
