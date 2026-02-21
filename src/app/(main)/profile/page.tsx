import { getMyProfile } from "@/lib/queries/profile";
import { getUserBadges } from "@/lib/queries/badges";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/actions/auth";
import { ActivityTimeline } from "@/components/profile/activity-timeline";
import { BadgeList } from "@/components/badges/badge-list";
import {
  Award,
  Building2,
  Edit,
  ExternalLink,
  FileText,
  Github,
  Linkedin,
  LogOut,
  MessageCircle,
  Settings,
  Twitter,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";

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

export default async function ProfilePage() {
  const profile = await getMyProfile();
  if (!profile) redirect("/login");

  const supabase = await createClient();

  const badges = await getUserBadges(profile.id);

  const [
    { count: postCount },
    { count: commentCount },
    { data: upcomingEvents },
  ] = await Promise.all([
    supabase
      .from("posts")
      .select("*", { count: "exact", head: true })
      .eq("author_id", profile.id),
    supabase
      .from("comments")
      .select("*", { count: "exact", head: true })
      .eq("author_id", profile.id),
    supabase
      .from("event_registrations")
      .select("event_id, events(id, title, event_date, location)")
      .eq("user_id", profile.id)
      .eq("status", "registered")
      .gte("events.event_date", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const memberSince = formatDistanceToNow(new Date(profile.created_at), {
    addSuffix: true,
    locale: ja,
  });

  const socialLinks = [
    { url: profile.twitter_url, icon: Twitter, label: "Twitter" },
    { url: profile.linkedin_url, icon: Linkedin, label: "LinkedIn" },
    { url: profile.github_url, icon: Github, label: "GitHub" },
  ].filter((l) => l.url);

  return (
    <div className="mx-auto max-w-lg space-y-5">
      {/* Profile header with gradient */}
      <div className="overflow-hidden rounded-xl border border-border bg-white">
        <div className="h-24 bg-gradient-to-r from-primary to-accent" />
        <div className="px-6 pb-6">
          <div className="flex flex-col items-center -mt-12">
            {profile.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={profile.display_name}
                width={88}
                height={88}
                className="h-22 w-22 rounded-full border-4 border-white object-cover shadow-md"
              />
            ) : (
              <div className="flex h-22 w-22 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-primary to-accent text-2xl font-bold text-white shadow-md">
                {profile.display_name.charAt(0)}
              </div>
            )}
            <h1 className="mt-3 text-xl font-bold text-gray-900">
              {profile.display_name}
            </h1>
            <span
              className={`mt-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${roleColors[profile.role] ?? "bg-gray-100 text-gray-600"}`}
            >
              {roleLabels[profile.role] ?? profile.role}
            </span>
            {profile.company && (
              <div className="mt-2 flex items-center gap-1 text-sm text-muted">
                <Building2 size={14} />
                {profile.company}
              </div>
            )}
            {profile.bio && (
              <p className="mt-2 text-center text-sm text-gray-600 max-w-xs">
                {profile.bio}
              </p>
            )}
            <p className="mt-1.5 text-xs text-muted">{memberSince}に登録</p>

            {/* Social links */}
            {socialLinks.length > 0 && (
              <div className="mt-3 flex gap-2">
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
          </div>

          {/* Skills */}
          {profile.skills.length > 0 && (
            <div className="mt-4">
              <div className="flex flex-wrap justify-center gap-1.5">
                {profile.skills.map((skill) => (
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

          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center rounded-xl bg-surface p-3">
              <FileText size={18} className="text-primary" />
              <span className="mt-1 text-lg font-bold text-gray-900">{postCount ?? 0}</span>
              <span className="text-xs text-muted">投稿</span>
            </div>
            <div className="flex flex-col items-center rounded-xl bg-surface p-3">
              <MessageCircle size={18} className="text-accent" />
              <span className="mt-1 text-lg font-bold text-gray-900">{commentCount ?? 0}</span>
              <span className="text-xs text-muted">コメント</span>
            </div>
            <div className="flex flex-col items-center rounded-xl bg-surface p-3">
              <Award size={18} className="text-yellow-500" />
              <span className="mt-1 text-lg font-bold text-gray-900">{profile.total_points}</span>
              <span className="text-xs text-muted">ポイント</span>
            </div>
          </div>

          <div className="mt-6 space-y-2.5">
            {profile.is_admin && (
              <Link
                href="/admin"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90"
              >
                <Settings size={16} />
                管理画面へ
              </Link>
            )}
            <Link
              href="/profile/edit"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-primary px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-white"
            >
              <Edit size={16} />
              プロフィールを編集
            </Link>
            <form action={signOut}>
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-gray-50 hover:text-gray-700"
              >
                <LogOut size={16} />
                ログアウト
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Upcoming events */}
      {upcomingEvents && upcomingEvents.length > 0 && (
        <div className="rounded-xl border border-border bg-white">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-sm font-semibold text-gray-900">参加予定イベント</h3>
          </div>
          <div className="divide-y divide-border">
            {upcomingEvents.map((reg: any) => {
              const ev = reg.events;
              if (!ev) return null;
              return (
                <Link
                  key={ev.id}
                  href={`/events/${ev.id}`}
                  className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-gray-50"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {ev.title}
                    </p>
                    <p className="text-xs text-muted">
                      {new Date(ev.event_date).toLocaleDateString("ja-JP")}
                      {ev.location && ` / ${ev.location}`}
                    </p>
                  </div>
                  <ExternalLink size={14} className="text-muted" />
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Activity timeline */}
      <ActivityTimeline userId={profile.id} />
    </div>
  );
}
