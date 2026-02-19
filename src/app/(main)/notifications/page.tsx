import { getNotifications } from "@/lib/queries/notifications";
import { NotificationList } from "@/components/notifications/notification-list";
import { Bell } from "lucide-react";

export default async function NotificationsPage() {
  const notifications = await getNotifications();

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-5 flex items-center gap-2">
        <Bell size={20} className="text-primary" />
        <h1 className="text-xl font-bold text-gray-900">通知</h1>
      </div>
      <NotificationList notifications={notifications as any} />
    </div>
  );
}
