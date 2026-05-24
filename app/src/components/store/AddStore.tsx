"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useMapsLoaded } from "@/components/layout/MapsProvider";
import { addStore, type PlaceData } from "@/lib/stores";
import { PRESET_TAGS } from "@/types/store";

interface AddStoreProps {
  onClose: () => void;
  onSaved: () => void;
  initialQuery?: string;
}

export default function AddStore({ onClose, onSaved, initialQuery }: AddStoreProps) {
  const isLoaded = useMapsLoaded();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 280);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
        onClick={handleClose}
      />
      <div
        className={`relative z-10 flex max-h-[90svh] flex-col rounded-t-2xl bg-eat-bg shadow-xl transition-transform duration-300 ease-out ${visible ? "translate-y-0" : "translate-y-full"}`}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-eat-border" />
        </div>
        {isLoaded ? (
          <AddStoreForm onClose={handleClose} onSaved={onSaved} initialQuery={initialQuery} />
        ) : (
          <div className="flex h-32 items-center justify-center">
            <p className="text-sm text-eat-text3">読み込み中...</p>
          </div>
        )}
      </div>
    </div>
  );
}

interface Suggestion {
  placeId: string;
  mainText: string;
  secondaryText: string;
}

export function AddStoreForm({ onClose, onSaved, initialQuery }: { onClose: () => void; onSaved: () => void; initialQuery?: string }) {
  const [selected, setSelected] = useState<PlaceData | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [memo, setMemo] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState(initialQuery ?? "");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchSuggestions = useCallback(async (input: string) => {
    if (!input.trim()) { setSuggestions([]); return; }
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { AutocompleteSuggestion } = await (google.maps as any).importLibrary("places");
      const { suggestions: raw } = await AutocompleteSuggestion.fetchAutocompleteSuggestions({
        input,
        language: "ja",
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setSuggestions(raw.map((s: any) => ({
        placeId: s.placePrediction.placeId,
        mainText: s.placePrediction.mainText?.text ?? s.placePrediction.text?.text ?? "",
        secondaryText: s.placePrediction.secondaryText?.text ?? "",
      })));
    } catch {
      setSuggestions([]);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(query), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, fetchSuggestions]);

  const handleSelect = async (s: Suggestion) => {
    setQuery(s.mainText);
    setSuggestions([]);
    setError(null);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { Place } = await (google.maps as any).importLibrary("places");
      const place = new Place({ id: s.placeId });
      await place.fetchFields({ fields: ["displayName", "formattedAddress", "location"] });
      setSelected({
        name: place.displayName ?? s.mainText,
        address: place.formattedAddress ?? s.secondaryText,
        lat: place.location?.lat() ?? 0,
        lng: place.location?.lng() ?? 0,
        place_id: s.placeId,
      });
    } catch {
      setError("店舗情報の取得に失敗しました");
    }
  };

  const toggleTag = (tag: string) =>
    setTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    setError(null);
    try {
      await addStore(selected, tags, memo);
      onSaved();
    } catch (e) {
      setError((e as Error).message);
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden pb-safe">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pb-3">
        <h2 className="text-[15px] font-semibold text-eat-text">
          {selected ? "タグ・メモを追加" : "店舗を検索"}
        </h2>
        <button
          onClick={selected ? () => { setSelected(null); setQuery(""); setTags([]); setMemo(""); } : onClose}
          className="text-[13px] text-eat-text3"
        >
          {selected ? "← 戻る" : "キャンセル"}
        </button>
      </div>

      {!selected ? (
        /* ── Search step ── */
        <div className="flex flex-col overflow-hidden">
          <div className="mx-4 mb-3 flex items-center gap-2 rounded-lg border border-eat-border bg-eat-surface px-3 py-2.5">
            <span className="text-sm text-eat-text3">🔍</span>
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="店名・エリアで検索..."
              className="flex-1 bg-transparent text-[13px] text-eat-text placeholder:text-eat-text3 outline-none"
            />
            {query && (
              <button onClick={() => { setQuery(""); setSuggestions([]); }} className="text-xs text-eat-text3">✕</button>
            )}
          </div>

          <div className="overflow-y-auto">
            {suggestions.map((s) => (
              <button
                key={s.placeId}
                onClick={() => handleSelect(s)}
                className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-eat-surface"
              >
                <span className="mt-0.5 shrink-0 text-base text-eat-text3">📍</span>
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium text-eat-text">{s.mainText}</p>
                  <p className="truncate text-[11px] text-eat-text3">{s.secondaryText}</p>
                </div>
              </button>
            ))}
            {query && suggestions.length === 0 && (
              <p className="px-4 py-6 text-center text-sm text-eat-text3">候補がありません</p>
            )}
          </div>
        </div>
      ) : (
        /* ── Details step ── */
        <div className="flex flex-1 flex-col overflow-y-auto px-4 gap-4 pb-4">
          <div className="rounded-xl border border-eat-border bg-eat-surface p-3">
            <p className="text-[14px] font-semibold text-eat-text">{selected.name}</p>
            <p className="mt-0.5 text-[11px] text-eat-text3">{selected.address}</p>
          </div>

          <div>
            <p className="mb-2 text-[12px] font-medium text-eat-text2">タグ</p>
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

          <div>
            <p className="mb-2 text-[12px] font-medium text-eat-text2">メモ</p>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="気になる点・おすすめメニューなど..."
              rows={3}
              className="w-full rounded-lg border border-eat-border bg-eat-surface px-3 py-2.5 text-[13px] text-eat-text placeholder:text-eat-text3 outline-none resize-none focus:border-eat-accent"
            />
          </div>

          {error && <p className="text-[12px] text-eat-red">{error}</p>}

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full rounded-xl bg-eat-text py-3 text-[14px] font-semibold text-eat-bg transition-opacity disabled:opacity-50"
          >
            {saving ? "保存中..." : "保存する"}
          </button>
        </div>
      )}
    </div>
  );
}
