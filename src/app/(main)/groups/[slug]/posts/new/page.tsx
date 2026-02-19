import { PostForm } from "@/components/posts/post-form";
import { getCategories } from "@/lib/queries/categories";
import { getGroup } from "@/lib/queries/groups";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function NewGroupPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const group = await getGroup(slug);
  if (!group) notFound();

  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-5 flex items-center gap-2">
        <Link
          href={`/groups/${slug}`}
          className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-white"
        >
          <ArrowLeft size={18} className="text-muted" />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">
          {group.name} に投稿
        </h1>
      </div>
      <div className="rounded-xl border border-border bg-white p-5">
        <PostForm categories={categories} groupId={group.id} groupSlug={slug} />
      </div>
    </div>
  );
}
