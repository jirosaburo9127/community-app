"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "ログインが必要です" };
  }

  const displayName = formData.get("displayName") as string;
  const bio = formData.get("bio") as string;

  if (!displayName?.trim()) {
    return { error: "表示名を入力してください" };
  }

  // Handle avatar upload
  let avatarUrl: string | undefined;
  const avatar = formData.get("avatar") as File | null;
  if (avatar && avatar.size > 0) {
    const ext = avatar.name.split(".").pop();
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, avatar);

    if (!uploadError) {
      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(path);
      avatarUrl = urlData.publicUrl;
    }
  }

  const updateData: Record<string, string> = {
    display_name: displayName.trim(),
    bio: bio?.trim() ?? "",
    updated_at: new Date().toISOString(),
  };

  if (avatarUrl) {
    updateData.avatar_url = avatarUrl;
  }

  const { error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/profile");
  revalidatePath("/profile/edit");
  revalidatePath("/home");
  return { success: true };
}
