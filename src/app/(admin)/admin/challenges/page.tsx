"use client";

import { createClient } from "@/lib/supabase/client";
import type { Challenge } from "@/lib/types";
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

type ChallengeRow = Challenge & {
  profiles?: { display_name: string };
};

export default function AdminChallengesPage() {
  const [challenges, setChallenges] = useState<ChallengeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchChallenges();
  }, []);

  async function fetchChallenges() {
    setLoading(true);
    const { data } = await supabase
      .from("challenges")
      .select("*, profiles(display_name)")
      .order("created_at", { ascending: false });
    setChallenges(data ?? []);
    setLoading(false);
  }

  async function toggleStatus(id: string, currentStatus: string) {
    const newStatus = currentStatus === "open" ? "closed" : "open";
    const { error } = await supabase
      .from("challenges")
      .update({ status: newStatus })
      .eq("id", id);
    if (!error) {
      setChallenges((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, status: newStatus as Challenge["status"] } : c
        )
      );
    }
  }

  async function deleteChallenge(id: string) {
    if (!confirm("このチャレンジを削除しますか？")) return;
    const { error } = await supabase.from("challenges").delete().eq("id", id);
    if (!error) {
      setChallenges((prev) => prev.filter((c) => c.id !== id));
    }
  }

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-5">チャレンジ管理</h2>

      <div className="overflow-x-auto rounded-xl border border-border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-gray-50 text-left">
              <th className="px-4 py-3 font-medium text-gray-600">タイトル</th>
              <th className="px-4 py-3 font-medium text-gray-600">作成者</th>
              <th className="px-4 py-3 font-medium text-gray-600">難易度</th>
              <th className="px-4 py-3 font-medium text-gray-600">ステータス</th>
              <th className="px-4 py-3 font-medium text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted">
                  読み込み中...
                </td>
              </tr>
            ) : challenges.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted">
                  チャレンジがありません
                </td>
              </tr>
            ) : (
              challenges.map((ch) => (
                <tr key={ch.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900 truncate max-w-[200px]">
                    {ch.title}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {ch.profiles?.display_name ?? "-"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${difficultyColors[ch.difficulty] ?? ""}`}
                    >
                      {difficultyLabels[ch.difficulty] ?? ch.difficulty}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleStatus(ch.id, ch.status)}
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                        ch.status === "open"
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {ch.status === "open" ? "Open" : "Closed"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => deleteChallenge(ch.id)}
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
