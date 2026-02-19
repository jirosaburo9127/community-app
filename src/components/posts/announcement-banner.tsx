import { Megaphone } from "lucide-react";
import Link from "next/link";

type Announcement = {
  id: string;
  title: string;
};

export function AnnouncementBanner({
  announcements,
}: {
  announcements: Announcement[];
}) {
  if (announcements.length === 0) return null;

  return (
    <section className="mb-5">
      <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4">
        <div className="mb-2 flex items-center gap-2">
          <Megaphone size={16} className="text-amber-600" />
          <h2 className="text-sm font-bold text-amber-800">お知らせ</h2>
        </div>
        <ul className="space-y-1.5">
          {announcements.map((a) => (
            <li key={a.id}>
              <Link
                href={`/posts/${a.id}`}
                className="group flex items-start gap-2 text-sm"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                <span className="text-gray-700 group-hover:text-primary group-hover:underline">
                  {a.title}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
