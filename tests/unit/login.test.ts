import { describe, it, expect, vi, beforeEach } from "vitest";

beforeEach(() => {
  vi.resetModules();
  vi.restoreAllMocks();
});

describe("loginUser", () => {
  it("posts to the path from swagger and resolves on success", async () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example.com";
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      headers: new Headers({ "Content-Type": "application/json" }),
      json: async () => ({
        tokenType: "Bearer",
        accessToken: "token",
        expiresIn: 3600,
        refreshToken: "refresh",
      }),
      text: async () => "",
    });
    (global as any).fetch = mockFetch;
    const { loginUser } = await import("../../src/shared/api/auth");
    await expect(
      loginUser({ email: "test@example.com", password: "pass" }),
    ).resolves.toEqual({
      tokenType: "Bearer",
      accessToken: "token",
      expiresIn: 3600,
      refreshToken: "refresh",
    });
    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.example.com/login",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("extracts the first problem-details error message", async () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example.com";
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      statusText: "Bad Request",
      headers: new Headers({ "Content-Type": "application/json" }),
      json: async () => ({
        type: "rfc9110",
        title: "One or more validation errors occurred.",
        status: 400,
        errors: {
          InvalidCredentials: ["Invalid email or password."],
        },
      }),
      text: async () => "",
    });
    (global as any).fetch = mockFetch;
    const { loginUser } = await import("../../src/shared/api/auth");
    await expect(
      loginUser({ email: "test@example.com", password: "pass" }),
    ).rejects.toThrow("Invalid email or password.");
  });
});
