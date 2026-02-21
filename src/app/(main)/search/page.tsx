import { SearchForm } from "@/components/search/search-form";
import { searchPosts, searchMembers } from "@/lib/queries/search";
import { PostCard } from "@/components/posts/post-card";
import { Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

const roleLabels: Record<string, string> = {
  student: "学生",
  entrepreneur: "起業家",
  mentor: "メンター",
  investor: "投資家",
};

const roleColors: Record<string, string> = {
  student: "bg-blue-100 text-blue-700",
  entrepreneur: "bg-purple-100 text-purple-700",
  mentor: "bg-green-100 text-green-700",
  investor: "bg-amber-100 text-amber-700",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  let posts: any[] = [];
  let members: any[] = [];

  if (q) {
    [posts, members] = await Promise.all([
      searchPosts(q),
      searchMembers(q),
    ]);
  }

  const totalResults = posts.length + members.length;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="mb-4 text-xl font-bold text-gray-900">検索</h1>
        <Suspense fallback={null}>
          <SearchForm />
        </Suspense>
      </div>

      {q ? (
        <>
          <p className="mb-4 text-sm text-muted">
            「{q}」の検索結果: {totalResults}件
          </p>

          {/* Members */}
          {members.length > 0 && (
            <div className="mb-6">
              <h2 className="mb-3 text-sm font-semibold text-gray-900">
                メンバー ({members.length})
              </h2>
              <div className="space-y-2">
                {members.map((member) => (
                  <Link
                    key={member.id}
                    href={`/members/${member.id}`}
                    className="flex items-center gap-3 rounded-xl border border-border bg-white p-3 transition-all hover:shadow-md"
                  >
                    {member.avatar_url ? (
                      <Image
                        src={member.avatar_url}
                        alt={member.display_name}
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-sm font-bold text-white">
                        {member.display_name.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900 truncate">
                          {member.display_name}
                        </span>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${roleColors[member.role] ?? "bg-gray-100 text-gray-600"}`}
                        >
                          {roleLabels[member.role] ?? member.role}
                        </span>
                      </div>
                      {member.company && (
                        <p className="text-xs text-muted truncate">{member.company}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Posts */}
          {posts.length > 0 && (
            <div className="mb-6">
              <h2 className="mb-3 text-sm font-semibold text-gray-900">
                投稿 ({posts.length})
              </h2>
              <div className="columns-1 sm:columns-2 gap-4">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </div>
          )}

          {totalResults === 0 && (
            <div className="flex flex-col items-center py-12 text-center">
              <Search size={48} className="mb-3 text-gray-300" />
              <p className="text-sm text-muted">
                「{q}」に一致する結果が見つかりませんでした
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center py-12 text-center">
          <Search size={48} className="mb-3 text-gray-300" />
          <p className="text-sm text-muted">
            キーワードを入力して検索してください
          </p>
        </div>
      )}
    </div>
  );
}
