import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { middleware } from "@/middleware";

const mockGetUser = vi.fn();

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
  })),
}));

beforeEach(() => {
  vi.clearAllMocks();
  process.env.NEXT_PUBLIC_SUPABASE_URL = "http://localhost";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-key";
});

describe("middleware: 認証リダイレクト", () => {
  it("未認証で /map にアクセスすると /login?next=%2Fmap にリダイレクト", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const res = await middleware(new NextRequest("http://localhost/map"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/login");
    expect(res.headers.get("location")).toContain("next=%2Fmap");
  });

  it("未認証で /s/abc にアクセスすると通過する（公開ルート）", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const res = await middleware(new NextRequest("http://localhost/s/abc"));
    expect(res.status).not.toBe(307);
  });

  it("未認証で /share にアクセスすると通過する（Share Target）", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const res = await middleware(new NextRequest("http://localhost/share?store_id=abc"));
    expect(res.status).not.toBe(307);
  });

  it("未認証でランディングページ / にアクセスすると通過する", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const res = await middleware(new NextRequest("http://localhost/"));
    expect(res.status).not.toBe(307);
  });

  it("認証済みで /login にアクセスすると /map にリダイレクト", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    const res = await middleware(new NextRequest("http://localhost/login"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/map");
  });
});
