import { z } from 'zod';
import { API_BASE_URL } from '../config';
import {
  DefaultService,
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
    const res = await DefaultService.authRegister(data);
    return RegisterResponseSchema.parse(res);
  } catch (err) {
    const message =
      (err as any)?.body?.message ??
      (err instanceof Error ? err.message : 'Failed to register');
    throw new Error(message);
  }
}
