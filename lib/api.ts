export async function registerUser(email: string, password: string) {
  const res = await fetch('/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const message = (data as any).message ?? 'Failed to register';
    throw new Error(message);
  }

  return res.json();
}
