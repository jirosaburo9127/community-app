import { getRanking } from "@/lib/queries/ranking";
import { Trophy } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const medalColors = [
  "text-yellow-500", // 1st - gold
  "text-gray-400",   // 2nd - silver
  "text-amber-600",  // 3rd - bronze
];

export default async function RankingPage() {
  const ranking = await getRanking();

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-5 flex items-center gap-2">
        <Trophy size={22} className="text-yellow-500" />
        <h1 className="text-xl font-bold text-gray-900">ポイントランキング</h1>
      </div>

      <div className="rounded-xl border border-border bg-white">
        {ranking.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted">
            まだランキングデータがありません
          </div>
        ) : (
          <div className="divide-y divide-border">
            {ranking.map((member, index) => {
              const rank = index + 1;
              const isTopThree = rank <= 3;

              return (
                <Link
                  key={member.id}
                  href={`/members/${member.id}`}
                  className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-gray-50"
                >
                  {/* Rank */}
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center">
                    {isTopThree ? (
                      <Trophy
                        size={20}
                        className={medalColors[index]}
                        fill="currentColor"
                      />
                    ) : (
                      <span className="text-sm font-bold text-muted">
                        {rank}
                      </span>
                    )}
                  </div>

                  {/* Avatar */}
                  {member.avatar_url ? (
                    <Image
                      src={member.avatar_url}
                      alt={member.display_name}
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-sm font-bold text-white">
                      {member.display_name.charAt(0)}
                    </div>
                  )}

                  {/* Name */}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {member.display_name}
                    </p>
                  </div>

                  {/* Points */}
                  <div className="shrink-0 text-right">
                    <span className={`text-sm font-bold ${isTopThree ? "text-primary" : "text-gray-700"}`}>
                      {member.total_points}
                    </span>
                    <span className="ml-0.5 text-xs text-muted">pt</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
