"use client";

import { useState } from "react";
import Badge from "@/components/ui/Badge";
import { updateStoreStatus, updateStore, deleteStore } from "@/lib/stores";
import { PRESET_TAGS } from "@/types/store";
import type { Store } from "@/types/store";

interface StoreSheetProps {
  store: Store;
  onClose: () => void;
  onUpdated: () => void;
  onDeleted: () => void;
}

export default function StoreSheet({ store, onClose, onUpdated, onDeleted }: StoreSheetProps) {
  const [busy, setBusy] = useState(false);
  const [current, setCurrent] = useState(store);
  const [editing, setEditing] = useState(false);
  const [editTags, setEditTags] = useState<string[]>(store.tags);
  const [editMemo, setEditMemo] = useState(store.memo ?? "");

  const handleToggleStatus = async () => {
    const next = current.status === "visited" ? "unvisited" : "visited";
    setBusy(true);
    try {
      await updateStoreStatus(current.id, next);
      setCurrent((s) => ({ ...s, status: next }));
      onUpdated();
    } finally {
      setBusy(false);
    }
  };

  const handleSaveEdit = async () => {
    setBusy(true);
    try {
      await updateStore(current.id, { tags: editTags, memo: editMemo });
      setCurrent((s) => ({ ...s, tags: editTags, memo: editMemo || null }));
      onUpdated();
      setEditing(false);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    const ok = window.confirm(`「${current.name}」を削除しますか？`);
    if (!ok) return;
    setBusy(true);
    try {
      await deleteStore(current.id);
      onDeleted();
    } finally {
      setBusy(false);
    }
  };

  const toggleEditTag = (tag: string) =>
    setEditTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={editing ? undefined : onClose} />
      <div className="relative z-10 flex max-h-[85svh] flex-col rounded-t-2xl bg-eat-bg shadow-xl">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="h-1 w-10 rounded-full bg-eat-border" />
        </div>

        <div className="flex flex-col overflow-y-auto px-4 pb-6 gap-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h2 className="text-[16px] font-semibold text-eat-text leading-tight">{current.name}</h2>
              <p className="mt-0.5 text-[12px] text-eat-text3">{current.address}</p>
            </div>
            {!editing && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => { setEditing(true); setEditTags(current.tags); setEditMemo(current.memo ?? ""); }}
                  className="text-[12px] text-eat-text2 border border-eat-border rounded-lg px-2.5 py-1"
                >
                  編集
                </button>
                <Badge status={current.status} />
              </div>
            )}
          </div>

          {editing ? (
            /* ── 編集モード ── */
            <>
              <div>
                <p className="mb-2 text-[12px] font-medium text-eat-text2">タグ</p>
                <div className="flex flex-wrap gap-2">
                  {PRESET_TAGS.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleEditTag(tag)}
                      className={`rounded-full border px-3 py-1 text-[12px] transition-colors ${
                        editTags.includes(tag)
                          ? "border-eat-accent bg-eat-accent/10 text-eat-accent"
                          : "border-eat-border bg-eat-surface text-eat-text2"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-[12px] font-medium text-eat-text2">メモ</p>
                <textarea
                  value={editMemo}
                  onChange={(e) => setEditMemo(e.target.value)}
                  placeholder="気になる点・おすすめメニューなど..."
                  rows={3}
                  className="w-full rounded-lg border border-eat-border bg-eat-surface px-3 py-2.5 text-[13px] text-eat-text placeholder:text-eat-text3 outline-none resize-none focus:border-eat-accent"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(false)}
                  className="flex-1 rounded-xl border border-eat-border py-3 text-[14px] text-eat-text2"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={busy}
                  className="flex-1 rounded-xl bg-eat-text py-3 text-[14px] font-semibold text-eat-bg disabled:opacity-50"
                >
                  {busy ? "保存中..." : "保存"}
                </button>
              </div>
            </>
          ) : (
            /* ── 表示モード ── */
            <>
              {current.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {current.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-eat-border bg-eat-surface px-2.5 py-0.5 text-[11px] text-eat-text2"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {current.memo && (
                <div className="rounded-xl border border-eat-border bg-eat-surface px-3 py-2.5">
                  <p className="text-[11px] font-medium text-eat-text2 mb-1">メモ</p>
                  <p className="text-[13px] text-eat-text whitespace-pre-wrap">{current.memo}</p>
                </div>
              )}

              <div className="flex flex-col gap-2 mt-1">
                <button
                  onClick={handleToggleStatus}
                  disabled={busy}
                  className={`w-full rounded-xl py-3 text-[14px] font-semibold transition-opacity disabled:opacity-50 ${
                    current.status === "visited"
                      ? "bg-eat-surface border border-eat-border text-eat-text2"
                      : "bg-eat-green text-white"
                  }`}
                >
                  {current.status === "visited" ? "未訪問に戻す" : "✓ 行った！"}
                </button>

                <button
                  onClick={handleDelete}
                  disabled={busy}
                  className="w-full rounded-xl border border-eat-red/30 bg-eat-red/5 py-3 text-[14px] font-semibold text-eat-red transition-opacity disabled:opacity-50"
                >
                  削除
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
