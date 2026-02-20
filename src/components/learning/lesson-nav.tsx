import type { Lesson } from "@/lib/types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

export function LessonNav({
  courseId,
  prev,
  next,
}: {
  courseId: string;
  prev: Lesson | null;
  next: Lesson | null;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      {prev ? (
        <Link
          href={`/learning/${courseId}/lessons/${prev.id}`}
          className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50"
        >
          <ChevronLeft size={16} />
          <span className="max-w-[140px] truncate">{prev.title}</span>
        </Link>
      ) : (
        <div />
      )}

      {next ? (
        <Link
          href={`/learning/${courseId}/lessons/${next.id}`}
          className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50"
        >
          <span className="max-w-[140px] truncate">{next.title}</span>
          <ChevronRight size={16} />
        </Link>
      ) : (
        <div />
      )}
    </div>
  );
}
