"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import styles from "./home.module.css";
import { getCookie, onAuthSessionChange } from "@/shared/auth/session";
import { getPhotos } from "@/shared/api/photos";
import { createAlbum, getAlbums } from "@/shared/api/albums";

export default function Home() {
  const [username, setUsername] = useState<string | null>(null);
  const [active, setActive] = useState<"photos" | "albums">("photos");

  useEffect(() => {
    const update = () => setUsername(getCookie("username"));
    update();
    return onAuthSessionChange(update);
  }, []);
  const {
    data: photos = [],
    isLoading: photosLoading,
    isError: photosError,
  } = useQuery({
    queryKey: ["photos"],
    queryFn: getPhotos,
    enabled: !!username && active === "photos",
  });

  const {
    data: albums = [],
    isLoading: albumsLoading,
    isError: albumsError,
  } = useQuery({
    queryKey: ["albums"],
    queryFn: getAlbums,
    enabled: !!username && active === "albums",
  });

  const queryClient = useQueryClient();
  const createAlbumMutation = useMutation({
    mutationFn: createAlbum,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["albums"] });
    },
  });

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
          <p className={styles.tagline}>
            Store your memories like a true geek.
          </p>
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
          photosLoading ? (
            <p>Loading photos...</p>
          ) : photosError ? (
            <p>Failed to load photos</p>
          ) : (
            <div className={styles.photoGrid}>
              {photos.map((photo) => (
                <img
                  key={photo.id}
                  src={photo.photoUrl}
                  alt={photo.displayFileName}
                />
              ))}
            </div>
          )
        ) : albumsLoading ? (
          <p>Loading albums...</p>
        ) : albumsError ? (
          <p>Failed to load albums</p>
        ) : (
          <div className={styles.albumGrid}>
            <button
              className={`${styles.albumItem} ${styles.albumAdd}`}
              onClick={() => {
                const name = window.prompt("Album name?");
                if (name) {
                  createAlbumMutation.mutate(name);
                }
              }}
              aria-label="Create album"
            >
              +
            </button>
            {albums.map((album) => (
              <div key={album.id} className={styles.albumItem}>
                {album.thumb && (
                  <img src={album.thumb} alt={`${album.name} cover`} />
                )}
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
