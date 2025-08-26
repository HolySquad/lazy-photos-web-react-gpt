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
      title: "Vacation",
      photoCount: 0,
      thumbnailPath: null,
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
    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toBe("https://api.example.com/Album");
    expect(init?.method).toBe("GET");
    expect((init?.headers as Headers).get("Authorization")).toBe(
      "Bearer token",
    );
  });

  it("fetches album by id", async () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example.com";
    (globalThis as any).document = { cookie: "accessToken=token" };
    const mockAlbum = {
      id: 3,
      title: "Trip",
      photoCount: 0,
      thumbnailPath: null,
    };
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      headers: new Headers({ "Content-Type": "application/json" }),
      json: async () => mockAlbum,
      text: async () => "",
    });
    (global as any).fetch = mockFetch;
    const { getAlbum } = await import("../../src/shared/api/albums");
    await expect(getAlbum(3)).resolves.toEqual(mockAlbum);
    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toBe("https://api.example.com/Album/3");
    expect(init?.method).toBe("GET");
    expect((init?.headers as Headers).get("Authorization")).toBe(
      "Bearer token",
    );
  });

  it("fetches photos for an album", async () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example.com";
    (globalThis as any).document = { cookie: "accessToken=token" };
    const mockPhoto = {
      id: 4,
      displayFileName: "p.jpg",
      photoUrl: "https://cdn.example.com/p.jpg",
      blobId: "b1",
      userId: "u1",
      createdAt: "2024-01-01",
      photoMetadata: {
        cameraModel: "cam",
        aperture: "f/1.8",
        shutterTime: "1/100",
        focusRange: 10,
        isoCount: 100,
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
    const { getAlbumPhotos } = await import("../../src/shared/api/albums");
    await expect(getAlbumPhotos(9)).resolves.toEqual([mockPhoto]);
    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toBe("https://api.example.com/AlbumPhotos/9/photos");
    expect(init?.method).toBe("GET");
    expect((init?.headers as Headers).get("Authorization")).toBe(
      "Bearer token",
    );
  });

  it("creates album with query name and photo ids", async () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example.com";
    (globalThis as any).document = { cookie: "accessToken=token" };
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      headers: new Headers({ "Content-Type": "application/json" }),
      json: async () => undefined,
      text: async () => "",
    });
    (global as any).fetch = mockFetch;
    const { createAlbum } = await import("../../src/shared/api/albums");
    await expect(createAlbum("New", [1, 2])).resolves.toBeUndefined();
    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toBe("https://api.example.com/Album?albumName=New");
    expect(init?.method).toBe("POST");
    expect(init?.body).toBe(JSON.stringify([1, 2]));
    const headers = init?.headers as Headers;
    expect(headers.get("Content-Type")).toBe("application/json");
    expect(headers.get("Authorization")).toBe("Bearer token");
  });

  it("deletes album", async () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example.com";
    (globalThis as any).document = { cookie: "accessToken=token" };
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      headers: new Headers({ "Content-Type": "application/json" }),
      json: async () => undefined,
      text: async () => "",
    });
    (global as any).fetch = mockFetch;
    const { deleteAlbum } = await import("../../src/shared/api/albums");
    await deleteAlbum(7);
    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toBe("https://api.example.com/Album/7");
    expect(init?.method).toBe("DELETE");
    expect((init?.headers as Headers).get("Authorization")).toBe(
      "Bearer token",
    );
  });

  it("adds photo to album", async () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example.com";
    (globalThis as any).document = { cookie: "accessToken=token" };
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      headers: new Headers({ "Content-Type": "application/json" }),
      json: async () => undefined,
      text: async () => "",
    });
    (global as any).fetch = mockFetch;
    const { addPhotoToAlbum } = await import("../../src/shared/api/albums");
    await addPhotoToAlbum(5, 10);
    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toBe("https://api.example.com/AlbumPhotos/5/photos/10");
    expect(init?.method).toBe("POST");
    expect(init?.body).toBeUndefined();
    const headers = init?.headers as Headers;
    expect(headers.get("Authorization")).toBe("Bearer token");
    expect(headers.get("Content-Type")).toBeNull();
  });

  it("throws createAlbum error message", async () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example.com";
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      statusText: "Bad",
      headers: new Headers({ "Content-Type": "application/json" }),
      json: async () => ({ message: "fail" }),
      text: async () => "",
    });
    (global as any).fetch = mockFetch;
    const { createAlbum } = await import("../../src/shared/api/albums");
    await expect(createAlbum("test")).rejects.toThrow("fail");
    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toBe("https://api.example.com/Album?albumName=test");
    expect(init?.body).toBe(JSON.stringify([]));
  });
});

