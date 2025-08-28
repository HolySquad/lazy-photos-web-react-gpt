"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useCallback, useState, useRef, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAlbum, type AlbumPhoto } from "@/shared/api/albums";
import styles from "./album.module.css";
import PhotoPreview from "@/features/photo-preview";

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
  const { heroPhotos, gridPhotos } = useMemo(() => {
    if (photos.length >= 3) {
      return { heroPhotos: photos.slice(0, 3), gridPhotos: photos.slice(3) };
    }
    return { heroPhotos: [] as AlbumPhoto[], gridPhotos: photos };
  }, [photos]);
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


  useEffect(() => {
    resizeAllGridItems();
    window.addEventListener("resize", resizeAllGridItems);
    return () => window.removeEventListener("resize", resizeAllGridItems);
  }, [gridPhotos, resizeAllGridItems]);

  if (albumLoading) {
    return <p className={styles.status}>Loading album...</p>;
  }
  if (albumError || !album) {
    return <p className={styles.status}>Failed to load album</p>;
  }

  return (
    <main className={styles.main}>
      <Link href="/" className={styles.back}>
        Back
      </Link>

      {heroPhotos.length > 0 && (
        <div className={styles.heroGrid}>
          {heroPhotos.map(
            (photo, i) =>
              (photo.thumbnailUrl || photo.blobUrl) && (
                <div
                  key={photo.photoId}
                  className={styles.heroItem}
                  onClick={() => setSelectedIndex(i)}
                >
                  <img
                    src={photo.thumbnailUrl ?? photo.blobUrl ?? ""}
                    alt="album photo"
                  />
                </div>
              ),
          )}
        </div>
      )}

      <div className={styles.details}>
        <h1 className={styles.title}>{album.title}</h1>
        <p className={styles.meta}>
          {album.photoCount} {album.photoCount === 1 ? "photo" : "photos"}
        </p>
        <div className={styles.thumbRow}>
          {photos.slice(0, 5).map(
            (p) =>
              (p.thumbnailUrl || p.blobUrl) && (
                <img
                  key={p.photoId}
                  src={p.thumbnailUrl ?? p.blobUrl ?? ""}
                  alt="preview"
                />
              ),
          )}
        </div>
      </div>

      <div className={styles.photoGrid} ref={gridRef}>
        {gridPhotos.map(
          (photo, i) =>
            (photo.thumbnailUrl || photo.blobUrl) && (
              <div
                key={photo.photoId}
                className={styles.photoItem}
                onClick={() => setSelectedIndex(i + heroPhotos.length)}
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
        <PhotoPreview
          photos={photos.map((p) => ({
            src: p.blobUrl ?? "",
            alt: "album photo",
          }))}
          index={selectedIndex!}
          onClose={() => setSelectedIndex(null)}
          onPrev={showPrevPhoto}
          onNext={showNextPhoto}
        />
      )}
    </main>
  );
}
