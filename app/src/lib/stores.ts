import { createClient } from "./supabase";
import type { Store, StoreStatus } from "@/types/store";

export interface PlaceData {
  name: string;
  address: string;
  lat: number;
  lng: number;
  place_id: string;
}

export async function addStore(
  place: PlaceData,
  tags: string[],
  memo: string
): Promise<Store> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("ログインが必要です");

  const payload = {
    user_id: user.id,
    name: place.name,
    address: place.address,
    lat: place.lat,
    lng: place.lng,
    place_id: place.place_id,
    status: "unvisited" as StoreStatus,
    tags,
    memo: memo || null,
    rating: null,
    photo_url: null,
    price_range: null,
    tabelog_url: null,
    visited_at: null,
  };

  const { data, error } = await supabase.from("stores").insert(payload).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function getStores(): Promise<Store[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("stores")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function updateStoreStatus(id: string, status: StoreStatus) {
  const supabase = createClient();
  const { error } = await supabase
    .from("stores")
    .update({ status, visited_at: status === "visited" ? new Date().toISOString() : null })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function updateStore(id: string, patch: { tags: string[]; memo: string }) {
  const supabase = createClient();
  const { error } = await supabase
    .from("stores")
    .update({ tags: patch.tags, memo: patch.memo || null })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteStore(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("stores").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
