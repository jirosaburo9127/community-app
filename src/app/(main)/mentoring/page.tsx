import { MentorCard } from "@/components/mentoring/mentor-card";
import { getMentors, getMyMentorProfile } from "@/lib/queries/mentoring";
import { MENTORING_EXPERTISE_AREAS } from "@/lib/constants";
import { GraduationCap, Plus, Settings } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default async function MentoringPage({
  searchParams,
}: {
  searchParams: Promise<{ expertise?: string }>;
}) {
  const { expertise } = await searchParams;
  const [mentors, myProfile] = await Promise.all([
    getMentors(expertise),
    getMyMentorProfile(),
  ]);

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GraduationCap size={22} className="text-primary" />
          <h1 className="text-xl font-bold text-gray-900">メンタリング</h1>
        </div>
        <div className="flex items-center gap-2">
          {myProfile ? (
            <Link
              href="/mentoring/requests"
              className="inline-flex items-center gap-1.5 rounded-xl border border-primary px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-white"
            >
              <Settings size={16} />
              リクエスト管理
            </Link>
          ) : (
            <Link
              href="/mentoring/register"
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-accent px-4 py-2 text-sm font-medium text-white shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:-translate-y-0.5"
            >
              <Plus size={16} />
              メンターになる
            </Link>
          )}
        </div>
      </div>

      {/* Expertise filter */}
      <div className="mb-5 flex flex-wrap gap-2">
        <Link
          href="/mentoring"
          className={cn(
            "rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
            !expertise
              ? "bg-primary text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          )}
        >
          すべて
        </Link>
        {MENTORING_EXPERTISE_AREAS.map((area) => (
          <Link
            key={area.value}
            href={`/mentoring?expertise=${area.value}`}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
              expertise === area.value
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            {area.emoji} {area.label}
          </Link>
        ))}
      </div>

      {/* Mentor list */}
      <div className="grid gap-3 sm:grid-cols-2">
        {mentors.map((mentor) => (
          <MentorCard key={mentor.id} mentor={mentor} />
        ))}
      </div>

      {mentors.length === 0 && (
        <div className="mt-8 text-center text-sm text-muted">
          メンターがまだいません
        </div>
      )}
    </div>
  );
}
