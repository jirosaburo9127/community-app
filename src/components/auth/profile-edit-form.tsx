"use client";

import { updateProfile } from "@/lib/actions/profile";
import type { Profile } from "@/lib/types";
import Image from "next/image";
import { useActionState, useRef, useState } from "react";

export function ProfileEditForm({ profile }: { profile: Profile }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(profile.avatar_url);

  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      const result = await updateProfile(formData);
      return result ?? null;
    },
    null
  );

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    }
  }

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
          {state.error}
        </div>
      )}
      {state?.success && (
        <div className="rounded-md bg-green-50 p-3 text-sm text-green-600">
          プロフィールを更新しました！
        </div>
      )}

      <div className="flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="group relative"
        >
          {preview ? (
            <Image
              src={preview}
              alt="アバター"
              width={80}
              height={80}
              className="h-20 w-20 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-2xl font-bold text-white">
              {profile.display_name.charAt(0)}
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <span className="text-xs font-medium text-white">変更</span>
          </div>
        </button>
        <input
          ref={fileInputRef}
          name="avatar"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
        <p className="text-xs text-muted">クリックしてアバターを変更</p>
      </div>

      <div>
        <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
          表示名
        </label>
        <input
          id="displayName"
          name="displayName"
          type="text"
          required
          defaultValue={profile.display_name}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
          自己紹介
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={4}
          defaultValue={profile.bio}
          placeholder="自己紹介を書いてみましょう..."
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-light disabled:opacity-50"
      >
        {pending ? "保存中..." : "保存する"}
      </button>
    </form>
  );
}
