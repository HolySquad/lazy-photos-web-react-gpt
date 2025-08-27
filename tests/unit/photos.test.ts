import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";

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
      thumbnailUrl:
        "https://lazystoragephotos001.blob.core.windows.net/photos/46ebce29-7465-4967-b2c6-07963943ca3e/0ae3bc43-bbf7-402c-a0bd-a08037fe821e_thumb.png",
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
    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toBe("https://api.example.com/Photo?offset=0&pageSize=20");
    expect(init?.method).toBe("GET");
    expect((init?.headers as Headers).get("Authorization")).toBe(
      "Bearer token",
    );
  });

  it("supports custom offset and pageSize", async () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example.com";
    setupDom({ accessToken: "token" });
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      headers: new Headers({ "Content-Type": "application/json" }),
      json: async () => [],
      text: async () => "",
    });
    (global as any).fetch = mockFetch;
    const { getPhotos } = await import("../../src/shared/api/photos");
    await expect(getPhotos(40, 10)).resolves.toEqual([]);
    const [url] = mockFetch.mock.calls[0];
    expect(url).toBe("https://api.example.com/Photo?offset=40&pageSize=10");
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
});

describe("uploadPhoto", () => {
  it("uploads file with auth header", async () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example.com";
    setupDom({ accessToken: "token" });
    const post = vi.fn().mockResolvedValue({ data: { id: 1 } });
    (axios.post as any) = post;
    const file = new File(["data"], "p.jpg", { type: "image/jpeg" });
    const { uploadPhoto } = await import("../../src/shared/api/photos");
    await expect(uploadPhoto(file)).resolves.toBe(1);
    expect(post).toHaveBeenCalledWith(
      "https://api.example.com/Photo",
      expect.any(FormData),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer token" }),
      }),
    );
  });

  it("handles photoId response", async () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example.com";
    setupDom({ accessToken: "token" });
    const post = vi.fn().mockResolvedValue({ data: { photoId: 2 } });
    (axios.post as any) = post;
    const file = new File(["data"], "p.jpg", { type: "image/jpeg" });
    const { uploadPhoto } = await import("../../src/shared/api/photos");
    await expect(uploadPhoto(file)).resolves.toBe(2);
  });

  it("throws server message", async () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example.com";
    setupDom({ accessToken: "token" });
    const post = vi.fn().mockRejectedValue({
      response: { status: 400, data: { message: "boom" } },
    });
    (axios.post as any) = post;
    const file = new File(["data"], "p.jpg", { type: "image/jpeg" });
    const { uploadPhoto } = await import("../../src/shared/api/photos");
    await expect(uploadPhoto(file)).rejects.toThrow("boom");
  });
});

describe("uploadPhotos", () => {
  it("uploads multiple files sequentially and reports progress", async () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example.com";
    setupDom({ accessToken: "t" });
    let id = 1;
    const post = vi
      .fn()
      .mockImplementation((_url: string, _data: FormData, config: any) => {
        config.onUploadProgress({ loaded: 50, total: 100 });
        config.onUploadProgress({ loaded: 100, total: 100 });
        return Promise.resolve({ data: { id: id++ } });
      });
    (axios.post as any) = post;
    const { uploadPhotos } = await import("../../src/shared/api/photos");
    const file1 = new File(["a"], "a.jpg", { type: "image/jpeg" });
    const file2 = new File(["b"], "b.jpg", { type: "image/jpeg" });
    const calls: number[] = [];
    await expect(
      uploadPhotos([file1, file2], (p) => calls.push(p)),
    ).resolves.toEqual([1, 2]);
    expect(post).toHaveBeenCalledTimes(2);
    expect(calls).toEqual([25, 50, 75, 100]);
  });
});
