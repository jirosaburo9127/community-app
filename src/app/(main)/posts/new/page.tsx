import { PostForm } from "@/components/posts/post-form";
import { getCategories } from "@/lib/queries/categories";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function NewPostPage() {
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-5 flex items-center gap-2">
        <Link
          href="/home"
          className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-white"
        >
          <ArrowLeft size={18} className="text-muted" />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">新しい投稿</h1>
      </div>
      <div className="rounded-xl border border-border bg-white p-5">
        <PostForm categories={categories} />
      </div>
    </div>
  );
}
