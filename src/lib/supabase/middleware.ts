import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const pathname = request.nextUrl.pathname;
  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register") || pathname.startsWith("/auth");

  // セッション更新 + ユーザー取得（1回のみ）
  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    // ignore
  }

  // 未ログイン → ログインページへ
  if (!user && !isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // ログイン済み → auth ページからリダイレクト
  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/home";
    return NextResponse.redirect(url);
  }

  // ユーザーIDをヘッダーで下流に渡す（layout等でgetUser()の二重呼び出しを回避）
  if (user) {
    supabaseResponse.headers.set("x-user-id", user.id);
  }

  // admin/onboarding チェック
  if (user && !isAuthPage) {
    const needsAdminCheck = pathname.startsWith("/admin");
    const onboardingCached = request.cookies.get("onboarding_completed")?.value === "1";
    const needsOnboardingCheck = !onboardingCached && !pathname.startsWith("/onboarding") && !pathname.startsWith("/api");

    const displayNameCached = request.cookies.has("display_name");

    // DBクエリはadminチェック、オンボーディング未確認、またはdisplayName未キャッシュ時のみ
    if (needsAdminCheck || needsOnboardingCheck || !displayNameCached) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin, onboarding_completed, display_name")
        .eq("id", user.id)
        .single();

      // Admin ルート保護
      if (needsAdminCheck && !profile?.is_admin) {
        const url = request.nextUrl.clone();
        url.pathname = "/home";
        return NextResponse.redirect(url);
      }

      // オンボーディング未完了 → リダイレクト
      if (needsOnboardingCheck && profile && !profile.onboarding_completed) {
        const url = request.nextUrl.clone();
        url.pathname = "/onboarding";
        return NextResponse.redirect(url);
      }

      // オンボーディング完了済みをCookieにキャッシュ（24時間）
      if (profile?.onboarding_completed && !onboardingCached) {
        supabaseResponse.cookies.set("onboarding_completed", "1", {
          path: "/",
          maxAge: 86400,
          httpOnly: true,
          sameSite: "lax",
        });
      }

      // displayNameをCookieにキャッシュ（1時間）
      if (profile?.display_name && !displayNameCached) {
        supabaseResponse.cookies.set("display_name", profile.display_name, {
          path: "/",
          maxAge: 3600,
          httpOnly: true,
          sameSite: "lax",
        });
      }
    }
  }

  return supabaseResponse;
}
