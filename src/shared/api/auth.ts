import { API_BASE_URL } from "../config";
import {
  LazyMyPhotosApiService,
  OpenAPI,
  type RegisterRequest,
  type LoginRequest,
  type AccessTokenResponse,
} from "./generated";

OpenAPI.BASE = API_BASE_URL;

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
