"use client";

import { useEffect, useMemo, useState } from "react";
import AppHeader from "@/components/layout/AppHeader";

function extractArea(address: string): string {
  const m = address.match(/([^\s都道府県]+[市区町村])/);
  return m ? m[1] : "";
}
import FilterChips, { type FilterValue } from "@/components/list/FilterChips";
import Chip from "@/components/ui/Chip";
import StoreRow from "@/components/list/StoreRow";
import AddStore from "@/components/store/AddStore";
import StoreSheet from "@/components/store/StoreSheet";
import { getStores } from "@/lib/stores";
import type { Store } from "@/types/store";

export default function ListPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterValue>("all");
  const [areaFilter, setAreaFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);

  function loadStores() {
    getStores()
      .then(setStores)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadStores();
  }, []);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    stores.forEach((s) => s.tags.forEach((t) => set.add(t)));
    return [...set];
  }, [stores]);

  const areas = useMemo(() => {
    const set = new Set<string>();
    stores.forEach((s) => {
      const a = extractArea(s.address);
      if (a) set.add(a);
    });
    return [...set];
  }, [stores]);

  const filtered = useMemo(() => {
    return stores.filter((s) => {
      if (areaFilter !== "all" && extractArea(s.address) !== areaFilter) return false;
      if (filter === "unvisited" && s.status !== "unvisited") return false;
      if (filter === "visited"   && s.status !== "visited")   return false;
      if (filter !== "all" && filter !== "unvisited" && filter !== "visited") {
        if (!s.tags.includes(filter)) return false;
      }
      if (query && !s.name.includes(query) && !s.address.includes(query)) return false;
      return true;
    });
  }, [stores, filter, areaFilter, query]);

  return (
    <>
    <div className="flex h-full flex-col bg-eat-bg">
      <AppHeader
        right={
          <button
            onClick={() => setShowAdd(true)}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-eat-text text-sm font-bold text-eat-bg"
          >
            ＋
          </button>
        }
      />

      {/* 検索バー */}
      <div className="mx-4 mb-2 flex h-9 items-center gap-2 rounded-lg border border-eat-border bg-eat-surface px-3">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0 text-eat-text3">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="保存済みを検索..."
          className="flex-1 bg-transparent text-[13px] text-eat-text placeholder:text-eat-text3 outline-none"
        />
        {query && (
          <button onClick={() => setQuery("")} className="text-xs text-eat-text3">✕</button>
        )}
      </div>

      {/* フィルターチップ */}
      <FilterChips active={filter} tags={allTags} onChange={setFilter} />

      {/* エリアフィルター */}
      {areas.length >= 2 && (
        <div className="flex gap-1.5 overflow-x-auto px-4 pb-2 scrollbar-none">
          <Chip
            label="全エリア"
            active={areaFilter === "all"}
            onClick={() => setAreaFilter("all")}
          />
          {areas.map((area) => (
            <Chip
              key={area}
              label={area}
              active={areaFilter === area}
              onClick={() => setAreaFilter(area)}
            />
          ))}
        </div>
      )}

      {/* リスト */}
      <div className="flex-1 overflow-y-auto px-2">
        {error ? (
          <div className="flex h-32 items-center justify-center">
            <p className="text-sm text-eat-red">{error}</p>
          </div>
        ) : loading ? (
          <div className="flex h-32 items-center justify-center">
            <svg className="h-5 w-5 animate-spin text-eat-text3" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25"/>
              <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-eat-text3">
              <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/>
              <path d="M7 2v20"/>
              <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/>
            </svg>
            <p className="text-sm text-eat-text3">
              {stores.length === 0 ? "まだ保存した店舗がありません" : "該当する店舗がありません"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-eat-border">
            {filtered.map((store) => (
              <StoreRow
                key={store.id}
                store={store}
                onClick={setSelectedStore}
              />
            ))}
          </div>
        )}
      </div>

    </div>

    {showAdd && (
      <AddStore
        onClose={() => setShowAdd(false)}
        onSaved={() => {
          setShowAdd(false);
          setLoading(true);
          loadStores();
        }}
      />
    )}

    {selectedStore && (
      <StoreSheet
        store={selectedStore}
        onClose={() => setSelectedStore(null)}
        onUpdated={(updated) => {
          setStores((prev) => prev.map((s) => s.id === updated.id ? updated : s));
          setSelectedStore(updated);
        }}
        onDeleted={() => {
          setSelectedStore(null);
          loadStores();
        }}
      />
    )}
    </>
  );
}
