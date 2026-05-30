import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code       = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type       = searchParams.get("type") as "email" | "magiclink" | null;

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  if (token_hash && type) {
    // マジックリンク・メール確認フロー
    await supabase.auth.verifyOtp({ token_hash, type });
  } else if (code) {
    // OAuth PKCE フロー（将来のGoogle Auth用）
    await supabase.auth.exchangeCodeForSession(code);
  }

  const returnTo = request.cookies.get("auth_return_to")?.value;
  const dest = returnTo && returnTo.startsWith("/") ? decodeURIComponent(returnTo) : "/map";

  const response = NextResponse.redirect(`${origin}${dest}`);
  response.cookies.delete("auth_return_to");
  return response;
}
