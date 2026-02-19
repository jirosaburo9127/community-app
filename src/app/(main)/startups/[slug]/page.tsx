import { StartupBoardButton } from "./startup-board-button";
import { getStartup, getStartupMembers } from "@/lib/queries/startups";
import { getGroupByStartupId } from "@/lib/queries/groups";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeft, ExternalLink, Rocket } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

const stageLabels: Record<string, string> = {
  idea: "アイデア",
  mvp: "MVP",
  seed: "シード",
  series_a: "シリーズA",
};

const stageColors: Record<string, string> = {
  idea: "bg-gray-100 text-gray-600",
  mvp: "bg-blue-100 text-blue-700",
  seed: "bg-green-100 text-green-700",
  series_a: "bg-purple-100 text-purple-700",
};

export default async function StartupDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const startup = await getStartup(slug);
  if (!startup) notFound();

  const [members, existingGroup] = await Promise.all([
    getStartupMembers(startup.id),
    getGroupByStartupId(startup.id),
  ]);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isCreator = user?.id === startup.creator_id;

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-5 flex items-center gap-2">
        <Link
          href="/startups"
          className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-white"
        >
          <ArrowLeft size={18} className="text-muted" />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">スタートアップ詳細</h1>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-white">
        <div className="h-16 bg-gradient-to-r from-accent to-primary" />
        <div className="px-6 pb-6">
          <div className="flex items-end gap-4 -mt-8">
            {startup.logo_url ? (
              <Image
                src={startup.logo_url}
                alt={startup.name}
                width={64}
                height={64}
                className="h-16 w-16 rounded-xl border-4 border-white object-cover shadow-md"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-xl border-4 border-white bg-gradient-to-br from-primary to-accent text-xl font-bold text-white shadow-md">
                {startup.name.charAt(0)}
              </div>
            )}
            <div className="mb-1">
              <h2 className="text-lg font-bold text-gray-900">
                {startup.name}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${stageColors[startup.stage] ?? "bg-gray-100 text-gray-600"}`}
                >
                  {stageLabels[startup.stage] ?? startup.stage}
                </span>
                {startup.industry && (
                  <span className="text-xs text-muted">{startup.industry}</span>
                )}
              </div>
            </div>
          </div>

          {startup.description && (
            <p className="mt-4 text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
              {startup.description}
            </p>
          )}

          {startup.website_url && (
            <a
              href={startup.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              <ExternalLink size={14} />
              ウェブサイト
            </a>
          )}

          {/* Board link/create button */}
          <div className="mt-4">
            {existingGroup ? (
              <Link
                href={`/groups/${existingGroup.slug}`}
                className="inline-flex items-center gap-1.5 rounded-lg bg-accent/10 px-4 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent/20"
              >
                掲示板を見る
              </Link>
            ) : isCreator ? (
              <StartupBoardButton
                startupId={startup.id}
                startupName={startup.name}
                startupSlug={startup.slug}
                members={members}
              />
            ) : null}
          </div>
        </div>
      </div>

      {/* Team members */}
      {members.length > 0 && (
        <div className="mt-5">
          <h3 className="mb-3 text-sm font-semibold text-gray-900">
            チームメンバー
          </h3>
          <div className="space-y-2">
            {members.map((member: any) => (
              <Link
                key={member.id}
                href={`/members/${member.user_id}`}
                className="flex items-center gap-3 rounded-lg border border-border bg-white p-3 transition-colors hover:bg-gray-50"
              >
                {member.profiles?.avatar_url ? (
                  <Image
                    src={member.profiles.avatar_url}
                    alt={member.profiles.display_name}
                    width={36}
                    height={36}
                    className="h-9 w-9 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-sm font-bold text-white">
                    {member.profiles?.display_name?.charAt(0) ?? "?"}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {member.profiles?.display_name}
                  </p>
                  <p className="text-xs text-muted">{member.role}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
