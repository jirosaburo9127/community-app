import { Skeleton } from "@/components/ui/skeleton";

export default function MembersLoading() {
  return (
    <div>
      <div className="mb-5 flex items-center gap-2">
        <Skeleton className="h-6 w-6 rounded" />
        <Skeleton className="h-6 w-20" />
        <Skeleton className="ml-1 h-5 w-8 rounded-full" />
      </div>

      {/* Search bar skeleton */}
      <Skeleton className="h-10 w-full rounded-xl" />

      {/* Member cards grid */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-gray-100 bg-white p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1">
                <Skeleton className="mb-1.5 h-4 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <div className="mt-3 flex gap-1.5">
              <Skeleton className="h-5 w-14 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
