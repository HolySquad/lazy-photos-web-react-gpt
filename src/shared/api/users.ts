import { z } from "zod";
import { apiRequest } from "./client";
import { UserService } from "./generated";

const UserSchema = z.object({
  id: z.string(),
  userName: z.string(),
  email: z.string().email(),
});

export type User = z.infer<typeof UserSchema>;

export async function getCurrentUser(): Promise<User> {
  try {
    const res = await apiRequest(() => UserService.currentUser());
    return UserSchema.parse(res);
  } catch (err) {
    const body = (err as any)?.body as { message?: string } | undefined;
    const message =
      body?.message ??
      (err instanceof Error ? err.message : "Failed to load user");
    throw new Error(message);
  }
}
