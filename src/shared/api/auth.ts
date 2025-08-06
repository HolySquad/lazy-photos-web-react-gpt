import { z } from 'zod';
import { API_BASE_URL } from '../config';
import {
  LazyMyPhotosApiService,
  OpenAPI,
  type RegisterRequest,
} from './generated';

OpenAPI.BASE = API_BASE_URL;

const RegisterResponseSchema = z.object({
  id: z.string(),
  email: z.string().email(),
});

export type RegisterResponse = z.infer<typeof RegisterResponseSchema>;

export async function registerUser(
  data: RegisterRequest,
): Promise<RegisterResponse> {
  try {
    const res = await LazyMyPhotosApiService.postRegister(data);
    return RegisterResponseSchema.parse(res);
  } catch (err) {
    const body = (err as any)?.body as
      | { errors?: Record<string, string[]>; message?: string }
      | undefined;
    const firstError = body?.errors
      ? body.errors[Object.keys(body.errors)[0]]?.[0]
      : undefined;
    const message = firstError ?? body?.message ?? (err instanceof Error ? err.message : 'Failed to register');
    throw new Error(message);
  }
}
