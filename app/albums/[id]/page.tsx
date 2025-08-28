"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useCallback, useState, useRef, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAlbum } from "@/shared/api/albums";
import styles from "./album.module.css";

type Props = { params: { id: string } };

export default function AlbumView({ params }: Props) {
  const id = Number(params.id);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);

  const {
    data: album,
    isLoading: albumLoading,
    isError: albumError,
  } = useQuery({ queryKey: ["album", id], queryFn: () => getAlbum(id) });

  const photos = useMemo(() => album?.albumPhotos ?? [], [album]);
  const selectedPhoto = selectedIndex !== null ? photos[selectedIndex] : null;

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

  const touchStartX = useRef<number | null>(null);

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

  useEffect(() => {
    if (selectedIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        showNextPhoto();
      } else if (e.key === "ArrowLeft") {
        showPrevPhoto();
      } else if (e.key === "Escape") {
        setSelectedIndex(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedIndex, showNextPhoto, showPrevPhoto]);

  useEffect(() => {
    resizeAllGridItems();
    window.addEventListener("resize", resizeAllGridItems);
    return () => window.removeEventListener("resize", resizeAllGridItems);
  }, [photos, resizeAllGridItems]);

  if (albumLoading) {
    return <p className={styles.status}>Loading album...</p>;
  }
  if (albumError || !album) {
    return <p className={styles.status}>Failed to load album</p>;
  }

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>{album.title}</h1>
      <div className={styles.photoGrid} ref={gridRef}>
        {photos.map(
          (photo, i) =>
            (photo.thumbnailUrl || photo.blobUrl) && (
              <div
                key={photo.photoId}
                className={styles.photoItem}
                onClick={() => setSelectedIndex(i)}
              >
                <img
                  src={photo.thumbnailUrl ?? photo.blobUrl ?? ""}
                  alt="album photo"
                  onLoad={resizeAllGridItems}
                />
              </div>
            ),
        )}
      </div>
      {selectedPhoto && selectedPhoto.blobUrl && (
        <div
          className={styles.photoPreviewOverlay}
          onClick={() => setSelectedIndex(null)}
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
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className={styles.topBar}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedIndex(null)}
                aria-label="Close preview"
              >
                ←
              </button>
            </div>
            <div
              className={styles.previewTrack}
              style={{ transform: `translateX(-${selectedIndex! * 100}vw)` }}
            >
              {photos.map(
                (photo) =>
                  photo.blobUrl && (
                    <img
                      key={photo.photoId}
                      src={photo.blobUrl}
                      alt="album photo"
                      className={styles.previewImage}
                      onClick={(e) => e.stopPropagation()}
                    />
                  ),
              )}
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
        </div>
      )}
      <Link href="/" className={styles.back}>
        Back
      </Link>
    </main>
  );
}
