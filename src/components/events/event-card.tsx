import type { Event } from "@/lib/types";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Calendar, MapPin, Users } from "lucide-react";
import Link from "next/link";

export function EventCard({
  event,
  registrationCount,
}: {
  event: Event;
  registrationCount?: number;
}) {
  const eventDate = new Date(event.event_date);
  const month = format(eventDate, "M月", { locale: ja });
  const day = format(eventDate, "d", { locale: ja });
  const weekday = format(eventDate, "E", { locale: ja });
  const time = format(eventDate, "HH:mm", { locale: ja });
  const isPast = eventDate < new Date();

  return (
    <Link
      href={`/events/${event.id}`}
      className={`flex gap-3.5 rounded-xl border border-border bg-white p-4 transition-all hover:shadow-md ${isPast ? "opacity-60" : ""}`}
    >
      {/* Date box */}
      <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-lg bg-primary/8">
        <span className="text-[10px] font-medium text-primary">{month}</span>
        <span className="text-lg font-bold leading-tight text-primary">
          {day}
        </span>
        <span className="text-[10px] text-muted">{weekday}</span>
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-semibold text-gray-900">
          {event.title}
        </h3>

        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted">
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            {time}
          </span>
          {event.location && (
            <span className="flex items-center gap-1">
              <MapPin size={12} />
              {event.location}
            </span>
          )}
          {(registrationCount !== undefined || event.capacity) && (
            <span className="flex items-center gap-1">
              <Users size={12} />
              {registrationCount ?? 0}
              {event.capacity ? `/${event.capacity}` : ""}人
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
