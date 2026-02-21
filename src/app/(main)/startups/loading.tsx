import { Skeleton } from "@/components/ui/skeleton";

export default function StartupsLoading() {
  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6 rounded" />
          <Skeleton className="h-6 w-32" />
          <Skeleton className="ml-1 h-5 w-8 rounded-full" />
        </div>
        <Skeleton className="h-9 w-24 rounded-xl" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-gray-100 bg-white p-4">
            <div className="mb-3 flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <Skeleton className="h-5 w-32" />
            </div>
            <Skeleton className="mb-2 h-3 w-full" />
            <Skeleton className="mb-3 h-3 w-3/4" />
            <div className="flex gap-1.5">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
