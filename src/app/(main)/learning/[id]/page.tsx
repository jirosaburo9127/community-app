import { ProgressBar } from "@/components/learning/progress-bar";
import {
  getCourse,
  getEnrollment,
  getLessonCompletions,
  getLessons,
} from "@/lib/queries/learning";
import { createClient } from "@/lib/supabase/server";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Edit2,
  Plus,
  Users,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EnrollButton } from "./enroll-button";

const difficultyLabels: Record<string, string> = {
  beginner: "初級",
  intermediate: "中級",
  advanced: "上級",
};

const difficultyColors: Record<string, string> = {
  beginner: "bg-green-100 text-green-700",
  intermediate: "bg-yellow-100 text-yellow-700",
  advanced: "bg-orange-100 text-orange-700",
};

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const course = await getCourse(id);
  if (!course) notFound();

  const lessons = await getLessons(id);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isInstructor = user?.id === course.instructor_id;
  const enrollment = user ? await getEnrollment(id, user.id) : null;
  const completions = user ? await getLessonCompletions(id, user.id) : [];
  const completedIds = new Set(completions.map((c) => c.lesson_id));

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-5 flex items-center gap-2">
        <Link
          href="/learning"
          className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-white"
        >
          <ArrowLeft size={18} className="text-muted" />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">コース詳細</h1>
      </div>

      {/* Course info */}
      <div className="overflow-hidden rounded-xl border border-border bg-white">
        {course.cover_image_url ? (
          <img
            src={course.cover_image_url}
            alt={course.title}
            className="h-40 w-full object-cover"
          />
        ) : (
          <div className="flex h-40 items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
            <BookOpen size={48} className="text-primary/30" />
          </div>
        )}

        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${difficultyColors[course.difficulty] ?? ""}`}
                >
                  {difficultyLabels[course.difficulty] ?? course.difficulty}
                </span>
                {!course.is_published && (
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                    非公開
                  </span>
                )}
              </div>
              <h2 className="text-lg font-bold text-gray-900">
                {course.title}
              </h2>
            </div>
            {isInstructor && (
              <Link
                href={`/learning/${id}/edit`}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <Edit2 size={16} />
              </Link>
            )}
          </div>

          {course.description && (
            <p className="mt-3 text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
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
            <p className="mt-2 text-xs text-muted">
              講師: {course.profiles.display_name}
            </p>
          )}

          {/* Enrollment / Progress */}
          <div className="mt-4">
            {enrollment ? (
              <ProgressBar completed={completedIds.size} total={lessons.length} />
            ) : (
              <EnrollButton courseId={id} />
            )}
          </div>
        </div>
      </div>

      {/* Lessons */}
      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">レッスン一覧</h3>
          {isInstructor && (
            <Link
              href={`/learning/${id}/lessons/new`}
              className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-primary/90"
            >
              <Plus size={12} />
              レッスン追加
            </Link>
          )}
        </div>

        {lessons.length > 0 ? (
          <div className="space-y-2">
            {lessons.map((lesson, idx) => {
              const isCompleted = completedIds.has(lesson.id);
              return (
                <Link
                  key={lesson.id}
                  href={
                    enrollment
                      ? `/learning/${id}/lessons/${lesson.id}`
                      : `/learning/${id}`
                  }
                  className={`flex items-center gap-3 rounded-xl border bg-white p-3.5 transition-all ${
                    enrollment
                      ? "border-border hover:shadow-md hover:-translate-y-0.5"
                      : "border-border/50 opacity-60 cursor-default"
                  }`}
                >
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
                      isCompleted
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 size={16} /> : idx + 1}
                  </div>
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {lesson.title}
                  </span>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-sm text-muted py-6">
            まだレッスンがありません
          </div>
        )}
      </div>
    </div>
  );
}
