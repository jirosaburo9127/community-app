import { Skeleton } from "@/components/ui/skeleton";

export default function EventsLoading() {
  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6 rounded" />
          <Skeleton className="h-6 w-24" />
        </div>
        <Skeleton className="h-9 w-24 rounded-xl" />
      </div>

      {/* Calendar skeleton */}
      <Skeleton className="mb-5 h-64 w-full rounded-2xl" />

      {/* Event list */}
      <Skeleton className="mb-3 h-4 w-24" />
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-gray-100 bg-white p-4">
            <div className="flex items-start gap-3">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <div className="flex-1">
                <Skeleton className="mb-2 h-4 w-48" />
                <Skeleton className="mb-1 h-3 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
