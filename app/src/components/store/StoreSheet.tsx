"use client";

import { useState } from "react";
import Badge from "@/components/ui/Badge";
import { updateStoreStatus, deleteStore } from "@/lib/stores";
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

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 flex max-h-[80svh] flex-col rounded-t-2xl bg-eat-bg shadow-xl">
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
            <Badge status={current.status} />
          </div>

          {/* Tags */}
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

          {/* Memo */}
          {current.memo && (
            <div className="rounded-xl border border-eat-border bg-eat-surface px-3 py-2.5">
              <p className="text-[11px] font-medium text-eat-text2 mb-1">メモ</p>
              <p className="text-[13px] text-eat-text whitespace-pre-wrap">{current.memo}</p>
            </div>
          )}

          {/* Actions */}
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
        </div>
      </div>
    </div>
  );
}
