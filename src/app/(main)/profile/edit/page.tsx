"use client";

import { createClient } from "@/lib/supabase/client";
import type { Profile, ProfileRole } from "@/lib/types";
import { ArrowLeft, Camera, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const roleOptions: { value: ProfileRole; label: string }[] = [
  { value: "student", label: "学生" },
  { value: "entrepreneur", label: "起業家" },
  { value: "mentor", label: "メンター" },
  { value: "investor", label: "投資家" },
];

export default function ProfileEditPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [skillInput, setSkillInput] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) setProfile(data);
      setLoading(false);
    }
    loadProfile();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!profile) return;
    setPending(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const supabase = createClient();

      let avatarUrl = profile.avatar_url;

      if (avatarFile) {
        const ext = avatarFile.name.split(".").pop();
        const path = `${profile.id}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(path, avatarFile);

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from("avatars")
            .getPublicUrl(path);
          avatarUrl = urlData.publicUrl;
        }
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          display_name: formData.get("display_name") as string,
          bio: formData.get("bio") as string,
          role: formData.get("role") as ProfileRole,
          company: formData.get("company") as string,
          skills: profile.skills,
          twitter_url: formData.get("twitter_url") as string,
          linkedin_url: formData.get("linkedin_url") as string,
          github_url: formData.get("github_url") as string,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id);

      if (updateError) {
        setError(updateError.message);
        return;
      }

      router.push("/profile");
    } catch {
      setError("更新に失敗しました");
    } finally {
      setPending(false);
    }
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  function addSkill() {
    const skill = skillInput.trim();
    if (!skill || !profile) return;
    if (profile.skills.includes(skill)) return;
    setProfile({ ...profile, skills: [...profile.skills, skill] });
    setSkillInput("");
  }

  function removeSkill(skill: string) {
    if (!profile) return;
    setProfile({
      ...profile,
      skills: profile.skills.filter((s) => s !== skill),
    });
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-lg">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-gray-200" />
          <div className="h-64 rounded-xl bg-gray-200" />
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-5 flex items-center gap-2">
        <Link
          href="/profile"
          className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-white"
        >
          <ArrowLeft size={18} className="text-muted" />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">プロフィール編集</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-border bg-white p-5 space-y-4"
      >
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Avatar */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="group relative"
          >
            {(avatarPreview || profile.avatar_url) ? (
              <Image
                src={avatarPreview || profile.avatar_url!}
                alt={profile.display_name}
                width={80}
                height={80}
                className="h-20 w-20 rounded-full object-cover border-2 border-border"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-2xl font-bold text-white">
                {profile.display_name.charAt(0)}
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
              <Camera size={20} className="text-white" />
            </div>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />
        </div>

        <div>
          <label
            htmlFor="display_name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            表示名
          </label>
          <input
            id="display_name"
            name="display_name"
            type="text"
            required
            defaultValue={profile.display_name}
            className="w-full rounded-lg border border-border px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div>
          <label
            htmlFor="bio"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            自己紹介
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={3}
            defaultValue={profile.bio}
            placeholder="自己紹介を書きましょう"
            className="w-full rounded-lg border border-border px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div>
          <label
            htmlFor="role"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            ロール
          </label>
          <select
            id="role"
            name="role"
            defaultValue={profile.role}
            className="w-full rounded-lg border border-border px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {roleOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="company"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            会社・所属
          </label>
          <input
            id="company"
            name="company"
            type="text"
            defaultValue={profile.company}
            placeholder="例：株式会社〇〇"
            className="w-full rounded-lg border border-border px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Skills */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            スキル
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addSkill();
                }
              }}
              placeholder="例：React, Python"
              className="flex-1 rounded-lg border border-border px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              type="button"
              onClick={addSkill}
              className="shrink-0 rounded-lg bg-primary/10 px-3 py-2.5 text-sm font-medium text-primary hover:bg-primary/20"
            >
              追加
            </button>
          </div>
          {profile.skills.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {profile.skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 rounded-md bg-primary/8 px-2 py-1 text-xs font-medium text-primary"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="hover:text-red-500"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Social links */}
        <div>
          <label
            htmlFor="twitter_url"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Twitter URL
          </label>
          <input
            id="twitter_url"
            name="twitter_url"
            type="url"
            defaultValue={profile.twitter_url}
            placeholder="https://twitter.com/..."
            className="w-full rounded-lg border border-border px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div>
          <label
            htmlFor="linkedin_url"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            LinkedIn URL
          </label>
          <input
            id="linkedin_url"
            name="linkedin_url"
            type="url"
            defaultValue={profile.linkedin_url}
            placeholder="https://linkedin.com/in/..."
            className="w-full rounded-lg border border-border px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div>
          <label
            htmlFor="github_url"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            GitHub URL
          </label>
          <input
            id="github_url"
            name="github_url"
            type="url"
            defaultValue={profile.github_url}
            placeholder="https://github.com/..."
            className="w-full rounded-lg border border-border px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl bg-gradient-to-r from-primary to-accent px-4 py-2.5 text-sm font-medium text-white shadow-md shadow-primary/20 transition-all hover:shadow-lg disabled:opacity-50"
        >
          {pending ? "保存中..." : "保存する"}
        </button>
      </form>
    </div>
  );
}
