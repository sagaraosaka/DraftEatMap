import { describe, it, expect, vi, beforeEach } from "vitest";
import { addStore, deleteAllStores, getPublicStore, updateStoreStatus, setStorePublic, DuplicateStoreError } from "@/lib/stores";

const mockFrom = vi.fn();
const mockRpc = vi.fn();
const mockGetUser = vi.fn();

vi.mock("@/lib/supabase", () => ({
  createClient: () => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
    rpc: mockRpc,
  }),
}));

const PLACE: Parameters<typeof addStore>[0] = {
  name: "テスト飯店",
  address: "東京都渋谷区1-1-1",
  lat: 35.659,
  lng: 139.700,
  place_id: "place_abc123",
};

const STORE = { ...PLACE, id: "store-id-1", user_id: "user-1", status: "unvisited" as const, tags: [], memo: null, rating: null, photo_url: null, price_range: null, tabelog_url: null, visited_at: null, created_at: new Date().toISOString(), is_public: false, area: null };

function makeChain(result: unknown) {
  const chain: Record<string, unknown> = {};
  const methods = ["select", "insert", "delete", "update", "eq", "single", "maybeSingle"];
  methods.forEach((m) => { chain[m] = vi.fn(() => chain); });
  (chain as { then: unknown }).then = undefined;
  Object.assign(chain, result);
  methods.forEach((m) => {
    (chain[m] as ReturnType<typeof vi.fn>).mockReturnValue(chain);
  });
  return chain;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("addStore", () => {
  it("未認証のときエラーをスロー", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    await expect(addStore(PLACE, [], "")).rejects.toThrow("ログインが必要です");
  });

  it("重複 place_id のとき DuplicateStoreError をスロー", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    const chain = makeChain({ data: STORE, error: null });
    mockFrom.mockReturnValue(chain);
    await expect(addStore(PLACE, [], "")).rejects.toBeInstanceOf(DuplicateStoreError);
  });

  it("正常時は Store を返す", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    // 重複チェック → null（重複なし）
    const checkChain = makeChain({ data: null, error: null });
    // insert → STORE
    const insertChain = makeChain({ data: STORE, error: null });
    mockFrom
      .mockReturnValueOnce(checkChain)
      .mockReturnValueOnce(insertChain);
    const result = await addStore(PLACE, ["ラーメン"], "メモ");
    expect(result).toMatchObject({ name: PLACE.name });
  });
});

describe("deleteAllStores", () => {
  it("未認証のときエラーをスロー", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    await expect(deleteAllStores()).rejects.toThrow("ログインが必要です");
  });

  it("user_id で一括削除クエリを1回だけ実行する", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    const chain = makeChain({ error: null });
    mockFrom.mockReturnValue(chain);
    await deleteAllStores();
    expect(mockFrom).toHaveBeenCalledTimes(1);
    expect(mockFrom).toHaveBeenCalledWith("stores");
  });
});

describe("updateStoreStatus", () => {
  it("visited に更新し visited_at を設定する", async () => {
    const chain = makeChain({ error: null });
    mockFrom.mockReturnValue(chain);
    await updateStoreStatus("store-1", "visited");
    expect(chain.update).toHaveBeenCalledWith(
      expect.objectContaining({ status: "visited", visited_at: expect.any(String) })
    );
  });

  it("unvisited に戻すと visited_at を null にする", async () => {
    const chain = makeChain({ error: null });
    mockFrom.mockReturnValue(chain);
    await updateStoreStatus("store-1", "unvisited");
    expect(chain.update).toHaveBeenCalledWith(
      expect.objectContaining({ status: "unvisited", visited_at: null })
    );
  });
});

describe("setStorePublic", () => {
  it("is_public を true にセットする", async () => {
    const chain = makeChain({ error: null });
    mockFrom.mockReturnValue(chain);
    await setStorePublic("store-1");
    expect(chain.update).toHaveBeenCalledWith({ is_public: true });
    expect(chain.eq).toHaveBeenCalledWith("id", "store-1");
  });
});

describe("getPublicStore", () => {
  it("存在しない ID のとき null を返す", async () => {
    mockRpc.mockResolvedValue({ data: [], error: null });
    const result = await getPublicStore("nonexistent");
    expect(result).toBeNull();
  });

  it("正常時は PublicStore を返す", async () => {
    const pub = { id: "store-1", name: "食堂", address: "東京", lat: 35, lng: 139, tags: [], rating: null, place_id: "p1" };
    mockRpc.mockResolvedValue({ data: [pub], error: null });
    const result = await getPublicStore("store-1");
    expect(result).toMatchObject({ id: "store-1", name: "食堂" });
  });
});
