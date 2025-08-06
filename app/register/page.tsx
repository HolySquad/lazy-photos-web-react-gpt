'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { registerUser } from '@/shared/api/auth';
import styles from './register.module.css';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const mutation = useMutation({
    mutationFn: registerUser,
    onSuccess: () => router.push('/login'),
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutation.mutate({ email, password });
  };

  return (
    <div className={styles.container}>
      <h1>Register</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {mutation.error && (
          <p className={styles.error}>
            {mutation.error instanceof Error
              ? mutation.error.message
              : 'Unexpected error'}
          </p>
        )}
        <button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Registering...' : 'Register'}
        </button>
      </form>
      <hr className={styles.divider} />
      <button disabled className={styles.socialButton}>
        Sign up with Google (coming soon)
      </button>
    </div>
  );
}
