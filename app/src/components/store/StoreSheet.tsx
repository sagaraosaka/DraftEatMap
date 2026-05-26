"use client";

import { useState, useEffect } from "react";
import Badge from "@/components/ui/Badge";
import Toast from "@/components/ui/Toast";
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

function localDateStr(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function isoToDateInput(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function StarSelector({
  value,
  onChange,
  disabled,
}: {
  value: number | null;
  onChange: (v: number | null) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={disabled}
          onClick={() => onChange(value === n ? null : n)}
          className={`text-2xl transition-opacity disabled:opacity-40 ${
            n <= (value ?? 0) ? "text-eat-accent" : "text-eat-border"
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function StoreSheet({ store, onClose, onUpdated, onDeleted }: StoreSheetProps) {
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [savingInline, setSavingInline] = useState(false);
  const [current, setCurrent] = useState(store);
  const [editing, setEditing] = useState(false);
  const [editTags, setEditTags] = useState<string[]>(store.tags);
  const [memoValue, setMemoValue] = useState(store.memo ?? "");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const handleShare = async () => {
    const url = `${window.location.origin}/s/${current.id}`;
    if (navigator.share) {
      await navigator.share({ title: current.name, text: current.address, url }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(url);
      setToast("リンクをコピーしました");
    }
  };

  const closeSheet = (callback?: () => void) => {
    setVisible(false);
    setTimeout(() => (callback ?? onClose)(), 280);
  };

  const handleInlineUpdate = async (
    patch: Partial<Pick<Store, "rating" | "visited_at" | "memo">>
  ) => {
    setSavingInline(true);
    const next = { ...current, ...patch };
    try {
      await updateStore(current.id, {
        tags: next.tags,
        memo: next.memo ?? "",
        rating: next.rating,
        visited_at: next.visited_at,
      });
      setCurrent(next);
      setToast("保存しました ✓");
      onUpdated();
    } finally {
      setSavingInline(false);
    }
  };

  const handleMemoBlur = () => {
    const trimmed = memoValue.trim();
    if (trimmed !== (current.memo ?? "")) {
      handleInlineUpdate({ memo: trimmed || null });
    }
  };

  const handleToggleStatus = async () => {
    const nextStatus = current.status === "visited" ? "unvisited" : "visited";
    setBusy(true);
    try {
      await updateStoreStatus(current.id, nextStatus);
      const visited_at = nextStatus === "visited" ? new Date().toISOString() : null;
      setCurrent((s) => ({ ...s, status: nextStatus, visited_at }));
      onUpdated();
    } finally {
      setBusy(false);
    }
  };

  const handleSaveEdit = async () => {
    setBusy(true);
    try {
      await updateStore(current.id, {
        tags: editTags,
        memo: current.memo ?? "",
        rating: current.rating,
        visited_at: current.visited_at,
      });
      setCurrent((s) => ({ ...s, tags: editTags }));
      onUpdated();
      setEditing(false);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    setBusy(true);
    try {
      await deleteStore(current.id);
      closeSheet(onDeleted);
    } catch {
      setBusy(false);
      setConfirmDelete(false);
    }
  };

  const toggleEditTag = (tag: string) =>
    setEditTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
        onClick={editing ? undefined : () => closeSheet()}
      />
      <div
        className={`relative z-10 flex max-h-[85svh] flex-col rounded-t-2xl bg-eat-bg shadow-xl transition-transform duration-300 ease-out ${visible ? "translate-y-0" : "translate-y-full"}`}
      >
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
                  onClick={handleShare}
                  className="flex items-center justify-center rounded-lg border border-eat-border p-1.5 text-eat-text2"
                  aria-label="シェア"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                    <polyline points="16 6 12 2 8 6"/>
                    <line x1="12" y1="2" x2="12" y2="15"/>
                  </svg>
                </button>
                <button
                  onClick={() => { setEditing(true); setEditTags(current.tags); }}
                  className="text-[12px] text-eat-text2 border border-eat-border rounded-lg px-2.5 py-1"
                >
                  編集
                </button>
                <Badge status={current.status} />
              </div>
            )}
          </div>

          {editing ? (
            /* ── 編集モード: タグのみ ── */
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
              {/* 星評価: 即時保存 */}
              <StarSelector
                value={current.rating}
                onChange={(rating) => handleInlineUpdate({ rating })}
                disabled={savingInline}
              />

              {/* タグ */}
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

              {/* メモ: インライン編集、blur時に自動保存 */}
              <div className="rounded-xl border border-eat-border bg-eat-surface px-3 py-2.5 focus-within:border-eat-accent transition-colors">
                <p className="text-[11px] font-medium text-eat-text2 mb-1">メモ</p>
                <textarea
                  value={memoValue}
                  onChange={(e) => setMemoValue(e.target.value)}
                  onBlur={handleMemoBlur}
                  placeholder="気になる点・おすすめメニューなど..."
                  rows={3}
                  className="w-full bg-transparent text-[13px] text-eat-text placeholder:text-eat-text3 outline-none resize-none"
                />
              </div>

              {/* 訪問日: 常に表示、即時保存 */}
              <div>
                <p className="mb-2 text-[12px] font-medium text-eat-text2">
                  📅 訪問日{current.visited_at ? `：${formatDate(current.visited_at)}` : ""}
                </p>
                <div className="flex gap-2 mb-2">
                  {[
                    { label: "今日", offset: 0 },
                    { label: "昨日", offset: -1 },
                  ].map(({ label, offset }) => {
                    const val = localDateStr(offset);
                    const isActive = current.visited_at
                      ? isoToDateInput(current.visited_at) === val
                      : offset === 0;
                    return (
                      <button
                        key={label}
                        type="button"
                        disabled={savingInline}
                        onClick={() => handleInlineUpdate({ visited_at: new Date(val).toISOString() })}
                        className={`rounded-full border px-3 py-1 text-[12px] transition-colors disabled:opacity-40 ${
                          isActive
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
                  value={isoToDateInput(current.visited_at) || localDateStr(0)}
                  disabled={savingInline}
                  onChange={(e) =>
                    e.target.value &&
                    handleInlineUpdate({ visited_at: new Date(e.target.value).toISOString() })
                  }
                  className="w-full rounded-lg border border-eat-border bg-eat-surface px-3 py-2.5 text-[13px] text-eat-text outline-none focus:border-eat-accent disabled:opacity-40"
                />
              </div>

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

                {confirmDelete ? (
                  <div className="rounded-xl border border-eat-red/30 bg-eat-red/5 px-4 py-3">
                    <p className="text-[13px] font-medium text-eat-text mb-3">
                      「{current.name}」を削除しますか？
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setConfirmDelete(false)}
                        disabled={busy}
                        className="flex-1 rounded-xl border border-eat-border py-2.5 text-[13px] text-eat-text2 disabled:opacity-50"
                      >
                        キャンセル
                      </button>
                      <button
                        onClick={handleDelete}
                        disabled={busy}
                        className="flex-1 rounded-xl bg-eat-red py-2.5 text-[13px] font-semibold text-white disabled:opacity-50"
                      >
                        {busy ? "削除中..." : "削除する"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    disabled={busy}
                    className="w-full rounded-xl border border-eat-red/30 bg-eat-red/5 py-3 text-[14px] font-semibold text-eat-red transition-opacity disabled:opacity-50"
                  >
                    削除
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  );
}
