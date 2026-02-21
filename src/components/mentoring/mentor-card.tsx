import type { MentorProfile } from "@/lib/types";
import { MENTORING_EXPERTISE_AREAS } from "@/lib/constants";
import { User, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function MentorCard({ mentor }: { mentor: MentorProfile }) {
  const profile = mentor.profiles;

  return (
    <Link
      href={`/mentoring/${mentor.id}`}
      className="flex flex-col gap-3 rounded-xl border border-border bg-white p-4 transition-all hover:shadow-md hover:-translate-y-0.5"
    >
      <div className="flex items-center gap-3">
        {profile?.avatar_url ? (
          <Image
            src={profile.avatar_url}
            alt={profile.display_name}
            width={44}
            height={44}
            className="h-11 w-11 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-sm font-bold text-white">
            {profile?.display_name.charAt(0)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-gray-900 truncate">
            {profile?.display_name}
          </h3>
          {profile?.company && (
            <p className="text-xs text-muted truncate">{profile.company}</p>
          )}
        </div>
      </div>

      {mentor.bio && (
        <p className="text-xs text-gray-600 line-clamp-2">{mentor.bio}</p>
      )}

      <div className="flex flex-wrap gap-1.5">
        {mentor.expertise_areas.map((area) => {
          const cat = MENTORING_EXPERTISE_AREAS.find((a) => a.value === area);
          return (
            <span
              key={area}
              className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700"
            >
              {cat?.emoji} {cat?.label ?? area}
            </span>
          );
        })}
      </div>

      <div className="flex items-center gap-3 text-xs text-muted">
        <span className="flex items-center gap-1">
          <Users size={12} />
          {mentor.accepted_count ?? 0}/{mentor.max_mentees}名
        </span>
      </div>
    </Link>
  );
}
