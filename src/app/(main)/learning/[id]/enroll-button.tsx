"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function EnrollButton({ courseId }: { courseId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleEnroll() {
    setPending(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { error } = await supabase.from("course_enrollments").insert({
        course_id: courseId,
        user_id: user.id,
      });

      if (!error) {
        router.refresh();
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      onClick={handleEnroll}
      disabled={pending}
      className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md disabled:opacity-50"
    >
      {pending ? "登録中..." : "このコースを受講する"}
    </button>
  );
}
