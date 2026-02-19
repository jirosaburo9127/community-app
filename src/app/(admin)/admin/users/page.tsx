"use client";

import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";
import { Search, Shield, ShieldOff } from "lucide-react";
import { useEffect, useState } from "react";

const roleLabels: Record<string, string> = {
  student: "学生",
  entrepreneur: "起業家",
  mentor: "メンター",
  investor: "投資家",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    setUsers(data ?? []);
    setLoading(false);
  }

  async function toggleAdmin(userId: string, currentValue: boolean) {
    const supabase = createClient()
    const { error } = await supabase
      .from("profiles")
      .update({ is_admin: !currentValue })
      .eq("id", userId);
    if (!error) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_admin: !currentValue } : u))
      );
    }
  }

  async function changeRole(userId: string, newRole: string) {
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", userId);
    if (!error) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole as Profile["role"] } : u))
      );
    }
  }

  const filtered = users.filter(
    (u) =>
      u.display_name.toLowerCase().includes(search.toLowerCase()) ||
      u.company.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-5">ユーザー管理</h2>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="text"
          placeholder="名前・会社名で検索..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-border bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-gray-50 text-left">
              <th className="px-4 py-3 font-medium text-gray-600">名前</th>
              <th className="px-4 py-3 font-medium text-gray-600">ロール</th>
              <th className="px-4 py-3 font-medium text-gray-600">ポイント</th>
              <th className="px-4 py-3 font-medium text-gray-600">登録日</th>
              <th className="px-4 py-3 font-medium text-gray-600">Admin</th>
              <th className="px-4 py-3 font-medium text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted">
                  読み込み中...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted">
                  ユーザーが見つかりません
                </td>
              </tr>
            ) : (
              filtered.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900">{user.display_name}</p>
                      {user.company && (
                        <p className="text-xs text-muted">{user.company}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={user.role}
                      onChange={(e) => changeRole(user.id, e.target.value)}
                      className="rounded border border-border px-2 py-1 text-xs outline-none focus:border-primary"
                    >
                      {Object.entries(roleLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{user.total_points}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(user.created_at).toLocaleDateString("ja-JP")}
                  </td>
                  <td className="px-4 py-3">
                    {user.is_admin ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        <Shield size={12} />
                        Admin
                      </span>
                    ) : (
                      <span className="text-xs text-muted">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleAdmin(user.id, user.is_admin)}
                      className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                        user.is_admin
                          ? "text-red-600 hover:bg-red-50"
                          : "text-primary hover:bg-primary/5"
                      }`}
                    >
                      {user.is_admin ? (
                        <>
                          <ShieldOff size={14} />
                          Admin解除
                        </>
                      ) : (
                        <>
                          <Shield size={14} />
                          Admin付与
                        </>
                      )}
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
