import { describe, it, expect, vi, beforeEach } from "vitest";

beforeEach(() => {
  vi.resetModules();
  vi.restoreAllMocks();
});

describe("getPhotos", () => {
  it("calls the photos endpoint and resolves with data", async () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example.com";
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      headers: new Headers({ "Content-Type": "application/json" }),
      json: async () => [{ id: 1, url: "https://img/1" }],
      text: async () => "",
    });
    (global as any).fetch = mockFetch;
    const { getPhotos } = await import("../../src/shared/api/photos");
    await expect(getPhotos()).resolves.toEqual([
      { id: 1, url: "https://img/1" },
    ]);
    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.example.com/api/Photo",
      expect.objectContaining({ method: "GET" }),
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
    const { getPhotos } = await import("../../src/shared/api/photos");
    await expect(getPhotos()).rejects.toThrow("boom");
  });
});
