import { ResourceCard } from "@/components/resources/resource-card";
import { getResources } from "@/lib/queries/resources";
import { RESOURCE_CATEGORIES } from "@/lib/constants";
import { Library, Plus } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default async function ResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const resources = await getResources(category);

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Library size={22} className="text-primary" />
          <h1 className="text-xl font-bold text-gray-900">リソース</h1>
        </div>
        <Link
          href="/resources/new"
          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-accent px-4 py-2 text-sm font-medium text-white shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:-translate-y-0.5"
        >
          <Plus size={16} />
          共有する
        </Link>
      </div>

      {/* Category tabs */}
      <div className="mb-5 flex flex-wrap gap-2">
        <Link
          href="/resources"
          className={cn(
            "rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
            !category
              ? "bg-primary text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          )}
        >
          すべて
        </Link>
        {RESOURCE_CATEGORIES.map((cat) => (
          <Link
            key={cat.value}
            href={`/resources?category=${cat.value}`}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
              category === cat.value
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            {cat.emoji} {cat.label}
          </Link>
        ))}
      </div>

      {/* Resource list */}
      <div className="grid gap-3 sm:grid-cols-2">
        {resources.map((resource) => (
          <ResourceCard key={resource.id} resource={resource} />
        ))}
      </div>

      {resources.length === 0 && (
        <div className="mt-8 text-center text-sm text-muted">
          まだリソースがありません
        </div>
      )}
    </div>
  );
}
