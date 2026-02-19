"use client";

import { createClient } from "@/lib/supabase/client";
import type { Post } from "@/lib/types";
import { Search, Trash2, Pin, PinOff } from "lucide-react";
import { useEffect, useState } from "react";

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const [{ data: postsData }, { data: cats }] = await Promise.all([
      supabase
        .from("posts")
        .select("*, profiles(display_name), categories(name)")
        .order("created_at", { ascending: false }),
      supabase.from("categories").select("id, name").order("sort_order"),
    ]);
    setPosts(postsData ?? []);
    setCategories(cats ?? []);
    setLoading(false);
  }

  async function deletePost(postId: string) {
    if (!confirm("この投稿を削除しますか？")) return;
    const { error } = await supabase.from("posts").delete().eq("id", postId);
    if (!error) {
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    }
  }

  async function togglePin(postId: string, currentValue: boolean) {
    const { error } = await supabase
      .from("posts")
      .update({ is_pinned: !currentValue })
      .eq("id", postId);
    if (!error) {
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, is_pinned: !currentValue } : p))
      );
    }
  }

  const filtered = posts.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchCategory = !categoryFilter || p.category_id === Number(categoryFilter);
    return matchSearch && matchCategory;
  });

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-5">投稿管理</h2>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="タイトルで検索..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary"
        >
          <option value="">全カテゴリ</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-gray-50 text-left">
              <th className="px-4 py-3 font-medium text-gray-600">タイトル</th>
              <th className="px-4 py-3 font-medium text-gray-600">著者</th>
              <th className="px-4 py-3 font-medium text-gray-600">カテゴリ</th>
              <th className="px-4 py-3 font-medium text-gray-600 text-center">コメント</th>
              <th className="px-4 py-3 font-medium text-gray-600 text-center">いいね</th>
              <th className="px-4 py-3 font-medium text-gray-600">日付</th>
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
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted">
                  投稿が見つかりません
                </td>
              </tr>
            ) : (
              filtered.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {post.is_pinned && (
                        <Pin size={14} className="shrink-0 text-primary" />
                      )}
                      <span className="font-medium text-gray-900 truncate max-w-[200px]">
                        {post.title}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {(post.profiles as any)?.display_name ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {(post.categories as any)?.name ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600">{post.comment_count}</td>
                  <td className="px-4 py-3 text-center text-gray-600">{post.like_count}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(post.created_at).toLocaleDateString("ja-JP")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => togglePin(post.id, post.is_pinned)}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-primary transition-colors"
                        title={post.is_pinned ? "ピン解除" : "ピン留め"}
                      >
                        {post.is_pinned ? <PinOff size={16} /> : <Pin size={16} />}
                      </button>
                      <button
                        onClick={() => deletePost(post.id)}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                        title="削除"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
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
