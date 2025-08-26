"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getAlbum, getAlbumPhotos } from "@/shared/api/albums";
import styles from "./album.module.css";

type Props = { params: { id: string } };

export default function AlbumView({ params }: Props) {
  const id = Number(params.id);
  const {
    data: album,
    isLoading: albumLoading,
    isError: albumError,
  } = useQuery({ queryKey: ["album", id], queryFn: () => getAlbum(id) });

  const {
    data: photos = [],
    isLoading: photosLoading,
    isError: photosError,
  } = useQuery({
    queryKey: ["albumPhotos", id],
    queryFn: () => getAlbumPhotos(id),
    enabled: !!album,
  });

  if (albumLoading) {
    return <p className={styles.status}>Loading album...</p>;
  }
  if (albumError || !album) {
    return <p className={styles.status}>Failed to load album</p>;
  }

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>{album.title}</h1>
      {photosLoading ? (
        <p className={styles.status}>Loading photos...</p>
      ) : photosError ? (
        <p className={styles.status}>Failed to load photos</p>
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
      )}
      <Link href="/" className={styles.back}>
        Back
      </Link>
    </main>
  );
}
