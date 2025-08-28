"use client";
/* eslint-disable @next/next/no-img-element */
import React, { useRef, useEffect, useState } from "react";
import styles from "./photo-preview.module.css";

interface PhotoItem {
  src: string;
  alt?: string;
}

interface PhotoPreviewProps {
  photos: PhotoItem[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

export function PhotoPreview({
  photos,
  index,
  onClose,
  onPrev,
  onNext,
  actions,
  children,
}: PhotoPreviewProps) {
  const touchStartX = useRef<number | null>(null);
  const [hoverSide, setHoverSide] = useState<"left" | "right" | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 50) {
      if (delta < 0) {
        onNext();
      } else {
        onPrev();
      }
    }
    touchStartX.current = null;
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        onNext();
      } else if (e.key === "ArrowLeft") {
        onPrev();
      } else if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onNext, onPrev]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    setHoverSide(x < rect.width / 2 ? "left" : "right");
  };

  const handleMouseLeave = () => {
    setHoverSide(null);
  };

  return (
    <div
      className={styles.overlay}
      onClick={onClose}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <button
        className={`${styles.navButton} ${styles.prevButton} ${
          hoverSide === "left" ? styles.visible : ""
        }`}
        onClick={(e) => {
          e.stopPropagation();
          onPrev();
        }}
        aria-label="Previous photo"
      >
        ‹
      </button>
      <div
        className={styles.preview}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className={styles.topBar} onClick={(e) => e.stopPropagation()}>
          <button onClick={onClose} aria-label="Close preview">
            ←
          </button>
          {actions && <div className={styles.actions}>{actions}</div>}
        </div>
        <div
          className={styles.track}
          style={{ transform: `translateX(-${index * 100}vw)` }}
        >
          {photos.map((p, i) => (
            <img
              key={i}
              src={p.src}
              alt={p.alt ?? ""}
              className={styles.image}
            />
          ))}
        </div>
        {children}
      </div>
      <button
        className={`${styles.navButton} ${styles.nextButton} ${
          hoverSide === "right" ? styles.visible : ""
        }`}
        onClick={(e) => {
          e.stopPropagation();
          onNext();
        }}
        aria-label="Next photo"
      >
        ›
      </button>
    </div>
  );
}

export default PhotoPreview;
