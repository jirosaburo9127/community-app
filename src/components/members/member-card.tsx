import type { Profile } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";

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

export function MemberCard({ member }: { member: Profile }) {
  return (
    <Link
      href={`/members/${member.id}`}
      className="flex items-start gap-3.5 rounded-xl border border-border bg-white p-4 transition-all hover:shadow-md hover:-translate-y-0.5"
    >
      {member.avatar_url ? (
        <Image
          src={member.avatar_url}
          alt={member.display_name}
          width={48}
          height={48}
          className="h-12 w-12 shrink-0 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-lg font-bold text-white">
          {member.display_name.charAt(0)}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-sm font-semibold text-gray-900">
            {member.display_name}
          </h3>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${roleColors[member.role] ?? "bg-gray-100 text-gray-600"}`}
          >
            {roleLabels[member.role] ?? member.role}
          </span>
        </div>

        {member.company && (
          <p className="mt-0.5 truncate text-xs text-muted">{member.company}</p>
        )}

        {member.skills.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {member.skills.slice(0, 3).map((skill) => (
              <span
                key={skill}
                className="rounded-md bg-surface px-1.5 py-0.5 text-[10px] text-muted"
              >
                {skill}
              </span>
            ))}
            {member.skills.length > 3 && (
              <span className="text-[10px] text-muted">
                +{member.skills.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
