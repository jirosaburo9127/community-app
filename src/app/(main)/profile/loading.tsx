import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <div>
      {/* Profile header */}
      <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="flex-1">
            <Skeleton className="mb-2 h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="mt-4 flex gap-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>

      {/* Badges */}
      <div className="mb-6">
        <Skeleton className="mb-2 h-4 w-16" />
        <div className="flex flex-wrap gap-1.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-7 w-24 rounded-full" />
          ))}
        </div>
      </div>

      {/* Activity */}
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-gray-100 bg-white p-4">
            <Skeleton className="mb-2 h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}
