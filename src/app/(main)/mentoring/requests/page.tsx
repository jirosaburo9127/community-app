import { getMyMentoringRequests, getMySentRequests } from "@/lib/queries/mentoring";
import { RequestActions } from "@/components/mentoring/request-actions";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: "保留中", color: "bg-yellow-100 text-yellow-700" },
  accepted: { label: "承認済み", color: "bg-green-100 text-green-700" },
  rejected: { label: "却下", color: "bg-red-100 text-red-700" },
};

export default async function MentoringRequestsPage() {
  const [received, sent] = await Promise.all([
    getMyMentoringRequests(),
    getMySentRequests(),
  ]);

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-5 flex items-center gap-2">
        <Link
          href="/mentoring"
          className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-white"
        >
          <ArrowLeft size={18} className="text-muted" />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">リクエスト管理</h1>
      </div>

      {/* 受信リクエスト */}
      <div className="rounded-xl border border-border bg-white">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-gray-900">受信リクエスト</h3>
        </div>
        {received.length === 0 ? (
          <p className="px-5 py-6 text-center text-sm text-muted">
            リクエストはまだありません
          </p>
        ) : (
          <div className="divide-y divide-border">
            {received.map((req) => {
              const s = statusLabels[req.status] ?? statusLabels.pending;
              return (
                <div key={req.id} className="px-5 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {req.profiles?.avatar_url ? (
                        <Image
                          src={req.profiles.avatar_url}
                          alt={req.profiles.display_name}
                          width={36}
                          height={36}
                          className="h-9 w-9 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-xs font-bold text-white">
                          {req.profiles?.display_name.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {req.profiles?.display_name}
                        </p>
                        <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${s.color}`}>
                          {s.label}
                        </span>
                      </div>
                    </div>
                    {req.status === "pending" && (
                      <RequestActions requestId={req.id} />
                    )}
                  </div>
                  {req.message && (
                    <p className="mt-2 text-xs text-gray-600 line-clamp-3">
                      {req.message}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 送信リクエスト */}
      <div className="mt-5 rounded-xl border border-border bg-white">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-gray-900">送信リクエスト</h3>
        </div>
        {sent.length === 0 ? (
          <p className="px-5 py-6 text-center text-sm text-muted">
            送信したリクエストはありません
          </p>
        ) : (
          <div className="divide-y divide-border">
            {sent.map((req) => {
              const s = statusLabels[req.status] ?? statusLabels.pending;
              const mentorProfile = req.mentor_profiles?.profiles;
              return (
                <div key={req.id} className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    {mentorProfile?.avatar_url ? (
                      <Image
                        src={mentorProfile.avatar_url}
                        alt={mentorProfile.display_name}
                        width={36}
                        height={36}
                        className="h-9 w-9 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-xs font-bold text-white">
                        {mentorProfile?.display_name.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {mentorProfile?.display_name}
                      </p>
                      <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${s.color}`}>
                        {s.label}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
