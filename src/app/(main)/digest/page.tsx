import { DigestStats } from "@/components/digest/digest-stats";
import { DigestTopPosts } from "@/components/digest/digest-top-posts";
import { DigestNewMembers } from "@/components/digest/digest-new-members";
import { DigestUpcomingEvents } from "@/components/digest/digest-upcoming-events";
import {
  getWeeklyStats,
  getTopPosts,
  getNewMembers,
  getDigestUpcomingEvents,
} from "@/lib/queries/digest";
import { ArrowLeft, BarChart3 } from "lucide-react";
import Link from "next/link";

export default async function DigestPage() {
  const [stats, topPosts, newMembers, upcomingEvents] = await Promise.all([
    getWeeklyStats(),
    getTopPosts(),
    getNewMembers(),
    getDigestUpcomingEvents(),
  ]);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-5 flex items-center gap-2">
        <Link
          href="/home"
          className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-white"
        >
          <ArrowLeft size={18} className="text-muted" />
        </Link>
        <div className="flex items-center gap-2">
          <BarChart3 size={20} className="text-accent" />
          <h1 className="text-xl font-bold text-gray-900">
            ウィークリーダイジェスト
          </h1>
        </div>
      </div>

      <p className="mb-5 text-sm text-muted">
        今週のコミュニティ活動をまとめました。
      </p>

      <div className="space-y-5">
        <DigestStats stats={stats} />
        <DigestTopPosts posts={topPosts} />
        <DigestNewMembers members={newMembers} />
        <DigestUpcomingEvents events={upcomingEvents} />
      </div>
    </div>
  );
}
