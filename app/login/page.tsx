"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { loginUser } from "@/shared/api/auth";
import { setAuthSession } from "@/shared/auth/session";
import styles from "../auth.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      if (data.accessToken && data.refreshToken) {
        setAuthSession(data.accessToken, data.refreshToken, email);
      }
      router.push("/");
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutation.mutate({ email, password });
  };

  return (
    <div className={styles.container}>
      <h1>Login</h1>
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
              : "Unexpected error"}
          </p>
        )}
        <button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Logging in..." : "Login"}
        </button>
      </form>
      <p className={styles.alt}>
        Don&apos;t have an account? <Link href="/register">Register</Link>
      </p>
    </div>
  );
}
