import { CourseCard } from "@/components/learning/course-card";
import { getCourses } from "@/lib/queries/learning";
import { BookOpen, Plus } from "lucide-react";
import Link from "next/link";

const difficultyTabs = [
  { value: "", label: "すべて" },
  { value: "beginner", label: "初級" },
  { value: "intermediate", label: "中級" },
  { value: "advanced", label: "上級" },
];

export default async function LearningPage({
  searchParams,
}: {
  searchParams: Promise<{ difficulty?: string }>;
}) {
  const { difficulty } = await searchParams;
  const courses = await getCourses(difficulty);

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen size={22} className="text-accent" />
          <h1 className="text-xl font-bold text-gray-900">学習コース</h1>
          <span className="ml-1 rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
            {courses.length}
          </span>
        </div>
        <Link
          href="/learning/new"
          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-accent px-4 py-2 text-sm font-medium text-white shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:-translate-y-0.5"
        >
          <Plus size={16} />
          コースを作成
        </Link>
      </div>

      {/* Difficulty filter */}
      <div className="mb-5 flex gap-1">
        {difficultyTabs.map((tab) => (
          <Link
            key={tab.value}
            href={tab.value ? `/learning?difficulty=${tab.value}` : "/learning"}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              (difficulty ?? "") === tab.value
                ? "bg-primary/10 text-primary"
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>

      {courses.length === 0 && (
        <div className="mt-8 text-center text-sm text-muted">
          まだコースがありません
        </div>
      )}
    </div>
  );
}
