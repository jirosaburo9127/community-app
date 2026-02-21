import type { Resource } from "@/lib/types";
import { RESOURCE_CATEGORIES } from "@/lib/constants";
import { ExternalLink, User } from "lucide-react";
import Link from "next/link";

const categoryColors: Record<string, { bg: string; text: string }> = {
  template: { bg: "bg-blue-50", text: "text-blue-700" },
  pitch: { bg: "bg-purple-50", text: "text-purple-700" },
  tech_article: { bg: "bg-emerald-50", text: "text-emerald-700" },
  tool: { bg: "bg-amber-50", text: "text-amber-700" },
  book: { bg: "bg-rose-50", text: "text-rose-700" },
  other: { bg: "bg-gray-50", text: "text-gray-700" },
};

export function ResourceCard({ resource }: { resource: Resource }) {
  const cat = RESOURCE_CATEGORIES.find((c) => c.value === resource.category);
  const color = categoryColors[resource.category] ?? categoryColors.other;

  return (
    <Link
      href={`/resources/${resource.id}`}
      className="flex flex-col gap-2.5 rounded-xl border border-border bg-white p-4 transition-all hover:shadow-md hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">
          {resource.title}
        </h3>
        <span
          className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${color.bg} ${color.text}`}
        >
          {cat?.emoji} {cat?.label}
        </span>
      </div>

      {resource.description && (
        <p className="text-xs text-gray-600 line-clamp-2">{resource.description}</p>
      )}

      <div className="flex items-center justify-between text-xs text-muted">
        <span className="flex items-center gap-1">
          <User size={12} />
          {resource.profiles?.display_name}
        </span>
        <ExternalLink size={12} />
      </div>
    </Link>
  );
}
