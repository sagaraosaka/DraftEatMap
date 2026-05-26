import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import type { PublicStore } from "@/lib/stores";

const EMOJI: Record<string, string> = {
  ラーメン: "🍜", 寿司: "🍣", 焼肉: "🥩", カフェ: "☕",
  居酒屋: "🍶", イタリアン: "🍕", 中華: "🥟", デート向け: "🌹",
  一人飯: "🍱", ランチ: "🌞",
};

function tagEmoji(tags: string[]) {
  for (const tag of tags) {
    if (EMOJI[tag]) return EMOJI[tag];
  }
  return "🍽️";
}

type Props = { params: Promise<{ id: string }> };

async function fetchStore(id: string): Promise<PublicStore | null> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data, error } = await supabase.rpc("get_public_store", { store_id: id });
  if (error || !data || data.length === 0) return null;
  return data[0] as PublicStore;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const store = await fetchStore(id);
  if (!store) return { title: "食べイコ" };
  const tagsStr = store.tags.join(" · ");
  return {
    title: `${store.name} - 食べイコ`,
    description: tagsStr ? `${store.address} · ${tagsStr}` : store.address,
    openGraph: {
      title: store.name,
      description: store.address,
      siteName: "食べイコ",
      type: "website",
    },
  };
}

export default async function PublicStorePage({ params }: Props) {
  const { id } = await params;
  const store = await fetchStore(id);

  if (!store) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-eat-bg px-6 text-center">
        <p className="text-2xl">🍽️</p>
        <p className="text-[15px] font-semibold text-eat-text">お店が見つかりません</p>
        <p className="text-[13px] text-eat-text3">このリンクは無効か、削除されました</p>
        <Link href="/" className="mt-4 rounded-xl bg-eat-text px-6 py-2.5 text-[13px] font-semibold text-eat-bg">
          食べイコを開く
        </Link>
      </div>
    );
  }

  const mapsUrl = `https://maps.google.com/?q=${store.lat},${store.lng}`;
  const addUrl = `/share?title=${encodeURIComponent(store.name)}`;
  const rating = store.rating;
  const emoji = tagEmoji(store.tags);

  return (
    <div className="flex min-h-screen flex-col bg-eat-bg">
      {/* Header */}
      <header className="flex items-center gap-2 px-4 py-4 pt-safe">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="h-6 w-6 shrink-0">
          <path d="M256 88C188 88 134 142 134 210c0 54 30 100 74 132l48 84 48-84c44-32 74-78 74-132C378 142 324 88 256 88Z" fill="#C8952A"/>
          <line x1="228" y1="152" x2="228" y2="206" stroke="white" strokeWidth="18" strokeLinecap="round"/>
          <line x1="256" y1="152" x2="256" y2="206" stroke="white" strokeWidth="18" strokeLinecap="round"/>
          <line x1="284" y1="152" x2="284" y2="206" stroke="white" strokeWidth="18" strokeLinecap="round"/>
          <path d="M228 206 Q228 228 256 228 Q284 228 284 206" fill="none" stroke="white" strokeWidth="18" strokeLinecap="round"/>
          <line x1="256" y1="228" x2="256" y2="286" stroke="white" strokeWidth="18" strokeLinecap="round"/>
        </svg>
        <span className="text-[14px] font-bold tracking-tight text-eat-text">食べイコ</span>
      </header>

      {/* Card */}
      <main className="flex flex-1 flex-col px-4 pb-8 pt-2">
        <div className="rounded-2xl border border-eat-border bg-white shadow-sm px-5 py-5 flex flex-col gap-4">

          {/* Store identity */}
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-eat-border bg-eat-surface text-2xl">
              {emoji}
            </div>
            <div className="min-w-0">
              <h1 className="text-[17px] font-bold text-eat-text leading-tight">{store.name}</h1>
              <p className="mt-0.5 text-[12px] text-eat-text3 leading-snug">{store.address}</p>
            </div>
          </div>

          {/* Rating */}
          {rating && (
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map((n) => (
                <span key={n} className={`text-xl ${n <= rating ? "text-eat-accent" : "text-eat-border"}`}>★</span>
              ))}
            </div>
          )}

          {/* Tags */}
          {store.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {store.tags.map((tag) => (
                <span key={tag} className="rounded-full border border-eat-border bg-eat-surface px-2.5 py-0.5 text-[12px] text-eat-text2">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-2.5 mt-1">
            <Link
              href={addUrl}
              className="flex items-center justify-center gap-2 w-full rounded-xl bg-eat-text py-3 text-[14px] font-semibold text-eat-bg"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              自分のリストに追加
            </Link>

            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full rounded-xl border border-eat-border bg-eat-surface py-3 text-[14px] font-medium text-eat-text"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                <circle cx="12" cy="9" r="2.5"/>
              </svg>
              Googleマップで開く
            </a>
          </div>
        </div>

        <p className="mt-6 text-center text-[11px] text-eat-text3">
          食べイコ — 行きたいお店を保存・管理するパーソナルマップ
        </p>
      </main>
    </div>
  );
}
