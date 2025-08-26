import { describe, it, expect, vi, beforeEach } from "vitest";

function setupDom(init: Record<string, string> = {}) {
  const jar: Record<string, string> = { ...init };
  const documentStub = {
    get cookie() {
      return Object.entries(jar)
        .map(([k, v]) => `${k}=${v}`)
        .join("; ");
    },
    set cookie(value: string) {
      const [pair, ...attrs] = value.split(";").map((p) => p.trim());
      const [name, val] = pair.split("=");
      const maxAge = attrs.find((a) => a.toLowerCase().startsWith("max-age"));
      if (maxAge && maxAge.endsWith("=0")) {
        delete jar[name];
      } else if (val) {
        jar[name] = val;
      }
    },
  } as unknown as Document;
  const windowStub = new (class extends EventTarget {})();
  Object.assign(globalThis, { document: documentStub, window: windowStub });
}

beforeEach(() => {
  vi.resetModules();
  vi.restoreAllMocks();
  delete (globalThis as any).document;
  delete (globalThis as any).window;
});

describe("getPhotos", () => {
  it("calls the photos endpoint and resolves with data", async () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example.com";
    setupDom({ accessToken: "token" });
    const mockPhoto = {
      id: 7,
      displayFileName: "no-signal.png",
      photoUrl:
        "https://lazystoragephotos001.blob.core.windows.net/photos/46ebce29-7465-4967-b2c6-07963943ca3e/0ae3bc43-bbf7-402c-a0bd-a08037fe821e.png",
      blobId: "0ae3bc43-bbf7-402c-a0bd-a08037fe821e",
      userId: "46ebce29-7465-4967-b2c6-07963943ca3e",
      createdAt: "2024-09-18T14:02:53.1166667+00:00",
      photoMetadata: {
        cameraModel: "Camera Model Here",
        aperture: "f/1.8",
        shutterTime: "1/50",
        focusRange: 28,
        isoCount: 400,
      },
    };
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      headers: new Headers({ "Content-Type": "application/json" }),
      json: async () => [mockPhoto],
      text: async () => "",
    });
    (global as any).fetch = mockFetch;
    const { getPhotos } = await import("../../src/shared/api/photos");
    await expect(getPhotos()).resolves.toEqual([mockPhoto]);
    const [, init] = mockFetch.mock.calls[0];
    expect(init?.method).toBe("GET");
    expect((init?.headers as Headers).get("Authorization")).toBe(
      "Bearer token",
    );
  });

  it("throws with server message", async () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example.com";
    setupDom();
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

  it("refreshes access token on 401 and retries", async () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example.com";
    setupDom();
    const { setAuthSession, getCookie } = await import(
      "../../src/shared/auth/session"
    );
    setAuthSession("old", "refresh", "user");
    const mockPhoto = {
      id: 1,
      displayFileName: "p.jpg",
      photoUrl: "https://example.com/p.jpg",
      blobId: "b",
      userId: "u",
      createdAt: "now",
      photoMetadata: {
        cameraModel: "m",
        aperture: "a",
        shutterTime: "s",
        focusRange: 1,
        isoCount: 1,
      },
    };
    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
        headers: new Headers({ "Content-Type": "application/json" }),
        json: async () => ({ message: "expired" }),
        text: async () => "",
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Headers({ "Content-Type": "application/json" }),
        json: async () => ({
          tokenType: "Bearer",
          accessToken: "newToken",
          expiresIn: 3600,
          refreshToken: "newRefresh",
        }),
        text: async () => "",
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Headers({ "Content-Type": "application/json" }),
        json: async () => [mockPhoto],
        text: async () => "",
      });
    (global as any).fetch = mockFetch;
    const { getPhotos } = await import("../../src/shared/api/photos");
    await expect(getPhotos()).resolves.toEqual([mockPhoto]);
    expect(mockFetch).toHaveBeenCalledTimes(3);
    const call1 = mockFetch.mock.calls[0];
    expect(call1[0]).toBe("https://api.example.com/Photo");
    expect((call1[1].headers as Headers).get("Authorization")).toBe(
      "Bearer old",
    );
    const call2 = mockFetch.mock.calls[1];
    expect(call2[0]).toBe("https://api.example.com/refresh");
    const call3 = mockFetch.mock.calls[2];
    expect(call3[0]).toBe("https://api.example.com/Photo");
    expect((call3[1].headers as Headers).get("Authorization")).toBe(
      "Bearer newToken",
    );
    expect(getCookie("accessToken")).toBe("newToken");
    expect(getCookie("refreshToken")).toBe("newRefresh");
  });
});
