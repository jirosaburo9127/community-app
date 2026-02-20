import { RoomChat } from "@/components/groups/room-chat";
import { getGroup, getGroupMembers } from "@/lib/queries/groups";
import { getRoom, getRoomMessages } from "@/lib/queries/rooms";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeft, Hash } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function RoomChatPage({
  params,
}: {
  params: Promise<{ slug: string; roomId: string }>;
}) {
  const { slug, roomId } = await params;

  const supabase = await createClient();
  const [group, { data: { user } }, room] = await Promise.all([
    getGroup(slug),
    supabase.auth.getUser(),
    getRoom(roomId),
  ]);
  if (!group || !user) notFound();
  if (!room || room.group_id !== group.id) notFound();

  const [members, messages] = await Promise.all([
    getGroupMembers(group.id),
    getRoomMessages(roomId),
  ]);

  const isMember = members.some((m) => m.user_id === user.id);
  if (!isMember) notFound();

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-2xl flex-col rounded-xl border border-border bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <Link
          href={`/groups/${slug}/rooms`}
          className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-gray-100"
        >
          <ArrowLeft size={18} className="text-muted" />
        </Link>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 text-primary">
          <Hash size={16} />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">{room.name}</p>
          <p className="text-xs text-muted">{group.name}</p>
        </div>
      </div>

      {/* Chat */}
      <RoomChat
        roomId={roomId}
        currentUserId={user.id}
        initialMessages={messages}
      />
    </div>
  );
}
