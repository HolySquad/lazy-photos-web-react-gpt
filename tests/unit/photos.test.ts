import { describe, it, expect, vi, beforeEach } from "vitest";

beforeEach(() => {
  vi.resetModules();
  vi.restoreAllMocks();
  // reset document for each test
  delete (globalThis as any).document;
});

describe("getPhotos", () => {
  it("calls the photos endpoint and resolves with data", async () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example.com";
    (globalThis as any).document = { cookie: "accessToken=token" };
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
