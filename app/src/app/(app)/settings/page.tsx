"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppHeader from "@/components/layout/AppHeader";
import { getUser, signOut } from "@/lib/auth";
import { getStores, deleteStore } from "@/lib/stores";
import type { User } from "@supabase/supabase-js";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    getUser().then(setUser);
  }, []);

  async function handleSignOut() {
    await signOut();
    router.push("/login");
  }

  async function handleDeleteAll() {
    const confirmed = window.confirm(
      "保存したすべての店舗データを削除します。この操作は取り消せません。\n\n本当に削除しますか？"
    );
    if (!confirmed) return;
    setDeleting(true);
    try {
      const stores = await getStores();
      await Promise.all(stores.map((s) => deleteStore(s.id)));
      alert("すべてのデータを削除しました。");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex h-full flex-col bg-eat-bg">
      <AppHeader title="設定" />

      <div className="flex flex-col gap-3 overflow-y-auto px-4 pb-6">

        {/* プロフィール */}
        <div className="flex items-center gap-3 rounded-xl border border-eat-border bg-eat-surface p-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-eat-accent text-lg">
            👤
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-eat-text">
              {user?.email?.split("@")[0] ?? "—"}
            </p>
            <p className="truncate text-[11px] text-eat-text3">{user?.email ?? "読み込み中..."}</p>
          </div>
        </div>

        {/* ダークモード（Phase 2） */}
        <div className="overflow-hidden rounded-xl border border-eat-border bg-eat-surface">
          <div className="flex items-center justify-between px-3.5 py-3">
            <div className="flex items-center gap-2.5">
              <span className="w-5 text-center text-sm text-eat-text2">🌙</span>
              <span className="text-[13px] text-eat-text">ダークモード</span>
            </div>
            <div className="h-5 w-9 rounded-full bg-eat-accent relative">
              <div className="absolute top-0.5 right-0.5 h-4 w-4 rounded-full bg-white" />
            </div>
          </div>
        </div>

        {/* データ操作 */}
        <div className="overflow-hidden rounded-xl border border-eat-border bg-eat-surface">
          <button
            onClick={handleDeleteAll}
            disabled={deleting}
            className="flex w-full items-center justify-between px-3.5 py-3 transition-colors hover:bg-eat-surface2 disabled:opacity-50"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-5 text-center text-sm text-eat-text2">🗑️</span>
              <div className="text-left">
                <p className="text-[13px] text-eat-text">
                  {deleting ? "削除中..." : "データをすべて削除"}
                </p>
                <p className="text-[11px] text-eat-red">この操作は取り消せません</p>
              </div>
            </div>
            <span className="text-xs text-eat-text3">›</span>
          </button>
        </div>

        {/* ログアウト */}
        <div className="overflow-hidden rounded-xl border border-eat-border bg-eat-surface">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center justify-between px-3.5 py-3 transition-colors hover:bg-eat-surface2"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-5 text-center text-sm">🚪</span>
              <span className="text-[13px] text-eat-red">ログアウト</span>
            </div>
            <span className="text-xs text-eat-text3">›</span>
          </button>
        </div>

        <p className="text-center font-mono text-[11px] text-eat-text3">
          ver 1.0.0 · DraftEatMap
        </p>
      </div>
    </div>
  );
}
