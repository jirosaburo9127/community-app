import { UserPlus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type NewMember = {
  id: string;
  display_name: string;
  avatar_url: string | null;
  role: string;
  company: string | null;
};

const roleLabels: Record<string, string> = {
  student: "学生",
  entrepreneur: "起業家",
  mentor: "メンター",
  investor: "投資家",
};

export function DigestNewMembers({ members }: { members: NewMember[] }) {
  if (members.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-white p-6 text-center">
        <p className="text-sm text-muted">今週の新メンバーはいません</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-white">
      <div className="flex items-center gap-2 border-b border-border px-5 py-3.5">
        <UserPlus size={16} className="text-green-500" />
        <h3 className="text-sm font-semibold text-gray-900">新メンバー</h3>
      </div>
      <div className="flex flex-wrap gap-3 p-4">
        {members.map((m) => (
          <Link
            key={m.id}
            href={`/members/${m.id}`}
            className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 transition-colors hover:bg-gray-50"
          >
            {m.avatar_url ? (
              <Image
                src={m.avatar_url}
                alt={m.display_name}
                width={28}
                height={28}
                className="h-7 w-7 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-[10px] font-bold text-white">
                {m.display_name.charAt(0)}
              </div>
            )}
            <div>
              <p className="text-xs font-medium text-gray-900">
                {m.display_name}
              </p>
              <p className="text-[10px] text-muted">
                {roleLabels[m.role] ?? m.role}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
