import { RegistrationButton } from "@/components/events/registration-button";
import { getEvent, getEventRegistrations } from "@/lib/queries/events";
import { createClient } from "@/lib/supabase/server";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { ArrowLeft, Calendar, Clock, MapPin, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getEvent(id);
  if (!event) notFound();

  const registrations = await getEventRegistrations(event.id);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isRegistered = registrations.some((r: any) => r.user_id === user?.id);
  const isFull = event.capacity
    ? registrations.length >= event.capacity
    : false;

  const eventDate = new Date(event.event_date);
  const isPast = eventDate < new Date();

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-5 flex items-center gap-2">
        <Link
          href="/events"
          className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-white"
        >
          <ArrowLeft size={18} className="text-muted" />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">イベント詳細</h1>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-white">
        {event.image_url ? (
          <Image
            src={event.image_url}
            alt={event.title}
            width={600}
            height={200}
            className="h-40 w-full object-cover"
          />
        ) : (
          <div className="h-24 bg-gradient-to-r from-primary to-accent" />
        )}

        <div className="p-6">
          <h2 className="text-lg font-bold text-gray-900">{event.title}</h2>

          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar size={16} className="text-primary shrink-0" />
              {format(eventDate, "yyyy年M月d日（E）", { locale: ja })}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock size={16} className="text-primary shrink-0" />
              {format(eventDate, "HH:mm", { locale: ja })}
              {event.end_date &&
                ` - ${format(new Date(event.end_date), "HH:mm", { locale: ja })}`}
            </div>
            {event.location && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin size={16} className="text-primary shrink-0" />
                {event.location}
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users size={16} className="text-primary shrink-0" />
              {registrations.length}人参加
              {event.capacity && ` / 定員${event.capacity}人`}
            </div>
          </div>

          <div className="mt-3 text-xs text-muted">
            主催：{event.profiles?.display_name}
          </div>

          {event.description && (
            <p className="mt-4 text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
              {event.description}
            </p>
          )}

          {!isPast && (
            <div className="mt-5">
              <RegistrationButton
                eventId={event.id}
                isRegistered={isRegistered}
                isFull={isFull}
              />
            </div>
          )}

          {isPast && (
            <div className="mt-5 rounded-lg bg-gray-50 p-3 text-center text-sm text-muted">
              このイベントは終了しました
            </div>
          )}
        </div>
      </div>

      {/* Attendees */}
      {registrations.length > 0 && (
        <div className="mt-5">
          <h3 className="mb-3 text-sm font-semibold text-gray-900">
            参加者（{registrations.length}人）
          </h3>
          <div className="flex flex-wrap gap-2">
            {registrations.map((reg: any) => (
              <Link
                key={reg.id}
                href={`/members/${reg.user_id}`}
                className="flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 transition-colors hover:bg-gray-50"
              >
                {reg.profiles?.avatar_url ? (
                  <Image
                    src={reg.profiles.avatar_url}
                    alt={reg.profiles.display_name}
                    width={24}
                    height={24}
                    className="h-6 w-6 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-[10px] font-bold text-white">
                    {reg.profiles?.display_name?.charAt(0) ?? "?"}
                  </div>
                )}
                <span className="text-xs font-medium text-gray-700">
                  {reg.profiles?.display_name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
