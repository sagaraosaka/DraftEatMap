"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppHeader from "@/components/layout/AppHeader";
import { getUser, signOut } from "@/lib/auth";
import { deleteAllStores } from "@/lib/stores";
import type { User } from "@supabase/supabase-js";

function IconUser({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );
}

function IconMoon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
}

function IconTrash({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6M14 11v6"/>
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  );
}

function IconLogOut({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  );
}

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
      await deleteAllStores();
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
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-eat-accent">
            <IconUser className="h-5 w-5 text-white" />
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
              <IconMoon className="h-5 w-5 text-eat-text2" />
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
              <IconTrash className="h-5 w-5 text-eat-red" />
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
              <IconLogOut className="h-5 w-5 text-eat-red" />
              <span className="text-[13px] text-eat-red">ログアウト</span>
            </div>
            <span className="text-xs text-eat-text3">›</span>
          </button>
        </div>

        <p className="text-center font-mono text-[11px] text-eat-text3">
          ver 1.0.0 · 食べイコ
        </p>
      </div>
    </div>
  );
}
