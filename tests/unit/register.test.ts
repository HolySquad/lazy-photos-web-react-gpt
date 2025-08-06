import { describe, it, expect, vi, beforeEach } from 'vitest';

beforeEach(() => {
  vi.resetModules();
  vi.restoreAllMocks();
});

describe('registerUser', () => {
  it('posts to the path from swagger and returns user data', async () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = 'https://api.example.com';
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Headers({ 'Content-Type': 'application/json' }),
      json: async () => ({ id: '1', email: 'test@example.com' }),
      text: async () => '',
    });
    (global as any).fetch = mockFetch;
    const { registerUser } = await import('../../src/shared/api/auth');
    const res = await registerUser({ email: 'test@example.com', password: 'pass' });
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.example.com/register',
      expect.objectContaining({ method: 'POST' })
    );
    expect(res).toEqual({ id: '1', email: 'test@example.com' });
  });

  it('throws when API responds with an error message', async () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = 'https://api.example.com';
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      headers: new Headers({ 'Content-Type': 'application/json' }),
      json: async () => ({ message: 'exists' }),
      text: async () => '',
    });
    (global as any).fetch = mockFetch;
    const { registerUser } = await import('../../src/shared/api/auth');
    await expect(
      registerUser({ email: 'test@example.com', password: 'pass' }),
    ).rejects.toThrow('exists');
  });
});
