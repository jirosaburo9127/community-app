import type { Event } from "@/lib/types";
import { Calendar, MapPin } from "lucide-react";
import Link from "next/link";

export function DigestUpcomingEvents({ events }: { events: Event[] }) {
  if (events.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-white p-6 text-center">
        <p className="text-sm text-muted">予定されているイベントはありません</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-white">
      <div className="flex items-center gap-2 border-b border-border px-5 py-3.5">
        <Calendar size={16} className="text-primary" />
        <h3 className="text-sm font-semibold text-gray-900">今後のイベント</h3>
      </div>
      <div className="divide-y divide-border">
        {events.map((event) => (
          <Link
            key={event.id}
            href={`/events/${event.id}`}
            className="flex items-start gap-3 px-5 py-3 transition-colors hover:bg-gray-50"
          >
            <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg bg-primary/8">
              <span className="text-[10px] font-medium text-primary">
                {new Date(event.event_date).toLocaleDateString("ja-JP", { month: "short" })}
              </span>
              <span className="text-sm font-bold text-primary leading-none">
                {new Date(event.event_date).getDate()}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 line-clamp-1">
                {event.title}
              </p>
              {event.location && (
                <p className="mt-0.5 flex items-center gap-0.5 text-xs text-muted">
                  <MapPin size={11} />
                  {event.location}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
