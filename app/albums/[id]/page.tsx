"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getAlbum } from "@/shared/api/albums";
import styles from "./album.module.css";

type Props = { params: { id: string } };

export default function AlbumView({ params }: Props) {
  const id = Number(params.id);
  const {
    data: album,
    isLoading: albumLoading,
    isError: albumError,
  } = useQuery({ queryKey: ["album", id], queryFn: () => getAlbum(id) });

  if (albumLoading) {
    return <p className={styles.status}>Loading album...</p>;
  }
  if (albumError || !album) {
    return <p className={styles.status}>Failed to load album</p>;
  }

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>{album.title}</h1>
      <div className={styles.photoGrid}>
        {(album.albumPhotos ?? []).map((photo) => (
          photo.blobUrl && (
            <img key={photo.photoId} src={photo.blobUrl} alt="album photo" />
          )
        ))}
      </div>
      <Link href="/" className={styles.back}>
        Back
      </Link>
    </main>
  );
}
