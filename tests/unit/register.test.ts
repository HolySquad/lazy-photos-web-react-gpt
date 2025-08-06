import { describe, it, expect, vi, beforeEach } from 'vitest';

beforeEach(() => {
  vi.resetModules();
  vi.restoreAllMocks();
});

describe('registerUser', () => {
  it('posts to the path from swagger and resolves on success', async () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = 'https://api.example.com';
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Headers(),
      json: async () => undefined,
      text: async () => '',
    });
    (global as any).fetch = mockFetch;
    const { registerUser } = await import('../../src/shared/api/auth');
    await expect(
      registerUser({ email: 'test@example.com', password: 'pass' }),
    ).resolves.toBeUndefined();
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.example.com/register',
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('extracts the first problem-details error message', async () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = 'https://api.example.com';
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      headers: new Headers({ 'Content-Type': 'application/json' }),
      json: async () => ({
        type: 'rfc9110',
        title: 'One or more validation errors occurred.',
        status: 400,
        errors: {
          DuplicateUserName: ["Username 'q@q.com' is already taken."],
        },
      }),
      text: async () => '',
    });
    (global as any).fetch = mockFetch;
    const { registerUser } = await import('../../src/shared/api/auth');
    await expect(
      registerUser({ email: 'test@example.com', password: 'pass' }),
    ).rejects.toThrow("Username 'q@q.com' is already taken.");
  });
});
