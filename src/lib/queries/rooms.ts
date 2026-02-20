import { createClient } from "@/lib/supabase/server";

export async function getRooms(groupId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("group_rooms")
    .select("*")
    .eq("group_id", groupId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Failed to fetch rooms:", error.message);
    return [];
  }
  return data;
}

export async function getRoom(roomId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("group_rooms")
    .select("*")
    .eq("id", roomId)
    .single();

  if (error) return null;
  return data;
}

export async function getRoomMessages(roomId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("room_messages")
    .select("*, profiles(*)")
    .eq("room_id", roomId)
    .order("created_at", { ascending: true })
    .limit(100);

  if (error) {
    console.error("Failed to fetch room messages:", error.message);
    return [];
  }
  return data;
}
