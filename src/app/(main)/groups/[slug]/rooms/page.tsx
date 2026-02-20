import { RoomCreateForm } from "@/components/groups/room-create-form";
import { RoomList } from "@/components/groups/room-list";
import { getGroup, getGroupMembers } from "@/lib/queries/groups";
import { getRooms } from "@/lib/queries/rooms";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeft, Hash } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function GroupRoomsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const supabase = await createClient();
  const [group, { data: { user } }] = await Promise.all([
    getGroup(slug),
    supabase.auth.getUser(),
  ]);
  if (!group) notFound();

  const [members, rooms] = await Promise.all([
    getGroupMembers(group.id),
    getRooms(group.id),
  ]);

  const isMember = members.some((m) => m.user_id === user?.id);
  if (!isMember) notFound();

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-5 flex items-center gap-2">
        <Link
          href={`/groups/${slug}`}
          className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-white"
        >
          <ArrowLeft size={18} className="text-muted" />
        </Link>
        <div className="flex items-center gap-2">
          <Hash size={18} className="text-primary" />
          <h1 className="text-xl font-bold text-gray-900">
            チャットルーム
          </h1>
        </div>
        <span className="text-sm text-muted">- {group.name}</span>
      </div>

      <div className="mb-4">
        <RoomCreateForm groupId={group.id} />
      </div>

      <RoomList rooms={rooms} groupSlug={slug} />
    </div>
  );
}
