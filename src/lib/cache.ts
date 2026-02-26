import { unstable_cache } from "next/cache";

/**
 * Vercelインフラレベルのキャッシュを作成する。
 * サーバーレス関数間で共有され、revalidate秒後に再取得される。
 * ユーザー非依存のデータ（カテゴリ一覧、投稿リスト等）向け。
 */
export function createTTLCache<T>(
  fetcher: () => Promise<T>,
  ttlMs: number,
  cacheKey?: string,
) {
  const revalidateSeconds = Math.max(1, Math.round(ttlMs / 1000));
  const key = cacheKey ?? (fetcher.name || "anonymous");

  return unstable_cache(fetcher, [key], {
    revalidate: revalidateSeconds,
  });
}
