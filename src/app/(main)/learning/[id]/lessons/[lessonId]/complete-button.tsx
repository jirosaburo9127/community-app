"use client";

import { createClient } from "@/lib/supabase/client";
import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function CompleteButton({
  lessonId,
  courseId,
  isCompleted,
  totalLessons,
  completedCount,
}: {
  lessonId: string;
  courseId: string;
  isCompleted: boolean;
  totalLessons: number;
  completedCount: number;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(isCompleted);

  async function handleComplete() {
    if (done) return;
    setPending(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      // Mark lesson as complete (trigger awards 5pt)
      const { error } = await supabase.from("lesson_completions").insert({
        lesson_id: lessonId,
        user_id: user.id,
      });

      if (error) return;

      // Check if all lessons are now completed → mark course complete (trigger awards 20pt)
      const newCompletedCount = completedCount + 1;
      if (newCompletedCount >= totalLessons) {
        await supabase
          .from("course_enrollments")
          .update({ completed_at: new Date().toISOString() })
          .eq("course_id", courseId)
          .eq("user_id", user.id);
      }

      setDone(true);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  if (done) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-xl bg-green-50 border border-green-100 px-4 py-2.5 text-sm font-medium text-green-600">
        <CheckCircle2 size={16} />
        完了済み
      </div>
    );
  }

  return (
    <button
      onClick={handleComplete}
      disabled={pending}
      className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md disabled:opacity-50"
    >
      {pending ? "処理中..." : "レッスンを完了する"}
    </button>
  );
}
