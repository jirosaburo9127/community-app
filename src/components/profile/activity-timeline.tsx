import { getActivity } from "@/lib/queries/activity";
import { Calendar, FileText, MessageCircle } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";

const activityConfig = {
  post: {
    icon: FileText,
    color: "text-primary bg-primary/10",
    label: (title: string) => `「${title}」を投稿しました`,
  },
  comment: {
    icon: MessageCircle,
    color: "text-accent bg-accent/10",
    label: (title: string) => `「${title}」にコメントしました`,
  },
  event_registration: {
    icon: Calendar,
    color: "text-green-600 bg-green-50",
    label: (title: string) => `「${title}」に参加登録しました`,
  },
} as const;

export async function ActivityTimeline({ userId, activities: prefetched }: { userId?: string; activities?: Awaited<ReturnType<typeof getActivity>> }) {
  const activities = prefetched ?? (userId ? await getActivity(userId) : []);

  if (activities.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-white p-6 text-center">
        <p className="text-sm text-muted">まだ活動履歴がありません</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-white">
      <div className="px-5 py-4 border-b border-border">
        <h3 className="text-sm font-semibold text-gray-900">活動履歴</h3>
      </div>
      <div className="divide-y divide-border">
        {activities.map((item) => {
          const config = activityConfig[item.type];
          const Icon = config.icon;
          return (
            <Link
              key={`${item.type}-${item.id}`}
              href={item.link}
              className="flex items-start gap-3 px-5 py-3 transition-colors hover:bg-gray-50"
            >
              <div
                className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${config.color}`}
              >
                <Icon size={14} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-700 line-clamp-1">
                  {config.label(item.title)}
                </p>
                <p className="mt-0.5 text-xs text-muted">
                  {formatDistanceToNow(new Date(item.created_at), {
                    addSuffix: true,
                    locale: ja,
                  })}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
