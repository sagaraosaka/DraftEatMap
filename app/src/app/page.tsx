import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import Link from "next/link";

export default async function Home() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/map");

  return (
    <main className="flex min-h-svh flex-col items-center justify-center px-8 bg-eat-bg">
      <div className="w-full max-w-sm flex flex-col items-center">

        {/* ロゴ */}
        <div className="mb-10 text-center">
          <div className="mb-3 flex justify-center">
            <span className="inline-block h-3 w-3 rounded-full bg-eat-accent" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-eat-text">
            食べイコ
          </h1>
          <p className="mt-2 text-[15px] font-medium text-eat-text2">
            行きたいお店を地図に残そう
          </p>
        </div>

        {/* 特徴 */}
        <div className="w-full flex flex-col gap-3 mb-10">
          {[
            { icon: "📍", title: "地図で一目確認", desc: "保存したお店をマップ上に表示" },
            { icon: "★", title: "評価・メモで記録", desc: "星評価とメモで訪問後の感想を残せる" },
            { icon: "🔗", title: "友達にシェア", desc: "気になるお店のリンクを送れる" },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="flex items-start gap-3 rounded-xl border border-eat-border bg-eat-surface px-4 py-3">
              <span className="text-xl leading-none mt-0.5">{icon}</span>
              <div>
                <p className="text-[13px] font-semibold text-eat-text">{title}</p>
                <p className="text-[12px] text-eat-text3 mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Link
          href="/login"
          className="w-full h-11 rounded-lg bg-eat-text flex items-center justify-center text-sm font-semibold text-eat-bg transition-opacity hover:opacity-85"
        >
          はじめる
        </Link>
      </div>
    </main>
  );
}
