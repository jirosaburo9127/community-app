import type { GroupRoom } from "@/lib/types";
import { Hash } from "lucide-react";
import Link from "next/link";

export function RoomList({
  rooms,
  groupSlug,
}: {
  rooms: GroupRoom[];
  groupSlug: string;
}) {
  if (rooms.length === 0) {
    return (
      <p className="text-center text-sm text-muted py-6">
        まだチャットルームがありません
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {rooms.map((room) => (
        <Link
          key={room.id}
          href={`/groups/${groupSlug}/rooms/${room.id}`}
          className="flex items-center gap-3 rounded-xl border border-border bg-white px-4 py-3 transition-colors hover:border-primary/30 hover:bg-blue-50/30"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 text-primary">
            <Hash size={16} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {room.name}
            </p>
            {room.description && (
              <p className="text-xs text-muted truncate">{room.description}</p>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
