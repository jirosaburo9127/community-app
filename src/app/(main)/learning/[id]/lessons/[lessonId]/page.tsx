import { LessonNav } from "@/components/learning/lesson-nav";
import {
  getCourse,
  getEnrollment,
  getLesson,
  getLessonCompletions,
  getLessons,
} from "@/lib/queries/learning";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeft, BookOpen } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CompleteButton } from "./complete-button";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string; lessonId: string }>;
}) {
  const { id, lessonId } = await params;

  const [course, lesson, lessons] = await Promise.all([
    getCourse(id),
    getLesson(lessonId),
    getLessons(id),
  ]);

  if (!course || !lesson) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) notFound();

  const enrollment = await getEnrollment(id, user.id);
  if (!enrollment) notFound();

  const completions = await getLessonCompletions(id, user.id);
  const completedIds = new Set(completions.map((c) => c.lesson_id));
  const isCompleted = completedIds.has(lessonId);

  // Find prev/next lessons
  const currentIdx = lessons.findIndex((l) => l.id === lessonId);
  const prevLesson = currentIdx > 0 ? lessons[currentIdx - 1] : null;
  const nextLesson =
    currentIdx < lessons.length - 1 ? lessons[currentIdx + 1] : null;

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-5 flex items-center gap-2">
        <Link
          href={`/learning/${id}`}
          className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-white"
        >
          <ArrowLeft size={18} className="text-muted" />
        </Link>
        <div className="min-w-0">
          <p className="text-xs text-muted truncate">{course.title}</p>
          <h1 className="text-lg font-bold text-gray-900 truncate">
            {lesson.title}
          </h1>
        </div>
      </div>

      {/* Lesson content */}
      <div className="rounded-xl border border-border bg-white p-5">
        {lesson.content ? (
          <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
            {lesson.content}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-muted">
            <BookOpen size={32} className="mb-2 opacity-40" />
            <p className="text-sm">コンテンツがありません</p>
          </div>
        )}
      </div>

      {/* Complete button */}
      <div className="mt-4">
        <CompleteButton
          lessonId={lessonId}
          courseId={id}
          isCompleted={isCompleted}
          totalLessons={lessons.length}
          completedCount={completedIds.size}
        />
      </div>

      {/* Prev/Next nav */}
      <div className="mt-4">
        <LessonNav courseId={id} prev={prevLesson} next={nextLesson} />
      </div>
    </div>
  );
}
