import Badge from "@/components/ui/Badge";
import type { Store } from "@/types/store";

const EMOJI: Record<string, string> = {
  ラーメン: "🍜", 寿司: "🍣", 焼肉: "🥩", カフェ: "☕",
  居酒屋: "🍶", イタリアン: "🍕", 中華: "🥟", デート向け: "🌹",
  一人飯: "🍱", ランチ: "🌞",
};

function storeEmoji(store: Store) {
  for (const tag of store.tags) {
    if (EMOJI[tag]) return EMOJI[tag];
  }
  return "🍽️";
}

function stars(rating: number | null) {
  if (!rating) return null;
  return "★".repeat(rating) + "☆".repeat(5 - rating);
}

interface StoreRowProps {
  store: Store;
  onClick: (store: Store) => void;
}

export default function StoreRow({ store, onClick }: StoreRowProps) {
  return (
    <button
      onClick={() => onClick(store)}
      className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2.5 text-left transition-colors hover:bg-eat-surface"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-eat-border bg-eat-surface text-lg">
        {storeEmoji(store)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold text-eat-text">
          {store.name}
        </p>
        <p className="mt-0.5 text-[11px] text-eat-text3">
          {store.address.split("、")[0]}
          {store.tags[0] && ` · ${store.tags[0]}`}
          {store.rating && (
            <span className="ml-1 text-eat-accent">{stars(store.rating)}</span>
          )}
        </p>
      </div>
      <Badge status={store.status} />
    </button>
  );
}
