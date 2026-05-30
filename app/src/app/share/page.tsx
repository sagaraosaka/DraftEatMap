"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import MapsProvider from "@/components/layout/MapsProvider";
import { useMapsLoaded } from "@/components/layout/MapsProvider";
import { AddStoreForm } from "@/components/store/AddStore";
import { getPublicStore, addStore, DuplicateStoreError } from "@/lib/stores";
import { PRESET_TAGS } from "@/types/store";
import type { PublicStore } from "@/lib/stores";
import type { Store } from "@/types/store";

function QuickAdd({ storeId }: { storeId: string }) {
  const router = useRouter();
  const [store, setStore] = useState<PublicStore | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [duplicate, setDuplicate] = useState<Store | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    getPublicStore(storeId)
      .then((s) => { setStore(s); if (s) setTags(s.tags); })
      .catch(() => setStore(null))
      .finally(() => setLoading(false));
  }, [storeId]);

  const toggleTag = (tag: string) =>
    setTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);

  const handleSave = async () => {
    if (!store) return;
    setSaving(true);
    try {
      await addStore({ name: store.name, address: store.address, lat: store.lat, lng: store.lng, place_id: store.place_id }, tags, "");
      setSaved(true);
    } catch (e) {
      if (e instanceof DuplicateStoreError) {
        setDuplicate(e.existing);
        setSaving(false);
      } else if ((e as Error).message === "ログインが必要です") {
        router.push("/login");
      } else {
        setError((e as Error).message);
        setSaving(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <svg className="h-5 w-5 animate-spin text-eat-text3" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25"/>
          <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
        <p className="text-[15px] font-semibold text-eat-text">お店が見つかりません</p>
        <p className="text-[13px] text-eat-text3">このリンクは無効か、削除されました</p>
      </div>
    );
  }

  if (duplicate) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-eat-accent/10">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-eat-accent">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </div>
        <div>
          <p className="text-[16px] font-bold text-eat-text">すでにリストにあります</p>
          <p className="mt-1 text-[13px] text-eat-text3">{duplicate.name}</p>
        </div>
        <button
          onClick={() => router.push("/map")}
          className="mt-2 w-full max-w-xs rounded-xl bg-eat-text py-3 text-[14px] font-semibold text-eat-bg"
        >
          マップで確認
        </button>
      </div>
    );
  }

  if (saved) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-eat-green/10">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-eat-green">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <div>
          <p className="text-[16px] font-bold text-eat-text">リストに追加しました</p>
          <p className="mt-1 text-[13px] text-eat-text3">{store.name}</p>
        </div>
        <button
          onClick={() => router.push("/map")}
          className="mt-2 w-full max-w-xs rounded-xl bg-eat-text py-3 text-[14px] font-semibold text-eat-bg"
        >
          マップで確認
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-4 pb-8 gap-4">
      {/* Store preview */}
      <div className="rounded-xl border border-eat-border bg-eat-surface p-4">
        <p className="text-[15px] font-bold text-eat-text">{store.name}</p>
        <p className="mt-0.5 text-[12px] text-eat-text3">{store.address}</p>
        {store.rating && (
          <div className="mt-2 flex gap-0.5">
            {[1,2,3,4,5].map((n) => (
              <span key={n} className={`text-base ${n <= store.rating! ? "text-eat-accent" : "text-eat-border"}`}>★</span>
            ))}
          </div>
        )}
      </div>

      {/* Tags */}
      <div>
        <p className="mb-2 text-[12px] font-medium text-eat-text2">タグ（変更できます）</p>
        <div className="flex flex-wrap gap-2">
          {PRESET_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`rounded-full border px-3 py-1 text-[12px] transition-colors ${
                tags.includes(tag)
                  ? "border-eat-accent bg-eat-accent/10 text-eat-accent"
                  : "border-eat-border bg-eat-surface text-eat-text2"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-[12px] text-eat-red">{error}</p>}

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full rounded-xl bg-eat-text py-3 text-[14px] font-semibold text-eat-bg disabled:opacity-50"
      >
        {saving ? "保存中..." : "自分のリストに追加"}
      </button>
    </div>
  );
}

function ShareContent() {
  const params = useSearchParams();
  const router = useRouter();
  const storeId = params.get("store_id");
  const title = params.get("title") ?? "";
  const text = params.get("text") ?? "";
  const url = params.get("url") ?? "";
  // 外部アプリはtitleより url に情報を入れることが多いため url からも店名候補を抽出
  const queryFromUrl = url.match(/maps\.google\.[^/]+\/maps\/place\/([^/@?]+)/)?.[1]?.replace(/\+/g, " ") ?? "";
  const initialQuery = title || text.replace(/https?:\/\/\S+/g, "").trim() || queryFromUrl || url;
  const isLoaded = useMapsLoaded();

  return (
    <div className="flex h-full flex-col bg-eat-bg">
      <div className="flex items-center gap-2 border-b border-eat-border px-4 py-3 pt-safe">
        <button onClick={() => router.push("/map")} className="text-[13px] text-eat-text3">✕</button>
        <p className="text-[14px] font-semibold text-eat-text">リストに追加</p>
      </div>

      {storeId ? (
        <QuickAdd storeId={storeId} />
      ) : !isLoaded ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-eat-text3">読み込み中...</p>
        </div>
      ) : (
        <AddStoreForm
          initialQuery={initialQuery}
          onClose={() => router.push("/map")}
          onSaved={() => router.push("/map")}
        />
      )}
    </div>
  );
}

export default function SharePage() {
  return (
    <MapsProvider>
      <Suspense
        fallback={
          <div className="flex h-full items-center justify-center bg-eat-bg">
            <p className="text-sm text-eat-text3">読み込み中...</p>
          </div>
        }
      >
        <ShareContent />
      </Suspense>
    </MapsProvider>
  );
}
