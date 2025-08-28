"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useCallback, useEffect, useState, useRef, useMemo } from "react";
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import styles from "./home.module.css";
import PhotoPreview from "@/features/photo-preview";
import { getCookie, onAuthSessionChange } from "@/shared/auth/session";
import { getPhotos } from "@/shared/api/photos";
import {
  getAlbums,
  createAlbum,
  addPhotoToAlbum,
  Album,
} from "@/shared/api/albums";

export default function Home() {
  const [username, setUsername] = useState<string | null>(null);
  const [active, setActive] = useState<"photos" | "albums">("photos");
  const [showAlbumModal, setShowAlbumModal] = useState(false);
  const [albumTitle, setAlbumTitle] = useState("");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAlbumPicker, setShowAlbumPicker] = useState(false);
  const queryClient = useQueryClient();
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);

  const resizeAllGridItems = useCallback(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const rowHeight = parseInt(
      window.getComputedStyle(grid).getPropertyValue("grid-auto-rows"),
    );
    const gap = parseInt(window.getComputedStyle(grid).getPropertyValue("gap"));
    grid
      .querySelectorAll<HTMLElement>(`.${styles.photoItem}`)
      .forEach((item) => {
        const img = item.querySelector("img");
        if (!img) return;
        const rowSpan = Math.ceil(
          (img.getBoundingClientRect().height + gap) / (rowHeight + gap),
        );
        item.style.gridRowEnd = `span ${rowSpan}`;
      });
  }, []);

  useEffect(() => {
    const update = () => setUsername(getCookie("username"));
    update();
    return onAuthSessionChange(update);
  }, []);
  const PAGE_SIZE = 20;
  const {
    data: photoPages,
    isLoading: photosLoading,
    isError: photosError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["photos"],
    queryFn: ({ pageParam = 0 }) => getPhotos(pageParam, PAGE_SIZE),
    getNextPageParam: (lastPage, pages) =>
      lastPage.length === PAGE_SIZE ? pages.length * PAGE_SIZE : undefined,
    initialPageParam: 0,
    enabled: !!username && active === "photos",
  });
  const photos = useMemo(() => photoPages?.pages.flat() ?? [], [photoPages]);

  useEffect(() => {
    resizeAllGridItems();
    window.addEventListener("resize", resizeAllGridItems);
    return () => window.removeEventListener("resize", resizeAllGridItems);
  }, [photos, resizeAllGridItems]);

  useEffect(() => {
    if (!hasNextPage) return;
    const node = loadMoreRef.current;
    if (!node) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !isFetchingNextPage) {
        fetchNextPage();
      }
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const selectedPhoto = selectedIndex !== null ? photos[selectedIndex] : null;

  const {
    data: albums = [],
    isLoading: albumsLoading,
    isError: albumsError,
  } = useQuery({
    queryKey: ["albums"],
    queryFn: getAlbums,
    enabled: !!username && (active === "albums" || showAlbumPicker),
  });

  const openCreateAlbum = () => {
    setAlbumTitle("");
    setShowAlbumModal(true);
  };

  const showPrevPhoto = useCallback(
    () =>
      setSelectedIndex((idx) =>
        idx === null ? idx : idx === 0 ? photos.length - 1 : idx - 1,
      ),
    [photos.length],
  );

  const showNextPhoto = useCallback(
    () =>
      setSelectedIndex((idx) =>
        idx === null ? idx : idx === photos.length - 1 ? 0 : idx + 1,
      ),
    [photos.length],
  );


  const submitCreateAlbum = async () => {
    if (!albumTitle.trim()) return;
    try {
      await createAlbum(albumTitle.trim());
      queryClient.invalidateQueries({ queryKey: ["albums"] });
      setShowAlbumModal(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create album");
    }
  };


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
            <>
              <div className={styles.photoGrid} ref={gridRef}>
                {photos.map((photo, i) => (
                  <div
                    key={photo.id}
                    className={styles.photoItem}
                    onClick={() => setSelectedIndex(i)}
                  >
                    <img
                      src={photo.thumbnailUrl ?? photo.photoUrl ?? ""}
                      alt={photo.displayFileName ?? ""}
                      onLoad={resizeAllGridItems}
                    />
                  </div>
                ))}
              </div>
              <div ref={loadMoreRef} style={{ height: 1 }} />
              {isFetchingNextPage && <p>Loading...</p>}
            </>
          )
        ) : albumsLoading ? (
          <p>Loading albums...</p>
        ) : albumsError ? (
          <p>Failed to load albums</p>
        ) : (
          <>
            <button className={styles.createAlbum} onClick={openCreateAlbum}>
              Create album
            </button>
            {showAlbumModal && (
              <div className={styles.modalOverlay}>
                <div className={styles.modal}>
                  <h3>Create album</h3>
                  <input
                    className={styles.input}
                    value={albumTitle}
                    onChange={(e) => setAlbumTitle(e.target.value)}
                    placeholder="Album name"
                  />
                  <div className={styles.modalActions}>
                    <button
                      className={`${styles.modalButton} ${styles.modalConfirm}`}
                      onClick={submitCreateAlbum}
                    >
                      Create
                    </button>
                    <button
                      className={`${styles.modalButton} ${styles.modalCancel}`}
                      onClick={() => setShowAlbumModal(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
            <div className={styles.albumGrid}>
              {albums.map((album) => (
                <Link
                  key={album.id}
                  href={`/albums/${album.id}`}
                  className={styles.albumItem}
                >
                  <div className={styles.albumThumb}>
                    {album.thumbnailPath ? (
                      <img src={album.thumbnailPath} alt={album.title} />
                    ) : (
                      <div className={styles.albumPlaceholder}>No image</div>
                    )}
                  </div>
                  <div className={styles.albumInfo}>
                    <span className={styles.albumName}>{album.title}</span>
                    <span className={styles.albumCount}>
                      {album.photoCount}{" "}
                      {album.photoCount === 1 ? "photo" : "photos"}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </section>
      {selectedPhoto && (
        <PhotoPreview
          photos={photos.map((photo) => ({ src: photo.photoUrl ?? "", alt: photo.displayFileName ?? "" }))}
          index={selectedIndex!}
          onClose={() => {
            setSelectedIndex(null);
            setMenuOpen(false);
            setShowAlbumPicker(false);
          }}
          onPrev={showPrevPhoto}
          onNext={showNextPhoto}
          actions={
            <div className={styles.previewMenuWrapper}>
              <button
                className={styles.menuButton}
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="More actions"
              >
                ⋮
              </button>
              {menuOpen && (
                <div className={styles.menuDropdown}>
                  <button
                    onClick={() => {
                      setShowAlbumPicker(true);
                      setMenuOpen(false);
                    }}
                  >
                    Add to album
                  </button>
                </div>
              )}
            </div>
          }
        >
          {showAlbumPicker && (
            <div className={styles.modalOverlay}>
              <div className={styles.modal}>
                <h3>Select album</h3>
                <div className={styles.albumList}>
                  {albums.map((album: Album) => (
                    <button
                      key={album.id}
                      className={styles.albumSelect}
                      onClick={async () => {
                        try {
                          await addPhotoToAlbum(album.id, selectedPhoto.id);
                          setShowAlbumPicker(false);
                        } catch (err) {
                          alert(
                            err instanceof Error
                              ? err.message
                              : "Failed to add photo"
                          );
                        }
                      }}
                    >
                      {album.thumbnailPath ? (
                        <img src={album.thumbnailPath} alt={album.title} />
                      ) : (
                        <div className={styles.albumPlaceholder}>No image</div>
                      )}
                      <span>{album.title}</span>
                    </button>
                  ))}
                </div>
                <div className={styles.modalActions}>
                  <button
                    className={`${styles.modalButton} ${styles.modalCancel}`}
                    onClick={() => setShowAlbumPicker(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </PhotoPreview>
      )}
    </main>
  );
}
