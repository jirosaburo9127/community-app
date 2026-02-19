import { MemberCard } from "@/components/members/member-card";
import { MemberSearch } from "@/components/members/member-search";
import { getMembers } from "@/lib/queries/members";
import type { ProfileRole } from "@/lib/types";
import { Users } from "lucide-react";
import { Suspense } from "react";

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; search?: string }>;
}) {
  const { role, search } = await searchParams;

  const members = await getMembers({
    role: role as ProfileRole | undefined,
    search,
  });

  return (
    <div>
      <div className="mb-5 flex items-center gap-2">
        <Users size={22} className="text-primary" />
        <h1 className="text-xl font-bold text-gray-900">メンバー</h1>
        <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
          {members.length}
        </span>
      </div>

      <Suspense fallback={null}>
        <MemberSearch />
      </Suspense>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {members.map((member) => (
          <MemberCard key={member.id} member={member} />
        ))}
      </div>

      {members.length === 0 && (
        <div className="mt-8 text-center text-sm text-muted">
          メンバーが見つかりませんでした
        </div>
      )}
    </div>
  );
}
