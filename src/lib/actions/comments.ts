"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addComment(postId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "ログインが必要です" };
  }

  const body = formData.get("body") as string;
  if (!body?.trim()) {
    return { error: "コメントを入力してください" };
  }

  const { error } = await supabase.from("comments").insert({
    post_id: postId,
    author_id: user.id,
    body: body.trim(),
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/posts/${postId}`);
}

export async function deleteComment(commentId: string, postId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "ログインが必要です" };
  }

  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId)
    .eq("author_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/posts/${postId}`);
}
