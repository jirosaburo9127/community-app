import { StartupCard } from "@/components/startups/startup-card";
import { getStartups } from "@/lib/queries/startups";
import { Plus, Rocket } from "lucide-react";
import Link from "next/link";

export default async function StartupsPage() {
  const startups = await getStartups();

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Rocket size={22} className="text-accent" />
          <h1 className="text-xl font-bold text-gray-900">スタートアップ</h1>
          <span className="ml-1 rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
            {startups.length}
          </span>
        </div>
        <Link
          href="/startups/new"
          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-accent px-4 py-2 text-sm font-medium text-white shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:-translate-y-0.5"
        >
          <Plus size={16} />
          登録する
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {startups.map((startup) => (
          <StartupCard key={startup.id} startup={startup} />
        ))}
      </div>

      {startups.length === 0 && (
        <div className="mt-8 text-center text-sm text-muted">
          まだスタートアップが登録されていません
        </div>
      )}
    </div>
  );
}
