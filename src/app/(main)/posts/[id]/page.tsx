import { CommentForm } from "@/components/comments/comment-form";
import { CommentList } from "@/components/comments/comment-list";
import { PollDisplay } from "@/components/polls/poll-display";
import { BookmarkButton } from "@/components/reactions/bookmark-button";
import { ReactionBar } from "@/components/reactions/reaction-bar";
import { isBookmarked } from "@/lib/queries/bookmarks";
import { getComments } from "@/lib/queries/comments";
import { getPollByPostId, getUserVote } from "@/lib/queries/polls";
import { getPost } from "@/lib/queries/posts";
import { getReactionsForPost } from "@/lib/queries/reactions";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeft, MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let post;
  try {
    post = await getPost(id);
  } catch {
    notFound();
  }

  const [reactions, comments, bookmarked, poll] = await Promise.all([
    getReactionsForPost(id),
    getComments(id),
    isBookmarked(id),
    getPollByPostId(id),
  ]);

  const userVote = poll ? await getUserVote(poll.id) : null;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const timeAgo = formatDistanceToNow(new Date(post.created_at), {
    addSuffix: true,
    locale: ja,
  });

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4">
        <Link
          href="/home"
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-white hover:text-gray-900"
        >
          <ArrowLeft size={16} /> 戻る
        </Link>
      </div>

      <article className="overflow-hidden rounded-xl border border-border bg-white">
        {post.image_urls?.[0] && (
          <div className="relative aspect-video w-full overflow-hidden">
            <Image
              src={post.image_urls[0]}
              alt={post.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 672px"
            />
          </div>
        )}

        <div className="p-6">
          {post.categories && (
            <span className="mb-3 inline-flex items-center gap-1 rounded-md bg-primary/8 px-2.5 py-1 text-xs font-medium text-primary">
              {post.categories.icon_emoji} {post.categories.name}
            </span>
          )}

          <h1 className="mb-3 text-xl font-bold text-gray-900">{post.title}</h1>

          <div className="mb-5 flex items-center gap-2.5 text-sm text-muted">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-xs font-bold text-white">
              {post.profiles?.display_name?.charAt(0) ?? "?"}
            </div>
            <span className="font-medium text-gray-700">{post.profiles?.display_name}</span>
            <span className="text-gray-400">{timeAgo}</span>
          </div>

          <div className="mb-6 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
            {post.body}
          </div>

          {poll && (
            <PollDisplay
              poll={poll}
              votedOptionId={userVote?.poll_option_id ?? null}
            />
          )}

          <div className="flex items-center justify-between border-t border-border pt-4 mt-4">
            <ReactionBar postId={post.id} reactions={reactions} />
            <BookmarkButton postId={post.id} bookmarked={bookmarked} />
          </div>
        </div>
      </article>

      <section className="mt-4 rounded-xl border border-border bg-white p-4 sm:p-6">
        <h2 className="mb-4 flex items-center gap-1.5 text-base font-bold text-gray-900">
          <MessageCircle size={18} className="text-primary" />
          コメント ({comments.length})
        </h2>
        <CommentList comments={comments} currentUserId={user?.id} />
        <div className="mt-4 border-t border-border pt-4">
          <CommentForm postId={post.id} />
        </div>
      </section>
    </div>
  );
}
