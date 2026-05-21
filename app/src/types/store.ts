export type StoreStatus = "unvisited" | "visited";

export interface Store {
  id: string;
  user_id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  place_id: string;
  status: StoreStatus;
  rating: number | null;
  memo: string | null;
  tags: string[];
  photo_url: string | null;
  price_range: string | null;
  tabelog_url: string | null;
  visited_at: string | null;
  created_at: string;
}

export const PRESET_TAGS = [
  "ラーメン",
  "寿司",
  "焼肉",
  "カフェ",
  "居酒屋",
  "イタリアン",
  "中華",
  "デート向け",
  "一人飯",
  "ランチ",
] as const;
