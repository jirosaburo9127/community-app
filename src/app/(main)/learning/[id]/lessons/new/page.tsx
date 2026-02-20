import { LessonForm } from "@/components/learning/lesson-form";
import { getCourse } from "@/lib/queries/learning";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function NewLessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const course = await getCourse(id);
  if (!course) notFound();

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-5 flex items-center gap-2">
        <Link
          href={`/learning/${id}`}
          className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-white"
        >
          <ArrowLeft size={18} className="text-muted" />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">レッスンを追加</h1>
      </div>
      <div className="rounded-xl border border-border bg-white p-5">
        <LessonForm courseId={id} lessonCount={course.lesson_count} />
      </div>
    </div>
  );
}
