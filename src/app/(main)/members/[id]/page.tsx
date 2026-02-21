import { getMember } from "@/lib/queries/members";
import { getUserBadges } from "@/lib/queries/badges";
import { ActivityTimeline } from "@/components/profile/activity-timeline";
import { BadgeList } from "@/components/badges/badge-list";
import { DmButton } from "@/components/messages/dm-button";
import { createClient } from "@/lib/supabase/server";
import type { Post } from "@/lib/types";
import { ArrowLeft, Building2, ExternalLink, Github, Linkedin, Twitter } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

const roleLabels: Record<string, string> = {
  student: "学生",
  entrepreneur: "起業家",
  mentor: "メンター",
  investor: "投資家",
};

const roleColors: Record<string, string> = {
  student: "bg-emerald-100 text-emerald-700",
  entrepreneur: "bg-amber-100 text-amber-700",
  mentor: "bg-teal-100 text-teal-700",
  investor: "bg-orange-100 text-orange-700",
};

export default async function MemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const member = await getMember(id);
  if (!member) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const badges = await getUserBadges(member.id);

  const { data: posts } = await supabase
    .from("posts")
    .select("id, title, created_at, categories(*)")
    .eq("author_id", member.id)
    .order("created_at", { ascending: false })
    .limit(10);

  const socialLinks = [
    { url: member.twitter_url, icon: Twitter, label: "Twitter" },
    { url: member.linkedin_url, icon: Linkedin, label: "LinkedIn" },
    { url: member.github_url, icon: Github, label: "GitHub" },
  ].filter((l) => l.url);

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-5 flex items-center gap-2">
        <Link
          href="/members"
          className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-white"
        >
          <ArrowLeft size={18} className="text-muted" />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">メンバー詳細</h1>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-white">
        <div className="h-20 bg-gradient-to-r from-primary to-accent" />
        <div className="px-6 pb-6">
          <div className="flex flex-col items-center -mt-10">
            {member.avatar_url ? (
              <Image
                src={member.avatar_url}
                alt={member.display_name}
                width={80}
                height={80}
                className="h-20 w-20 rounded-full border-4 border-white object-cover shadow-md"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-primary to-accent text-2xl font-bold text-white shadow-md">
                {member.display_name.charAt(0)}
              </div>
            )}
            <h2 className="mt-3 text-lg font-bold text-gray-900">
              {member.display_name}
            </h2>
            <span
              className={`mt-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${roleColors[member.role] ?? "bg-gray-100 text-gray-600"}`}
            >
              {roleLabels[member.role] ?? member.role}
            </span>

            {member.company && (
              <div className="mt-2 flex items-center gap-1 text-sm text-muted">
                <Building2 size={14} />
                {member.company}
              </div>
            )}

            {member.bio && (
              <p className="mt-3 text-center text-sm text-gray-600">
                {member.bio}
              </p>
            )}
          </div>

          {/* Skills */}
          {member.skills.length > 0 && (
            <div className="mt-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">
                スキル
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {member.skills.map((skill: string) => (
                  <span
                    key={skill}
                    className="rounded-md bg-primary/8 px-2 py-1 text-xs font-medium text-primary"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Badges */}
          <BadgeList badges={badges} />

          {/* Social links */}
          {socialLinks.length > 0 && (
            <div className="mt-4 flex gap-2">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:bg-gray-50 hover:text-gray-700"
                >
                  <link.icon size={16} />
                </a>
              ))}
            </div>
          )}

          {/* DM Button */}
          {user && (
            <div className="mt-4">
              <DmButton currentUserId={user.id} targetUserId={member.id} />
            </div>
          )}
        </div>
      </div>

      {/* Recent posts */}
      {posts && posts.length > 0 && (
        <div className="mt-5">
          <h3 className="mb-3 text-sm font-semibold text-gray-900">
            最近の投稿
          </h3>
          <div className="space-y-2">
            {posts.map((post: any) => (
              <Link
                key={post.id}
                href={`/posts/${post.id}`}
                className="block rounded-lg border border-border bg-white p-3 transition-colors hover:bg-gray-50"
              >
                <p className="text-sm font-medium text-gray-900 line-clamp-1">
                  {post.title}
                </p>
                <p className="mt-0.5 text-xs text-muted">
                  {post.categories?.icon_emoji} {post.categories?.name}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Activity timeline */}
      <div className="mt-5">
        <ActivityTimeline userId={member.id} />
      </div>
    </div>
  );
}
