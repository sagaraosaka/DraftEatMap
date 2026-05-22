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

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

function toDateInput(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function StarSelector({ value, onChange }: { value: number | null; onChange: (v: number | null) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(value === n ? null : n)}
          className={`text-2xl transition-opacity ${n <= (value ?? 0) ? "opacity-100" : "opacity-25"}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function StoreSheet({ store, onClose, onUpdated, onDeleted }: StoreSheetProps) {
  const [busy, setBusy] = useState(false);
  const [current, setCurrent] = useState(store);
  const [editing, setEditing] = useState(false);
  const [editTags, setEditTags] = useState<string[]>(store.tags);
  const [editMemo, setEditMemo] = useState(store.memo ?? "");
  const [editRating, setEditRating] = useState<number | null>(store.rating);
  const [editVisitedAt, setEditVisitedAt] = useState(toDateInput(store.visited_at));

  const handleToggleStatus = async () => {
    const next = current.status === "visited" ? "unvisited" : "visited";
    setBusy(true);
    try {
      await updateStoreStatus(current.id, next);
      const now = next === "visited" ? new Date().toISOString() : null;
      setCurrent((s) => ({ ...s, status: next, visited_at: now }));
      onUpdated();
    } finally {
      setBusy(false);
    }
  };

  const handleSaveEdit = async () => {
    setBusy(true);
    const visitedAt = editVisitedAt ? new Date(editVisitedAt).toISOString() : null;
    try {
      await updateStore(current.id, {
        tags: editTags,
        memo: editMemo,
        rating: editRating,
        visited_at: visitedAt,
      });
      setCurrent((s) => ({
        ...s,
        tags: editTags,
        memo: editMemo || null,
        rating: editRating,
        visited_at: visitedAt,
      }));
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
                  onClick={() => {
                    setEditing(true);
                    setEditTags(current.tags);
                    setEditMemo(current.memo ?? "");
                    setEditRating(current.rating);
                    setEditVisitedAt(toDateInput(current.visited_at));
                  }}
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
                <p className="mb-2 text-[12px] font-medium text-eat-text2">評価</p>
                <StarSelector value={editRating} onChange={setEditRating} />
              </div>

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

              <div>
                <p className="mb-2 text-[12px] font-medium text-eat-text2">訪問日</p>
                <div className="flex gap-2 mb-2">
                  {[
                    { label: "今日", offset: 0 },
                    { label: "昨日", offset: -1 },
                  ].map(({ label, offset }) => {
                    const d = new Date();
                    d.setDate(d.getDate() + offset);
                    const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => setEditVisitedAt(val)}
                        className={`rounded-full border px-3 py-1 text-[12px] transition-colors ${
                          editVisitedAt === val
                            ? "border-eat-accent bg-eat-accent/10 text-eat-accent"
                            : "border-eat-border bg-eat-surface text-eat-text2"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
                <input
                  type="date"
                  value={editVisitedAt}
                  onChange={(e) => setEditVisitedAt(e.target.value)}
                  className="w-full rounded-lg border border-eat-border bg-eat-surface px-3 py-2.5 text-[13px] text-eat-text outline-none focus:border-eat-accent"
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
              {current.rating && (
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span key={n} className={`text-xl ${n <= current.rating! ? "text-eat-accent" : "text-eat-border"}`}>
                      ★
                    </span>
                  ))}
                </div>
              )}

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

              {current.visited_at && (
                <p className="text-[12px] text-eat-text3">
                  📅 訪問日: {formatDate(current.visited_at)}
                </p>
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
