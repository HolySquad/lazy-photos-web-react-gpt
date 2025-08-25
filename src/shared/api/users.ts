import { z } from "zod";
import { API_BASE_URL } from "../config";
import { getCookie } from "../auth/session";
import { OpenAPI, UserService } from "./generated";

OpenAPI.BASE = API_BASE_URL;
OpenAPI.TOKEN = async () => getCookie("accessToken") || "";

const UserSchema = z.object({
  id: z.string(),
  userName: z.string(),
  email: z.string().email(),
});

export type User = z.infer<typeof UserSchema>;

export async function getCurrentUser(): Promise<User> {
  try {
    const res = await UserService.currentUser();
    return UserSchema.parse(res);
  } catch (err) {
    const body = (err as any)?.body as { message?: string } | undefined;
    const message =
      body?.message ??
      (err instanceof Error ? err.message : "Failed to load user");
    throw new Error(message);
  }
}
