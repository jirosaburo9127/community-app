import { Skeleton } from "@/components/ui/skeleton";

export default function LearningLoading() {
  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6 rounded" />
          <Skeleton className="h-6 w-24" />
          <Skeleton className="ml-1 h-5 w-8 rounded-full" />
        </div>
        <Skeleton className="h-9 w-32 rounded-xl" />
      </div>

      {/* Difficulty filter skeleton */}
      <div className="mb-5 flex gap-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-14 rounded-lg" />
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-gray-100 bg-white p-4">
            <Skeleton className="mb-3 h-5 w-40" />
            <Skeleton className="mb-2 h-3 w-full" />
            <Skeleton className="mb-3 h-3 w-2/3" />
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-14 rounded-full" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
