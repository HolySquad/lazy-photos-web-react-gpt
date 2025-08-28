import { API_BASE_URL } from "../config";
import { getCookie, setAuthSession } from "../auth/session";
import { OpenAPI } from "./generated";

OpenAPI.BASE = API_BASE_URL;
OpenAPI.TOKEN = async () => getCookie("accessToken") || "";

export async function apiRequest<T>(call: () => Promise<T>): Promise<T> {
  try {
    return await call();
  } catch (err: any) {
    const status = err?.status ?? err?.response?.status;
    const body = err?.body ?? err?.response?.data;
    if (status === 401 && body?.message === "expired") {
      const refreshToken = getCookie("refreshToken");
      const username = getCookie("username") || "";
      if (refreshToken) {
        try {
          const { refreshAccessToken } = await import("./auth");
          const tokens = await refreshAccessToken(refreshToken);
          if (!tokens?.accessToken) {
            throw new Error("Missing access token");
          }
          setAuthSession(
            tokens.accessToken,
            tokens.refreshToken ?? refreshToken,
            username,
          );
          return await call();
        } catch (refreshErr: any) {
          const rBody = refreshErr?.body ?? refreshErr?.response?.data;
          const rMessage =
            rBody?.message ??
            (refreshErr instanceof Error
              ? refreshErr.message
              : "Failed to refresh token");
          throw new Error(rMessage);
        }
      }
    }
    throw err;
  }
}
