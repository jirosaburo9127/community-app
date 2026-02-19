"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function signUp(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const displayName = formData.get("displayName") as string;
  const invitationCode = formData.get("invitationCode") as string;

  if (!invitationCode) {
    return { error: "招待コードを入力してください" };
  }

  // Validate invitation code
  const { data: invitation, error: invError } = await supabase
    .from("invitations")
    .select("id, code, used_by, expires_at")
    .eq("code", invitationCode)
    .single();

  if (invError || !invitation) {
    return { error: "招待コードが無効です" };
  }

  if (invitation.used_by) {
    return { error: "この招待コードは既に使用されています" };
  }

  if (invitation.expires_at && new Date(invitation.expires_at) < new Date()) {
    return { error: "この招待コードは有効期限が切れています" };
  }

  // Create user
  const { data: authData, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Mark invitation as used
  if (authData.user) {
    await supabase
      .from("invitations")
      .update({ used_by: authData.user.id, used_at: new Date().toISOString() })
      .eq("id", invitation.id);
  }

  redirect("/home");
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/home");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
