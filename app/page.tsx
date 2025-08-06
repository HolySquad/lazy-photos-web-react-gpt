"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./home.module.css";
import { getCookie, onAuthSessionChange } from "@/shared/auth/session";

export default function Home() {
  const [username, setUsername] = useState<string | null>(null);
  const [active, setActive] = useState<"photos" | "albums">("photos");

  useEffect(() => {
    const update = () => setUsername(getCookie("username"));
    update();
    return onAuthSessionChange(update);
  }, []);

  if (!username) {
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
          <div className={styles.actions}>
            <Link href="/login" className={styles.login}>
              Login
            </Link>
            <Link href="/register" className={styles.register}>
              Register
            </Link>
          </div>
        </section>
        <section className={styles.gallery}>{images}</section>
      </main>
    );
  }

  const photos = Array.from({ length: 8 }).map((_, i) => (
    <img
      key={i}
      src={`https://picsum.photos/seed/auth${i}/300/200`}
      alt={`Photo ${i + 1}`}
    />
  ));

  const albums = [
    { id: 1, name: "Vacation", count: 42, thumb: "https://picsum.photos/seed/album1/300/200" },
    { id: 2, name: "Family", count: 18, thumb: "https://picsum.photos/seed/album2/300/200" },
    { id: 3, name: "Work", count: 5, thumb: "https://picsum.photos/seed/album3/300/200" }
  ];

  return (
    <main className={styles.appContainer}>
      <aside className={styles.sidebar}>
        <h2 className={styles.appName}>Lazy Photos</h2>
        <nav className={styles.nav}>
          <button
            className={`${styles.navItem} ${active === "photos" ? styles.active : ""}`}
            onClick={() => setActive("photos")}
          >
            Photos
          </button>
          <button
            className={`${styles.navItem} ${active === "albums" ? styles.active : ""}`}
            onClick={() => setActive("albums")}
          >
            Albums
          </button>
        </nav>
      </aside>
      <section className={styles.content}>
        {active === "photos" ? (
          <div className={styles.photoGrid}>{photos}</div>
        ) : (
          <div className={styles.albumGrid}>
            {albums.map((album) => (
              <div key={album.id} className={styles.albumItem}>
                <img src={album.thumb} alt={`${album.name} cover`} />
                <div className={styles.albumInfo}>
                  <span className={styles.albumName}>{album.name}</span>
                  <span className={styles.albumCount}>{album.count} photos</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
