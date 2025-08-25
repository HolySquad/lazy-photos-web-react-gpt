import { describe, it, expect, vi, beforeEach } from "vitest";

beforeEach(() => {
  vi.resetModules();
  vi.restoreAllMocks();
  delete (globalThis as any).document;
});

describe("users api", () => {
  it("fetches current user with auth header", async () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example.com";
    (globalThis as any).document = { cookie: "accessToken=token" };
    const mockUser = { id: "1", userName: "tester", email: "t@test.com" };
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      headers: new Headers({ "Content-Type": "application/json" }),
      json: async () => mockUser,
      text: async () => "",
    });
    (global as any).fetch = mockFetch;
    const { getCurrentUser } = await import("../../src/shared/api/users");
    await expect(getCurrentUser()).resolves.toEqual(mockUser);
    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toBe("https://api.example.com/User/currentUser");
    expect(init?.method).toBe("GET");
    expect((init?.headers as Headers).get("Authorization")).toBe(
      "Bearer token",
    );
  });

  it("throws getCurrentUser error message", async () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example.com";
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Bad",
      headers: new Headers({ "Content-Type": "application/json" }),
      json: async () => ({ message: "boom" }),
      text: async () => "",
    });
    (global as any).fetch = mockFetch;
    const { getCurrentUser } = await import("../../src/shared/api/users");
    await expect(getCurrentUser()).rejects.toThrow("boom");
  });
});
