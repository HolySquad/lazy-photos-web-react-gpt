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
      json: async () => ({ id: '1', email: 'test@example.com' }),
    });
    (global as any).fetch = mockFetch;
    const { registerUser } = await import('../../lib/api');
    const res = await registerUser('test@example.com', 'pass');
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.example.com/api/Auth/register',
      expect.objectContaining({ method: 'POST' })
    );
    expect(res).toEqual({ id: '1', email: 'test@example.com' });
  });

  it('throws when API responds with an error message', async () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = 'https://api.example.com';
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ message: 'exists' }),
    });
    (global as any).fetch = mockFetch;
    const { registerUser } = await import('../../lib/api');
    await expect(registerUser('test@example.com', 'pass')).rejects.toThrow('exists');
  });
});
