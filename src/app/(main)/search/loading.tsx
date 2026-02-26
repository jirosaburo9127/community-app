import { Skeleton } from "@/components/ui/skeleton";

export default function SearchLoading() {
  return (
    <div>
      <Skeleton className="mb-6 h-10 w-full rounded-xl" />
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-gray-100 bg-white p-4">
            <div className="mb-2 flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="mb-2 h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
