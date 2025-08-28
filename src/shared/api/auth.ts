import "./client";
import {
  LazyMyPhotosApiService,
  type RegisterRequest,
  type LoginRequest,
  type AccessTokenResponse,
} from "./generated";

export async function registerUser(data: RegisterRequest): Promise<void> {
  try {
    await LazyMyPhotosApiService.postRegister(data);
  } catch (err) {
    const body = (err as any)?.body as
      | { errors?: Record<string, string[]>; message?: string }
      | undefined;
    const firstError = body?.errors
      ? body.errors[Object.keys(body.errors)[0]]?.[0]
      : undefined;
    const message =
      firstError ??
      body?.message ??
      (err instanceof Error ? err.message : "Failed to register");
    throw new Error(message);
  }
}

export async function loginUser(
  data: LoginRequest,
): Promise<AccessTokenResponse> {
  try {
    return await LazyMyPhotosApiService.postLogin(data);
  } catch (err) {
    const body = (err as any)?.body as
      | { errors?: Record<string, string[]>; message?: string }
      | undefined;
    const firstError = body?.errors
      ? body.errors[Object.keys(body.errors)[0]]?.[0]
      : undefined;
    const message =
      firstError ??
      body?.message ??
      (err instanceof Error ? err.message : "Failed to login");
    throw new Error(message);
  }
}

export async function refreshAccessToken(
  refreshToken: string,
): Promise<AccessTokenResponse> {
  try {
    return await LazyMyPhotosApiService.postRefresh({ refreshToken });
  } catch (err) {
    const body = (err as any)?.body as { message?: string } | undefined;
    const message =
      body?.message ??
      (err instanceof Error ? err.message : "Failed to refresh token");
    throw new Error(message);
  }
}
