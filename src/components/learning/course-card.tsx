import type { Course } from "@/lib/types";
import { BookOpen, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const difficultyLabels: Record<string, string> = {
  beginner: "初級",
  intermediate: "中級",
  advanced: "上級",
};

const difficultyColors: Record<string, string> = {
  beginner: "bg-green-100 text-green-700",
  intermediate: "bg-yellow-100 text-yellow-700",
  advanced: "bg-red-100 text-red-700",
};

export function CourseCard({ course }: { course: Course }) {
  return (
    <Link
      href={`/learning/${course.id}`}
      className="overflow-hidden rounded-xl border border-border bg-white transition-all hover:shadow-md hover:-translate-y-0.5"
    >
      {course.cover_image_url ? (
        <Image
          src={course.cover_image_url}
          alt={course.title}
          width={400}
          height={200}
          className="h-36 w-full object-cover"
        />
      ) : (
        <div className="flex h-36 items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
          <BookOpen size={40} className="text-primary/40" />
        </div>
      )}

      <div className="p-4">
        <div className="mb-2 flex items-center gap-2">
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${difficultyColors[course.difficulty] ?? ""}`}
          >
            {difficultyLabels[course.difficulty] ?? course.difficulty}
          </span>
        </div>

        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">
          {course.title}
        </h3>

        {course.description && (
          <p className="mt-1 text-xs text-gray-600 line-clamp-2">
            {course.description}
          </p>
        )}

        <div className="mt-3 flex items-center gap-3 text-xs text-muted">
          <span className="flex items-center gap-1">
            <BookOpen size={12} />
            {course.lesson_count} レッスン
          </span>
          <span className="flex items-center gap-1">
            <Users size={12} />
            {course.enrollment_count} 受講者
          </span>
        </div>

        {course.profiles && (
          <p className="mt-2 text-[11px] text-muted">
            講師: {course.profiles.display_name}
          </p>
        )}
      </div>
    </Link>
  );
}
