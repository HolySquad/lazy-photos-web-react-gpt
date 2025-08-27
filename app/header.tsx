"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import styles from "./header.module.css";
import {
  getCookie,
  clearAuthSession,
  onAuthSessionChange,
} from "@/shared/auth/session";
import { uploadPhotos } from "@/shared/api/photos";
import { addPhotosToAlbum } from "@/shared/api/albums";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  useEffect(() => {
    const update = () => setUsername(getCookie("username"));
    update();
    return onAuthSessionChange(update);
  }, []);

  const handleLogout = () => {
    clearAuthSession();
    router.push("/");
  };

  const handleUploadClick = () => fileInputRef.current?.click();

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
      if (pathname.startsWith("/albums/")) {
        const parts = pathname.split("/");
        const id = Number(parts[2]);
        if (!Number.isNaN(id) && uploaded.length) {
          await addPhotosToAlbum(id, uploaded);
          queryClient.invalidateQueries({ queryKey: ["album", id] });
        }
      } else {
        queryClient.invalidateQueries({ queryKey: ["photos"] });
      }
      e.target.value = "";
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to upload photo");
    } finally {
      setUploadProgress(null);
    }
  };

  if (!username) {
    return <header className={styles.header} />;
  }

  return (
    <header className={styles.header}>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handlePhotoUpload}
        style={{ display: "none" }}
      />
      <button onClick={handleUploadClick} className={styles.uploadButton}>
      Upload
      </button>
      {uploadProgress !== null && (
        <div className={styles.uploadProgress}>
          <progress value={uploadProgress} max={100} />
          <span>{uploadProgress}%</span>
        </div>
      )}
      <div className={styles.userMenu}>
        <span className={styles.user}>{username}</span>
        <button onClick={handleLogout} className={styles.logout}>
          Logout
        </button>
      </div>
    </header>
  );
}
