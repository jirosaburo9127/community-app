import { CourseForm } from "@/components/learning/course-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewCoursePage() {
  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-5 flex items-center gap-2">
        <Link
          href="/learning"
          className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-white"
        >
          <ArrowLeft size={18} className="text-muted" />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">コースを作成</h1>
      </div>
      <div className="rounded-xl border border-border bg-white p-5">
        <CourseForm />
      </div>
    </div>
  );
}
