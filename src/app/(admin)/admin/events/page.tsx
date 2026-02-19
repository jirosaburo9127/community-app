"use client";

import { createClient } from "@/lib/supabase/client";
import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

type EventRow = {
  id: string;
  title: string;
  event_date: string;
  capacity: number | null;
  organizer_id: string;
  profiles: { display_name: string } | null;
  registration_count: number;
};

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    setLoading(true);
    const { data } = await supabase
      .from("events")
      .select("id, title, event_date, capacity, organizer_id, profiles(display_name)")
      .order("event_date", { ascending: false });

    if (data) {
      const withCounts = await Promise.all(
        data.map(async (ev: any) => {
          const { count } = await supabase
            .from("event_registrations")
            .select("*", { count: "exact", head: true })
            .eq("event_id", ev.id)
            .eq("status", "registered");
          return { ...ev, registration_count: count ?? 0 };
        })
      );
      setEvents(withCounts);
    }
    setLoading(false);
  }

  async function deleteEvent(eventId: string) {
    if (!confirm("このイベントを削除しますか？")) return;
    const { error } = await supabase.from("events").delete().eq("id", eventId);
    if (!error) {
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
    }
  }

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-5">イベント管理</h2>

      <div className="overflow-x-auto rounded-xl border border-border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-gray-50 text-left">
              <th className="px-4 py-3 font-medium text-gray-600">タイトル</th>
              <th className="px-4 py-3 font-medium text-gray-600">主催者</th>
              <th className="px-4 py-3 font-medium text-gray-600">日時</th>
              <th className="px-4 py-3 font-medium text-gray-600">参加者/定員</th>
              <th className="px-4 py-3 font-medium text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted">
                  読み込み中...
                </td>
              </tr>
            ) : events.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted">
                  イベントがありません
                </td>
              </tr>
            ) : (
              events.map((ev) => (
                <tr key={ev.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900 truncate max-w-[200px]">
                    {ev.title}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {ev.profiles?.display_name ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(ev.event_date).toLocaleDateString("ja-JP")}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {ev.registration_count}
                    {ev.capacity ? ` / ${ev.capacity}` : ""}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => deleteEvent(ev.id)}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                      title="削除"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
