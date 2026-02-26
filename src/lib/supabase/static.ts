import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Cookie不要のSupabaseクライアント（公開データ読み取り専用）。
 * unstable_cache内やリクエストコンテキスト外で使用可能。
 */
export function createStaticClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createSupabaseClient(url, key);
}
