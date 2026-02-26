import { Skeleton } from "@/components/ui/skeleton";

export default function MessagesLoading() {
  return (
    <div>
      <Skeleton className="mb-6 h-7 w-28" />
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1">
              <Skeleton className="mb-1 h-4 w-28" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-3 w-12" />
          </div>
        ))}
      </div>
    </div>
  );
}
