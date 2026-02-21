import type { UserBadge } from "@/lib/types";

export function BadgeList({ badges }: { badges: UserBadge[] }) {
  if (badges.length === 0) return null;

  return (
    <div className="mt-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">
        バッジ
      </h3>
      <div className="flex flex-wrap gap-1.5">
        {badges.map((ub) => (
          <span
            key={ub.badge_id}
            title={ub.badge_definitions?.description}
            className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 border border-amber-200"
          >
            <span>{ub.badge_definitions?.icon_emoji}</span>
            {ub.badge_definitions?.name}
          </span>
        ))}
      </div>
    </div>
  );
}
