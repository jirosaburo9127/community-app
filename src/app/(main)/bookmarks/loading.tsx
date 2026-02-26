import { Skeleton } from "@/components/ui/skeleton";

export default function BookmarksLoading() {
  return (
    <div>
      <Skeleton className="mb-6 h-7 w-32" />
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-gray-100 bg-white p-4">
            <Skeleton className="mb-2 h-5 w-3/4" />
            <Skeleton className="mb-2 h-4 w-full" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}
