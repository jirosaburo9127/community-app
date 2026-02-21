import type { Group } from "@/lib/types";
import { Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function GroupCard({ group }: { group: Group }) {
  return (
    <Link
      href={`/groups/${group.slug}`}
      className="flex gap-3.5 rounded-xl border border-border bg-white p-4 transition-all hover:shadow-md"
    >
      {group.avatar_url ? (
        <Image
          src={group.avatar_url}
          alt={group.name}
          width={48}
          height={48}
          className="h-12 w-12 shrink-0 rounded-lg object-cover"
        />
      ) : (
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary text-lg font-bold text-white">
          {group.name.charAt(0)}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-semibold text-gray-900">
          {group.name}
        </h3>

        {group.description && (
          <p className="mt-0.5 text-xs text-gray-600 line-clamp-2">
            {group.description}
          </p>
        )}

        <div className="mt-1.5 flex items-center gap-1 text-xs text-muted">
          <Users size={12} />
          <span>{group.member_count ?? 0} メンバー</span>
        </div>
      </div>
    </Link>
  );
}
