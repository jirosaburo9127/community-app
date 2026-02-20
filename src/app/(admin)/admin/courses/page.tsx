"use client";

import { createClient } from "@/lib/supabase/client";
import type { Course } from "@/lib/types";
import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

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

type CourseRow = Course & {
  profiles?: { display_name: string };
};

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  async function fetchCourses() {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("courses")
      .select("*, profiles(display_name)")
      .order("created_at", { ascending: false });
    setCourses(data ?? []);
    setLoading(false);
  }

  async function togglePublished(id: string, current: boolean) {
    const supabase = createClient();
    const { error } = await supabase
      .from("courses")
      .update({ is_published: !current })
      .eq("id", id);
    if (!error) {
      setCourses((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, is_published: !current } : c
        )
      );
    }
  }

  async function deleteCourse(id: string) {
    if (!confirm("このコースを削除しますか？")) return;
    const supabase = createClient();
    const { error } = await supabase.from("courses").delete().eq("id", id);
    if (!error) {
      setCourses((prev) => prev.filter((c) => c.id !== id));
    }
  }

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-5">コース管理</h2>

      <div className="overflow-x-auto rounded-xl border border-border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-gray-50 text-left">
              <th className="px-4 py-3 font-medium text-gray-600">タイトル</th>
              <th className="px-4 py-3 font-medium text-gray-600">講師</th>
              <th className="px-4 py-3 font-medium text-gray-600">難易度</th>
              <th className="px-4 py-3 font-medium text-gray-600">レッスン</th>
              <th className="px-4 py-3 font-medium text-gray-600">受講者</th>
              <th className="px-4 py-3 font-medium text-gray-600">公開</th>
              <th className="px-4 py-3 font-medium text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted">
                  読み込み中...
                </td>
              </tr>
            ) : courses.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted">
                  コースがありません
                </td>
              </tr>
            ) : (
              courses.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900 truncate max-w-[200px]">
                    {c.title}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {c.profiles?.display_name ?? "-"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${difficultyColors[c.difficulty] ?? ""}`}
                    >
                      {difficultyLabels[c.difficulty] ?? c.difficulty}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{c.lesson_count}</td>
                  <td className="px-4 py-3 text-gray-600">{c.enrollment_count}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => togglePublished(c.id, c.is_published)}
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                        c.is_published
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {c.is_published ? "公開中" : "非公開"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => deleteCourse(c.id)}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                      title="削除"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
