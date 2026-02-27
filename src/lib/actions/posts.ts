"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { rateLimit } from "@/lib/rate-limit";

export async function createPost(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "ログインが必要です" };
  }

  const { success } = rateLimit({
    key: `create-post:${user.id}`,
    limit: 10,
    windowMs: 5 * 60 * 1000, // 10 posts per 5 minutes
  });
  if (!success) {
    return { error: "投稿頻度が高すぎます。しばらくしてからお試しください" };
  }

  const title = formData.get("title") as string;
  const body = formData.get("body") as string;
  const categoryId = Number(formData.get("categoryId"));

  if (!title?.trim() || !body?.trim() || !categoryId) {
    return { error: "すべての項目を入力してください" };
  }

  if (title.trim().length > 100) {
    return { error: "タイトルは100文字以内で入力してください" };
  }

  if (body.trim().length > 10000) {
    return { error: "本文は10000文字以内で入力してください" };
  }

  // Handle image upload
  const ALLOWED_IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "gif"];
  const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

  const imageUrls: string[] = [];
  const image = formData.get("image") as File | null;
  if (image && image.size > 0) {
    if (image.size > MAX_IMAGE_SIZE) {
      return { error: "画像サイズは5MB以下にしてください" };
    }
    const ext = image.name.split(".").pop()?.toLowerCase();
    if (!ext || !ALLOWED_IMAGE_EXTENSIONS.includes(ext)) {
      return { error: "許可されている画像形式: JPG, PNG, WebP, GIF" };
    }
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
