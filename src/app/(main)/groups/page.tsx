import { GroupCard } from "@/components/groups/group-card";
import { getGroups } from "@/lib/queries/groups";
import { Plus, UsersRound } from "lucide-react";
import Link from "next/link";

export default async function GroupsPage() {
  const groups = await getGroups();

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UsersRound size={22} className="text-accent" />
          <h1 className="text-xl font-bold text-gray-900">グループ</h1>
          <span className="ml-1 rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
            {groups.length}
          </span>
        </div>
        <Link
          href="/groups/new"
          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-accent px-4 py-2 text-sm font-medium text-white shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:-translate-y-0.5"
        >
          <Plus size={16} />
          作成する
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {groups.map((group) => (
          <GroupCard key={group.id} group={group} />
        ))}
      </div>

      {groups.length === 0 && (
        <div className="mt-8 text-center text-sm text-muted">
          まだグループがありません
        </div>
      )}
    </div>
  );
}
