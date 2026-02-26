import { Skeleton } from "@/components/ui/skeleton";

export default function NotificationsLoading() {
  return (
    <div>
      <Skeleton className="mb-6 h-7 w-24" />
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3 rounded-xl border border-gray-100 bg-white p-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1">
              <Skeleton className="mb-1 h-4 w-3/4" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
