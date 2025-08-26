import { describe, it, expect, vi, beforeEach } from "vitest";

function setupDom() {
  const jar: Record<string, string> = {};
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

describe("auth session helpers", () => {
  it("sets cookies and notifies listeners", async () => {
    setupDom();
    const handler = vi.fn();
    window.addEventListener("auth-session", handler);
    const {
      setAuthSession,
      getCookie,
    } = await import("../../src/shared/auth/session");
    setAuthSession("a", "r", "user");
    expect(getCookie("accessToken")).toBe("a");
    expect(getCookie("refreshToken")).toBe("r");
    expect(getCookie("username")).toBe("user");
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("clears cookies and notifies", async () => {
    setupDom();
    const {
      setAuthSession,
      clearAuthSession,
      getCookie,
    } = await import("../../src/shared/auth/session");
    setAuthSession("a", "r", "user");
    const handler = vi.fn();
    window.addEventListener("auth-session", handler);
    clearAuthSession();
    expect(getCookie("accessToken")).toBeNull();
    expect(getCookie("refreshToken")).toBeNull();
    expect(getCookie("username")).toBeNull();
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("listens and unsubscribes via onAuthSessionChange", async () => {
    setupDom();
    const { onAuthSessionChange } = await import(
      "../../src/shared/auth/session"
    );
    const handler = vi.fn();
    const off = onAuthSessionChange(handler);
    window.dispatchEvent(new Event("auth-session"));
    expect(handler).toHaveBeenCalledTimes(1);
    off();
    window.dispatchEvent(new Event("auth-session"));
    expect(handler).toHaveBeenCalledTimes(1);
  });
});

