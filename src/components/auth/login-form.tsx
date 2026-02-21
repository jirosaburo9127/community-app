"use client";

import { signIn } from "@/lib/actions/auth";
import Link from "next/link";
import { useActionState } from "react";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(
    async (_prev: { error: string } | null, formData: FormData) => {
      const result = await signIn(formData);
      return result ?? null;
    },
    null
  );

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div className="rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-600">
          {state.error}
        </div>
      )}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          メールアドレス
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          className="block w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          パスワード
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          className="block w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md disabled:opacity-50"
      >
        {pending ? "ログイン中..." : "ログイン"}
      </button>
      <p className="text-center text-sm text-muted">
        アカウントをお持ちでない方は{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          新規登録
        </Link>
      </p>
    </form>
  );
}
