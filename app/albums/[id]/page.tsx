"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useCallback, useState, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAlbum, addPhotosToAlbum } from "@/shared/api/albums";
import { uploadPhotos } from "@/shared/api/photos";
import styles from "./album.module.css";

type Props = { params: { id: string } };

export default function AlbumView({ params }: Props) {
  const id = Number(params.id);
  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const {
    data: album,
    isLoading: albumLoading,
    isError: albumError,
  } = useQuery({ queryKey: ["album", id], queryFn: () => getAlbum(id) });

  const photos = album?.albumPhotos ?? [];
  const selectedPhoto =
    selectedIndex !== null ? photos[selectedIndex] : null;

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

  const handlePhotoUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = e.target.files;
    if (!files?.length) return;
    try {
      setUploadProgress(0);
      const uploaded = await uploadPhotos(
        Array.from(files),
        setUploadProgress,
      );
      if (uploaded.length) {
        await addPhotosToAlbum(id, uploaded);
        queryClient.invalidateQueries({ queryKey: ["album", id] });
      }
      e.target.value = "";
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to upload photo");
    } finally {
      setUploadProgress(null);
    }
  };

  if (albumLoading) {
    return <p className={styles.status}>Loading album...</p>;
  }
  if (albumError || !album) {
    return <p className={styles.status}>Failed to load album</p>;
  }

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>{album.title}</h1>
      <input type="file" multiple onChange={handlePhotoUpload} />
      {uploadProgress !== null && (
        <div className={styles.uploadProgress}>
          <progress value={uploadProgress} max={100} />
          <span>{uploadProgress}%</span>
        </div>
      )}
      <div className={styles.photoGrid}>
        {photos.map(
          (photo, i) =>
            photo.blobUrl && (
              <img
                key={photo.photoId}
                src={photo.blobUrl}
                alt="album photo"
                onClick={() => setSelectedIndex(i)}
              />
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
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div className={styles.topBar}>
              <button
                onClick={() => setSelectedIndex(null)}
                aria-label="Close preview"
              >
                ←
              </button>
            </div>
            <div
              className={styles.previewTrack}
              style={{ transform: `translateX(-${selectedIndex! * 100}%)` }}
            >
              {photos.map((photo) => (
                photo.blobUrl && (
                  <img
                    key={photo.photoId}
                    src={photo.blobUrl}
                    alt="album photo"
                    className={styles.previewImage}
                  />
                )
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
        </div>
      )}
      <Link href="/" className={styles.back}>
        Back
      </Link>
    </main>
  );
}
