import { getResource } from "@/lib/queries/resources";
import { RESOURCE_CATEGORIES } from "@/lib/constants";
import { ArrowLeft, ExternalLink, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ResourceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const resource = await getResource(id);
  if (!resource) notFound();

  const cat = RESOURCE_CATEGORIES.find((c) => c.value === resource.category);
  const profile = resource.profiles;

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-5 flex items-center gap-2">
        <Link
          href="/resources"
          className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-white"
        >
          <ArrowLeft size={18} className="text-muted" />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">リソース詳細</h1>
      </div>

      <div className="rounded-xl border border-border bg-white p-5">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-lg font-bold text-gray-900">{resource.title}</h2>
          {cat && (
            <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              {cat.emoji} {cat.label}
            </span>
          )}
        </div>

        {resource.description && (
          <p className="mt-3 text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
            {resource.description}
          </p>
        )}

        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-4 py-2.5 text-sm font-medium text-white shadow-md shadow-primary/20 transition-all hover:shadow-lg"
        >
          <ExternalLink size={16} />
          リソースを開く
        </a>

        {/* Author */}
        {profile && (
          <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
            {profile.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={profile.display_name}
                width={36}
                height={36}
                className="h-9 w-9 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-xs font-bold text-white">
                {profile.display_name.charAt(0)}
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-900">
                {profile.display_name}
              </p>
              <p className="text-xs text-muted">
                {new Date(resource.created_at).toLocaleDateString("ja-JP")}に共有
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
