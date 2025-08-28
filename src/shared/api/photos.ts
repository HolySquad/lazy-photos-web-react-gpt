import axios from "axios";
import { z } from "zod";
import { API_BASE_URL } from "../config";
import { getCookie } from "../auth/session";
import { apiRequest } from "./client";
import { PhotoService } from "./generated";


const PhotoMetadataSchema = z.object({
  cameraModel: z.string(),
  aperture: z.string(),
  shutterTime: z.string(),
  focusRange: z.number(),
  isoCount: z.number(),
});

export const PhotoSchema = z.object({
  id: z.number(),
  displayFileName: z.string().nullable(),
  photoUrl: z.string().url().nullable(),
  thumbnailUrl: z.string().url().nullable(),
  blobId: z.string(),
  userId: z.string().nullable(),
  createdAt: z.string(),
  photoMetadata: PhotoMetadataSchema,
});

const PhotosSchema = z.array(PhotoSchema);
export type Photo = z.infer<typeof PhotoSchema>;

const UploadPhotoResultSchema = z.union([
  z.object({ id: z.coerce.number() }),
  z
    .object({ photoId: z.coerce.number() })
    .transform((d) => ({ id: d.photoId })),
  z.coerce.number().transform((id) => ({ id })),
]);

export async function getPhotos(offset = 0, pageSize = 20): Promise<Photo[]> {
  try {
    const res = await apiRequest(() =>
      PhotoService.latestPhotos(offset, pageSize),
    );
    return PhotosSchema.parse(res);
  } catch (err) {
    const body = (err as any)?.body as { message?: string } | undefined;
    const message =
      body?.message ??
      (err instanceof Error ? err.message : "Failed to load photos");
    throw new Error(message);
  }
}

export async function uploadPhoto(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<number> {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const res = await apiRequest(() => {
      const token = getCookie("accessToken") || "";
      return axios.post(`${API_BASE_URL}/Photo`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (e) => {
          if (onProgress && e.total) {
            onProgress(Math.round((e.loaded / e.total) * 100));
          }
        },
      });
    });
    return UploadPhotoResultSchema.parse(res.data).id;
  } catch (err: any) {
    const body = err?.response?.data as { message?: string } | undefined;
    const message =
      body?.message ??
      (err instanceof Error ? err.message : "Failed to upload photo");
    throw new Error(message);
  }
}

export async function uploadPhotos(
  files: File[],
  onProgress?: (percent: number) => void,
): Promise<number[]> {
  const ids: number[] = [];
  for (let i = 0; i < files.length; i++) {
    const id = await uploadPhoto(files[i], (p) => {
      if (onProgress) {
        const total = files.length;
        const percent = Math.round(((i + p / 100) / total) * 100);
        onProgress(percent);
      }
    });
    ids.push(id);
  }
  return ids;
}
