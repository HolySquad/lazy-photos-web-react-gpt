import { describe, it, expect, vi, beforeEach } from "vitest";

beforeEach(() => {
  vi.resetModules();
  vi.restoreAllMocks();
  delete (globalThis as any).document;
});

describe("albums api", () => {
  it("fetches albums with auth header", async () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example.com";
    (globalThis as any).document = { cookie: "accessToken=token" };
    const mockAlbum = {
      id: 1,
      name: "Vacation",
      count: 10,
      thumb: "https://example.com/thumb.jpg",
    };
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      headers: new Headers({ "Content-Type": "application/json" }),
      json: async () => [mockAlbum],
      text: async () => "",
    });
    (global as any).fetch = mockFetch;
    const { getAlbums } = await import("../../src/shared/api/albums");
    await expect(getAlbums()).resolves.toEqual([mockAlbum]);
    const [, init] = mockFetch.mock.calls[0];
    expect(init?.method).toBe("GET");
    expect((init?.headers as Headers).get("Authorization")).toBe(
      "Bearer token",
    );
  });

  it("throws with server message", async () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example.com";
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Server Error",
      headers: new Headers({ "Content-Type": "application/json" }),
      json: async () => ({ message: "boom" }),
      text: async () => "",
    });
    (global as any).fetch = mockFetch;
    const { getAlbums } = await import("../../src/shared/api/albums");
    await expect(getAlbums()).rejects.toThrow("boom");
  });

  it("posts album name", async () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example.com";
    (globalThis as any).document = { cookie: "accessToken=token" };
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      headers: new Headers({ "Content-Type": "application/json" }),
      json: async () => ({}),
      text: async () => "",
    });
    (global as any).fetch = mockFetch;
    const { createAlbum } = await import("../../src/shared/api/albums");
    await expect(createAlbum("Holiday")).resolves.toBeUndefined();
    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.example.com/Album/CreateAlbum?albumName=Holiday",
      expect.objectContaining({ method: "POST" }),
    );
    const [, init] = mockFetch.mock.calls[0];
    expect((init?.headers as Headers).get("Authorization")).toBe(
      "Bearer token",
    );
  });

  it("propagates server error on create", async () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example.com";
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Server Error",
      headers: new Headers({ "Content-Type": "application/json" }),
      json: async () => ({ message: "fail" }),
      text: async () => "",
    });
    (global as any).fetch = mockFetch;
    const { createAlbum } = await import("../../src/shared/api/albums");
    await expect(createAlbum("Holiday")).rejects.toThrow("fail");
  });
});

