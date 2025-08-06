import { z } from 'zod';
import { API_BASE_URL } from './config';
import apiSchema from '../swagger.json';

// derive endpoint and response schema from the OpenAPI spec
const REGISTER_PATH =
  Object.keys((apiSchema as any).paths || {}).find(
    (p) => (apiSchema as any).paths[p]?.post?.operationId === 'Auth_Register'
  ) ?? '/register';

function buildSchemaFromSpec(spec: any, name: string) {
  const properties = spec.components?.schemas?.[name]?.properties ?? {};
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const [key, value] of Object.entries<any>(properties)) {
    if (value.type === 'string') {
      shape[key] = value.format === 'email' ? z.string().email() : z.string();
    } else if (value.type === 'number' || value.type === 'integer') {
      shape[key] = z.number();
    } else if (value.type === 'boolean') {
      shape[key] = z.boolean();
    } else {
      shape[key] = z.any();
    }
  }
  return z.object(shape);
}

const RegisterResponseSchema = buildSchemaFromSpec(
  apiSchema,
  'RegisterResponse'
);

export type RegisterResponse = z.infer<typeof RegisterResponseSchema>;

export async function registerUser(
  email: string,
  password: string
): Promise<RegisterResponse> {
  const res = await fetch(`${API_BASE_URL}${REGISTER_PATH}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = (data as any).message ?? 'Failed to register';
    throw new Error(message);
  }

  return RegisterResponseSchema.parse(data);
}
