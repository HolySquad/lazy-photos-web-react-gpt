const API_BASE = 'https://lazy-photo-api.azurewebsites.net';

export async function registerUser(email: string, password: string) {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    let message = 'Failed to register';
    try {
      const data = await res.json();
      if (data.message) message = data.message;
    } catch (e) {
      // ignore
    }
    throw new Error(message);
  }

  return res.json();
}
