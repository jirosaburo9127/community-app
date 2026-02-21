"use client";

import { createClient } from "@/lib/supabase/client";
import type { ProfileRole } from "@/lib/types";
import { Camera, Check, ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const STEPS = [
  { title: "ロール選択", description: "あなたの役割を教えてください" },
  { title: "自己紹介", description: "プロフィール情報を入力しましょう" },
  { title: "スキル", description: "得意なスキルを追加しましょう" },
  { title: "アバター", description: "プロフィール写真を設定しましょう" },
];

const roleOptions: {
  value: ProfileRole;
  label: string;
  icon: string;
  description: string;
}[] = [
  {
    value: "student",
    label: "学生",
    icon: "🎓",
    description: "学びながら起業を目指す",
  },
  {
    value: "entrepreneur",
    label: "起業家",
    icon: "🚀",
    description: "スタートアップを立ち上げている",
  },
  {
    value: "mentor",
    label: "メンター",
    icon: "🧭",
    description: "起業家の成長をサポートする",
  },
  {
    value: "investor",
    label: "投資家",
    icon: "💼",
    description: "スタートアップに投資する",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");

  // Form state
  const [role, setRole] = useState<ProfileRole>("student");
  const [bio, setBio] = useState("");
  const [company, setCompany] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profile?.onboarding_completed) {
        router.replace("/home");
        return;
      }

      setUserId(user.id);
      if (profile) {
        setDisplayName(profile.display_name || "");
        if (profile.role) setRole(profile.role);
      }
      setLoading(false);
    }
    load();
  }, [router]);

  function addSkill() {
    const skill = skillInput.trim();
    if (!skill || skills.includes(skill)) return;
    setSkills([...skills, skill]);
    setSkillInput("");
  }

  function removeSkill(skill: string) {
    setSkills(skills.filter((s) => s !== skill));
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function handleComplete() {
    if (!userId) return;
    setSaving(true);

    try {
      const supabase = createClient();

      let avatarUrl: string | null = null;
      if (avatarFile) {
        const ext = avatarFile.name.split(".").pop();
        const path = `${userId}/${Date.now()}.${ext}`;
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

      const updates: Record<string, unknown> = {
        role,
        bio,
        company,
        skills,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      };
      if (avatarUrl) {
        updates.avatar_url = avatarUrl;
      }

      await supabase.from("profiles").update(updates).eq("id", userId);

      router.replace("/home");
    } catch {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg py-4">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900">
          ようこそ、{displayName}さん!
        </h1>
        <p className="mt-1 text-sm text-muted">
          コミュニティで活動するためのプロフィールを設定しましょう
        </p>
      </div>

      {/* Step indicator */}
      <div className="mb-8 flex items-center justify-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s.title} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => i < step && setStep(i)}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-all ${
                i < step
                  ? "bg-primary text-white"
                  : i === step
                    ? "bg-primary text-white shadow-sm"
                    : "bg-gray-100 text-muted"
              }`}
            >
              {i < step ? <Check size={14} /> : i + 1}
            </button>
            {i < STEPS.length - 1 && (
              <div
                className={`h-0.5 w-6 rounded-full ${i < step ? "bg-primary" : "bg-gray-200"}`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step title */}
      <div className="mb-5 text-center">
        <h2 className="text-lg font-bold text-gray-900">
          {STEPS[step].title}
        </h2>
        <p className="text-sm text-muted">{STEPS[step].description}</p>
      </div>

      {/* Step content */}
      <div className="rounded-xl border border-border bg-white p-6">
        {/* Step 0: Role selection */}
        {step === 0 && (
          <div className="grid grid-cols-2 gap-3">
            {roleOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setRole(opt.value)}
                className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                  role === opt.value
                    ? "border-primary bg-primary/5 shadow-md"
                    : "border-border hover:border-primary/30 hover:bg-gray-50"
                }`}
              >
                <span className="text-3xl">{opt.icon}</span>
                <span className="text-sm font-bold text-gray-900">
                  {opt.label}
                </span>
                <span className="text-xs text-muted">{opt.description}</span>
              </button>
            ))}
          </div>
        )}

        {/* Step 1: Bio & Company */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label
                htmlFor="bio"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                自己紹介
              </label>
              <textarea
                id="bio"
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="自己紹介を書きましょう（経歴、興味のある分野など）"
                className="w-full rounded-lg border border-border px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
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
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="例：株式会社〇〇"
                className="w-full rounded-lg border border-border px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        )}

        {/* Step 2: Skills */}
        {step === 2 && (
          <div className="space-y-4">
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
                placeholder="例：React, Python, マーケティング"
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
            {skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 rounded-lg bg-primary/8 px-3 py-1.5 text-sm font-medium text-primary"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="hover:text-red-500"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-center text-sm text-muted py-4">
                スキルを追加してください（スキップも可能です）
              </p>
            )}
          </div>
        )}

        {/* Step 3: Avatar */}
        {step === 3 && (
          <div className="flex flex-col items-center gap-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="group relative"
            >
              {avatarPreview ? (
                <Image
                  src={avatarPreview}
                  alt="avatar"
                  width={120}
                  height={120}
                  className="h-30 w-30 rounded-full object-cover border-2 border-border"
                />
              ) : (
                <div className="flex h-30 w-30 items-center justify-center rounded-full bg-primary text-4xl font-bold text-white">
                  {displayName.charAt(0)}
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <Camera size={28} className="text-white" />
              </div>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
            <p className="text-sm text-muted">
              クリックして写真をアップロード
            </p>
            <p className="text-xs text-muted">
              スキップして後から設定することもできます
            </p>
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="mt-6 flex justify-between gap-3">
        {step > 0 ? (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="inline-flex items-center gap-1 rounded-xl border border-border bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50"
          >
            <ChevronLeft size={16} />
            戻る
          </button>
        ) : (
          <div />
        )}
        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={() => setStep(step + 1)}
            className="inline-flex items-center gap-1 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md"
          >
            次へ
            <ChevronRight size={16} />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleComplete}
            disabled={saving}
            className="inline-flex items-center gap-1 rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md disabled:opacity-50"
          >
            {saving ? "設定中..." : "完了してはじめる"}
          </button>
        )}
      </div>
    </div>
  );
}
