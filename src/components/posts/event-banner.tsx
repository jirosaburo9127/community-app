import type { Event } from "@/lib/types";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { CalendarDays, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function EventBanner({ events }: { events: Event[] }) {
  if (events.length === 0) return null;

  const [featured, ...rest] = events;

  const featuredDate = new Date(featured.event_date);

  return (
    <section className="mb-6">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays size={18} className="text-primary" />
          <h2 className="text-sm font-bold text-gray-900">今後のイベント</h2>
        </div>
        <Link
          href="/events"
          className="text-xs font-medium text-primary hover:underline"
        >
          すべて見る
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {/* メインイベント */}
        <Link
          href={`/events/${featured.id}`}
          className="group relative overflow-hidden rounded-xl border border-border bg-white sm:col-span-2 lg:col-span-2 transition-all hover:shadow-md"
        >
          <div className="relative aspect-[2.5/1] w-full overflow-hidden bg-primary/5">
            {featured.image_url ? (
              <Image
                src={featured.image_url}
                alt={featured.title}
                fill
                className="object-cover transition-transform group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 66vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <CalendarDays size={48} className="text-primary/20" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <span className="mb-1.5 inline-flex items-center gap-1 rounded-md bg-white/20 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
                {format(featuredDate, "M/d（E）HH:mm", { locale: ja })}
              </span>
              <h3 className="text-base font-bold text-white leading-snug line-clamp-2">
                {featured.title}
              </h3>
              {featured.location && (
                <p className="mt-1 flex items-center gap-1 text-xs text-white/70">
                  <MapPin size={12} />
                  {featured.location}
                </p>
              )}
            </div>
          </div>
        </Link>

        {/* サブイベント */}
        {rest.length > 0 && (
          <div className="flex flex-col gap-3">
            {rest.map((event) => {
              const eventDate = new Date(event.event_date);
              return (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="group flex gap-3 overflow-hidden rounded-xl border border-border bg-white p-3 transition-all hover:shadow-md"
                >
                  <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-lg bg-primary/8">
                    <span className="text-[10px] font-medium text-primary">
                      {format(eventDate, "M月", { locale: ja })}
                    </span>
                    <span className="text-lg font-bold leading-tight text-primary">
                      {format(eventDate, "d")}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2">
                      {event.title}
                    </h4>
                    <p className="mt-1 text-xs text-muted">
                      {format(eventDate, "HH:mm", { locale: ja })}
                      {event.location && ` · ${event.location}`}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
