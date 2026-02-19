import type { Startup } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";

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

export function StartupCard({ startup }: { startup: Startup }) {
  return (
    <Link
      href={`/startups/${startup.slug}`}
      className="flex gap-3.5 rounded-xl border border-border bg-white p-4 transition-all hover:shadow-md hover:-translate-y-0.5"
    >
      {startup.logo_url ? (
        <Image
          src={startup.logo_url}
          alt={startup.name}
          width={48}
          height={48}
          className="h-12 w-12 shrink-0 rounded-lg object-cover"
        />
      ) : (
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-lg font-bold text-white">
          {startup.name.charAt(0)}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-sm font-semibold text-gray-900">
            {startup.name}
          </h3>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${stageColors[startup.stage] ?? "bg-gray-100 text-gray-600"}`}
          >
            {stageLabels[startup.stage] ?? startup.stage}
          </span>
        </div>

        {startup.industry && (
          <p className="mt-0.5 text-xs text-muted">{startup.industry}</p>
        )}

        {startup.description && (
          <p className="mt-1 text-xs text-gray-600 line-clamp-2">
            {startup.description}
          </p>
        )}
      </div>
    </Link>
  );
}
