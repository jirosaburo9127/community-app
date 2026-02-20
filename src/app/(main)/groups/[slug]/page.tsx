import { GroupMemberList } from "@/components/groups/group-member-list";
import { PostGrid } from "@/components/posts/post-grid";
import { getGroup, getGroupMembers, getGroupPosts } from "@/lib/queries/groups";
import { getReactionsForPosts } from "@/lib/queries/reactions";
import { createClient } from "@/lib/supabase/server";
import { getRooms } from "@/lib/queries/rooms";
import { ArrowLeft, Hash, PenSquare, UsersRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function GroupDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const group = await getGroup(slug);
  if (!group) notFound();

  const [members, posts, rooms] = await Promise.all([
    getGroupMembers(group.id),
    getGroupPosts(group.id),
    getRooms(group.id),
  ]);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isMember = members.some((m) => m.user_id === user?.id);

  const postIds = posts.map((p) => p.id);
  const reactionsMap =
    postIds.length > 0 ? await getReactionsForPosts(postIds) : new Map();

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-5 flex items-center gap-2">
        <Link
          href="/groups"
          className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-white"
        >
          <ArrowLeft size={18} className="text-muted" />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">グループ詳細</h1>
      </div>

      {/* Group info */}
      <div className="overflow-hidden rounded-xl border border-border bg-white">
        <div className="h-16 bg-gradient-to-r from-primary to-accent" />
        <div className="px-6 pb-6">
          <div className="flex items-end gap-4 -mt-8">
            {group.avatar_url ? (
              <Image
                src={group.avatar_url}
                alt={group.name}
                width={64}
                height={64}
                className="h-16 w-16 rounded-xl border-4 border-white object-cover shadow-md"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-xl border-4 border-white bg-gradient-to-br from-primary to-accent text-xl font-bold text-white shadow-md">
                {group.name.charAt(0)}
              </div>
            )}
            <div className="mb-1">
              <h2 className="text-lg font-bold text-gray-900">{group.name}</h2>
              <div className="flex items-center gap-1 mt-0.5 text-xs text-muted">
                <UsersRound size={12} />
                <span>{members.length} メンバー</span>
              </div>
            </div>
          </div>

          {group.description && (
            <p className="mt-4 text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
              {group.description}
            </p>
          )}
        </div>
      </div>

      {/* Members */}
      <div className="mt-5">
        <GroupMemberList
          members={members}
          groupId={group.id}
          currentUserId={user?.id ?? null}
          creatorId={group.creator_id}
        />
      </div>

      {/* Chat Rooms */}
      {isMember && (
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">チャットルーム</h3>
            <Link
              href={`/groups/${slug}/rooms`}
              className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-primary/90"
            >
              <Hash size={12} />
              ルーム一覧
            </Link>
          </div>
          {rooms.length > 0 ? (
            <div className="space-y-2">
              {rooms.slice(0, 5).map((room) => (
                <Link
                  key={room.id}
                  href={`/groups/${slug}/rooms/${room.id}`}
                  className="flex items-center gap-3 rounded-xl border border-border bg-white px-4 py-3 transition-colors hover:border-primary/30 hover:bg-blue-50/30"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 text-primary">
                    <Hash size={14} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{room.name}</p>
                    {room.description && (
                      <p className="text-xs text-muted truncate">{room.description}</p>
                    )}
                  </div>
                </Link>
              ))}
              {rooms.length > 5 && (
                <Link
                  href={`/groups/${slug}/rooms`}
                  className="block text-center text-xs text-primary hover:underline py-2"
                >
                  他 {rooms.length - 5} ルームを見る
                </Link>
              )}
            </div>
          ) : (
            <p className="text-center text-sm text-muted py-4 rounded-xl border border-border bg-white">
              まだチャットルームがありません
            </p>
          )}
        </div>
      )}

      {/* Posts */}
      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">掲示板</h3>
          {isMember && (
            <Link
              href={`/groups/${slug}/posts/new`}
              className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-primary/90"
            >
              <PenSquare size={12} />
              投稿する
            </Link>
          )}
        </div>
        <PostGrid posts={posts} reactionsMap={reactionsMap} />
      </div>
    </div>
  );
}
