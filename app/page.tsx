"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./home.module.css";
import { getCookie, onAuthSessionChange } from "@/shared/auth/session";

export default function Home() {
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const update = () => setUsername(getCookie("username"));
    update();
    return onAuthSessionChange(update);
  }, []);

  const images = Array.from({ length: 6 }).map((_, i) => (
    <img
      key={i}
      src={`https://picsum.photos/seed/${i}/300/200`}
      alt={`Gallery image ${i + 1}`}
    />
  ));

  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <h1 className={styles.title}>Lazy Photos</h1>
        <p className={styles.tagline}>Store your memories like a true geek.</p>
        {!username && (
          <div className={styles.actions}>
            <Link href="/login" className={styles.login}>
              Login
            </Link>
            <Link href="/register" className={styles.register}>
              Register
            </Link>
          </div>
        )}
      </section>
      <section className={styles.gallery}>{images}</section>
    </main>
  );
}
