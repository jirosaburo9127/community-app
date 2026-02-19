"use client";

import type { Event } from "@/lib/types";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ja } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const weekDays = ["日", "月", "火", "水", "木", "金", "土"];

export function EventCalendar({ events }: { events: Event[] }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  function getEventsForDay(day: Date) {
    return events.filter((e) => isSameDay(new Date(e.event_date), day));
  }

  return (
    <div className="rounded-xl border border-border bg-white p-4">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gray-100"
        >
          <ChevronLeft size={18} className="text-muted" />
        </button>
        <h3 className="text-sm font-semibold text-gray-900">
          {format(currentMonth, "yyyy年M月", { locale: ja })}
        </h3>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gray-100"
        >
          <ChevronRight size={18} className="text-muted" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="mb-1 grid grid-cols-7 gap-0">
        {weekDays.map((day) => (
          <div
            key={day}
            className="py-1 text-center text-[10px] font-medium text-muted"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-0">
        {days.map((day) => {
          const dayEvents = getEventsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isToday = isSameDay(day, new Date());

          return (
            <div
              key={day.toISOString()}
              className={`relative min-h-[40px] border-t border-border/50 p-0.5 ${
                !isCurrentMonth ? "opacity-30" : ""
              }`}
            >
              <span
                className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] ${
                  isToday
                    ? "bg-primary text-white font-bold"
                    : "text-gray-700"
                }`}
              >
                {format(day, "d")}
              </span>
              {dayEvents.length > 0 && (
                <div className="mt-0.5 space-y-0.5">
                  {dayEvents.slice(0, 2).map((event) => (
                    <Link
                      key={event.id}
                      href={`/events/${event.id}`}
                      className="block truncate rounded bg-primary/10 px-1 py-0.5 text-[9px] font-medium text-primary hover:bg-primary/20"
                    >
                      {event.title}
                    </Link>
                  ))}
                  {dayEvents.length > 2 && (
                    <span className="block text-[9px] text-muted pl-1">
                      +{dayEvents.length - 2}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
