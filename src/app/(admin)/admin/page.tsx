import { createClient } from "@/lib/supabase/server";
import { Users, FileText, MessageCircle, Calendar, Trophy, UserPlus, PenLine, BarChart3, Mail } from "lucide-react";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [
    { count: totalUsers },
    { count: newUsersThisMonth },
    { count: totalPosts },
    { count: postsThisMonth },
    { count: totalComments },
    { count: totalEvents },
    { count: totalRegistrations },
    { count: totalChallenges },
    { count: unusedInvitations },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", startOfMonth),
    supabase.from("posts").select("*", { count: "exact", head: true }),
    supabase.from("posts").select("*", { count: "exact", head: true }).gte("created_at", startOfMonth),
    supabase.from("comments").select("*", { count: "exact", head: true }),
    supabase.from("events").select("*", { count: "exact", head: true }),
    supabase.from("event_registrations").select("*", { count: "exact", head: true }),
    supabase.from("challenges").select("*", { count: "exact", head: true }),
    supabase.from("invitations").select("*", { count: "exact", head: true }).is("used_by", null),
  ]);

  const stats = [
    { label: "総ユーザー数", value: totalUsers ?? 0, icon: Users, color: "text-blue-600 bg-blue-50" },
    { label: "今月の新規ユーザー", value: newUsersThisMonth ?? 0, icon: UserPlus, color: "text-green-600 bg-green-50" },
    { label: "総投稿数", value: totalPosts ?? 0, icon: FileText, color: "text-purple-600 bg-purple-50" },
    { label: "今月の投稿数", value: postsThisMonth ?? 0, icon: PenLine, color: "text-indigo-600 bg-indigo-50" },
    { label: "総コメント数", value: totalComments ?? 0, icon: MessageCircle, color: "text-orange-600 bg-orange-50" },
    { label: "総イベント数", value: totalEvents ?? 0, icon: Calendar, color: "text-teal-600 bg-teal-50" },
    { label: "イベント参加登録数", value: totalRegistrations ?? 0, icon: BarChart3, color: "text-pink-600 bg-pink-50" },
    { label: "総チャレンジ数", value: totalChallenges ?? 0, icon: Trophy, color: "text-amber-600 bg-amber-50" },
    { label: "未使用招待コード", value: unusedInvitations ?? 0, icon: Mail, color: "text-cyan-600 bg-cyan-50" },
  ];

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-5">ダッシュボード</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-border bg-white p-5"
          >
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.color}`}>
                <stat.icon size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-muted">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
