"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useCallback, useEffect, useState, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import styles from "./home.module.css";
import { getCookie, onAuthSessionChange } from "@/shared/auth/session";
import { getPhotos, uploadPhotos } from "@/shared/api/photos";
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
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const touchStartX = useRef<number | null>(null);

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

  const selectedPhoto =
    selectedIndex !== null ? photos[selectedIndex] : null;

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

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 50) {
      if (delta < 0) {
        showNextPhoto();
      } else {
        showPrevPhoto();
      }
    }
    touchStartX.current = null;
  };

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

  const handlePhotoUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = e.target.files;
    if (!files?.length) return;
    try {
      setUploadProgress(0);
      await uploadPhotos(Array.from(files), setUploadProgress);
      queryClient.invalidateQueries({ queryKey: ["photos"] });
      e.target.value = "";
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to upload photo");
    } finally {
      setUploadProgress(null);
    }
  };

  useEffect(() => {
    if (selectedIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        showNextPhoto();
      } else if (e.key === "ArrowLeft") {
        showPrevPhoto();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedIndex, showNextPhoto, showPrevPhoto]);

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
              <input type="file" multiple onChange={handlePhotoUpload} />
              {uploadProgress !== null && (
                <div className={styles.uploadProgress}>
                  <progress value={uploadProgress} max={100} />
                  <span>{uploadProgress}%</span>
                </div>
              )}
              <div className={styles.photoGrid}>
                {photos.map((photo, i) => (
                  <img
                    key={photo.id}
                    src={photo.photoUrl ?? ""}
                    alt={photo.displayFileName ?? ""}
                    onClick={() => setSelectedIndex(i)}
                  />
                ))}
              </div>
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
                      {album.photoCount} photos
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </section>
      {selectedPhoto && (
        <div
          className={styles.photoPreviewOverlay}
          onClick={() => {
            setSelectedIndex(null);
            setMenuOpen(false);
            setShowAlbumPicker(false);
          }}
        >
          <button
            className={`${styles.navButton} ${styles.prevButton}`}
            onClick={(e) => {
              e.stopPropagation();
              showPrevPhoto();
            }}
            aria-label="Previous photo"
          >
            ‹
          </button>
          <div
            className={styles.photoPreview}
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div className={styles.topBar}>
              <button
                onClick={() => {
                  setSelectedIndex(null);
                  setMenuOpen(false);
                  setShowAlbumPicker(false);
                }}
                aria-label="Close preview"
              >
                ←
              </button>
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
            </div>
            <div
              className={styles.previewTrack}
              style={{ transform: `translateX(-${selectedIndex! * 100}vw)` }}
            >
              {photos.map((photo) => (
                <img
                  key={photo.id}
                  src={photo.photoUrl ?? ""}
                  alt={photo.displayFileName ?? ""}
                  className={styles.previewImage}
                />
              ))}
            </div>
          </div>
          <button
            className={`${styles.navButton} ${styles.nextButton}`}
            onClick={(e) => {
              e.stopPropagation();
              showNextPhoto();
            }}
            aria-label="Next photo"
          >
            ›
          </button>
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
                              : "Failed to add photo",
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
        </div>
      )}
    </main>
  );
}
