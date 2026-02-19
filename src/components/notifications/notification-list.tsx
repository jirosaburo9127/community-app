"use client";

import type { Notification } from "@/lib/types";
import { NotificationItem } from "./notification-item";
import { createClient } from "@/lib/supabase/client";
import { useEffect } from "react";

export function NotificationList({
  notifications,
}: {
  notifications: Notification[];
}) {
  // Mark unread notifications as read when viewing
  useEffect(() => {
    const unreadIds = notifications
      .filter((n) => !n.is_read)
      .map((n) => n.id);

    if (unreadIds.length === 0) return;

    const supabase = createClient();
    supabase
      .from("notifications")
      .update({ is_read: true })
      .in("id", unreadIds)
      .then(({ error }) => {
        if (error) console.error("Failed to mark as read:", error.message);
      });
  }, [notifications]);

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center py-12 text-center">
        <p className="text-sm text-muted">通知はまだありません</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {notifications.map((notification) => (
        <NotificationItem key={notification.id} notification={notification} />
      ))}
    </div>
  );
}
