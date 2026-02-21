import { EventCalendar } from "@/components/events/event-calendar";
import { EventCard } from "@/components/events/event-card";
import { getEvents } from "@/lib/queries/events";
import { Calendar, Plus } from "lucide-react";
import Link from "next/link";

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar size={22} className="text-primary" />
          <h1 className="text-xl font-bold text-gray-900">イベント</h1>
        </div>
        <Link
          href="/events/new"
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md"
        >
          <Plus size={16} />
          作成する
        </Link>
      </div>

      {/* Calendar view */}
      <EventCalendar events={events} />

      {/* Event list */}
      <div className="mt-5">
        <h2 className="mb-3 text-sm font-semibold text-gray-900">
          イベント一覧
        </h2>
        <div className="space-y-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>

        {events.length === 0 && (
          <div className="mt-8 text-center text-sm text-muted">
            まだイベントがありません
          </div>
        )}
      </div>
    </div>
  );
}
