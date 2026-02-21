/**
 * インメモリTTLキャッシュを作成する。
 * プロセス単位でキャッシュされ、TTL経過後に再取得される。
 * ユーザー非依存のデータ（カテゴリ一覧、ランキング等）向け。
 */
export function createTTLCache<T>(fetcher: () => Promise<T>, ttlMs: number) {
  let cached: { data: T; expiry: number } | null = null;

  return async function get(): Promise<T> {
    const now = Date.now();
    if (cached && cached.expiry > now) {
      return cached.data;
    }
    const data = await fetcher();
    cached = { data, expiry: now + ttlMs };
    return data;
  };
}
