"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function createPost(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "ログインが必要です" };
  }

  const title = formData.get("title") as string;
  const body = formData.get("body") as string;
  const categoryId = Number(formData.get("categoryId"));

  if (!title?.trim() || !body?.trim() || !categoryId) {
    return { error: "すべての項目を入力してください" };
  }

  // Handle image upload
  const imageUrls: string[] = [];
  const image = formData.get("image") as File | null;
  if (image && image.size > 0) {
    const ext = image.name.split(".").pop();
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("post-images")
      .upload(path, image);

    if (!uploadError) {
      const { data: urlData } = supabase.storage
        .from("post-images")
        .getPublicUrl(path);
      imageUrls.push(urlData.publicUrl);
    }
  }

  const { data: post, error } = await supabase
    .from("posts")
    .insert({
      author_id: user.id,
      title,
      body,
      category_id: categoryId,
      image_urls: imageUrls,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  redirect(`/posts/${post.id}`);
}
