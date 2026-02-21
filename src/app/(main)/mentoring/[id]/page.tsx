import { getMentor } from "@/lib/queries/mentoring";
import { MENTORING_EXPERTISE_AREAS } from "@/lib/constants";
import { MentoringRequestForm } from "@/components/mentoring/mentoring-request-form";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeft, Building2, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function MentorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const mentor = await getMentor(id);
  if (!mentor) notFound();

  const profile = mentor.profiles;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 自分が既に申請済みか確認
  let alreadyRequested = false;
  if (user) {
    const { data } = await supabase
      .from("mentoring_requests")
      .select("id")
      .eq("mentor_id", mentor.id)
      .eq("mentee_id", user.id)
      .maybeSingle();
    alreadyRequested = !!data;
  }

  const isOwnProfile = user?.id === mentor.user_id;
  const isFull = (mentor.accepted_count ?? 0) >= mentor.max_mentees;

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-5 flex items-center gap-2">
        <Link
          href="/mentoring"
          className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-white"
        >
          <ArrowLeft size={18} className="text-muted" />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">メンター詳細</h1>
      </div>

      <div className="rounded-xl border border-border bg-white p-5">
        <div className="flex items-center gap-3">
          {profile?.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt={profile.display_name}
              width={56}
              height={56}
              className="h-14 w-14 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-lg font-bold text-white">
              {profile?.display_name.charAt(0)}
            </div>
          )}
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {profile?.display_name}
            </h2>
            {profile?.company && (
              <p className="flex items-center gap-1 text-sm text-muted">
                <Building2 size={14} />
                {profile.company}
              </p>
            )}
          </div>
        </div>

        {mentor.bio && (
          <p className="mt-4 text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
            {mentor.bio}
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-1.5">
          {mentor.expertise_areas.map((area: string) => {
            const cat = MENTORING_EXPERTISE_AREAS.find((a) => a.value === area);
            return (
              <span
                key={area}
                className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700"
              >
                {cat?.emoji} {cat?.label ?? area}
              </span>
            );
          })}
        </div>

        <div className="mt-4 flex items-center gap-1 text-sm text-muted">
          <Users size={14} />
          受入状況: {mentor.accepted_count ?? 0}/{mentor.max_mentees}名
        </div>
      </div>

      {/* 申請フォーム */}
      {user && !isOwnProfile && !alreadyRequested && !isFull && (
        <div className="mt-5 rounded-xl border border-border bg-white p-5">
          <h3 className="mb-3 text-sm font-semibold text-gray-900">
            メンタリングを申請
          </h3>
          <MentoringRequestForm mentorId={mentor.id} />
        </div>
      )}

      {alreadyRequested && (
        <div className="mt-5 rounded-xl border border-border bg-blue-50 p-4 text-center text-sm text-blue-700">
          申請済みです。メンターからの返答をお待ちください。
        </div>
      )}

      {isFull && !alreadyRequested && !isOwnProfile && (
        <div className="mt-5 rounded-xl border border-border bg-gray-50 p-4 text-center text-sm text-muted">
          現在メンティーの受入枠がいっぱいです。
        </div>
      )}
    </div>
  );
}
