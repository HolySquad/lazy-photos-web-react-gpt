"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAlbum, addPhotosToAlbum } from "@/shared/api/albums";
import { uploadPhotos } from "@/shared/api/photos";
import styles from "./album.module.css";

type Props = { params: { id: string } };

export default function AlbumView({ params }: Props) {
  const id = Number(params.id);
  const queryClient = useQueryClient();
  const {
    data: album,
    isLoading: albumLoading,
    isError: albumError,
  } = useQuery({ queryKey: ["album", id], queryFn: () => getAlbum(id) });

  const handlePhotoUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = e.target.files;
    if (!files?.length) return;
    try {
      const uploaded = await uploadPhotos(Array.from(files));
      const ids = uploaded.map((p) => p.id);
      if (ids.length) {
        await addPhotosToAlbum(id, ids);
        queryClient.invalidateQueries({ queryKey: ["album", id] });
      }
      e.target.value = "";
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to upload photo");
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
