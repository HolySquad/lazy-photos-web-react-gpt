import { z } from "zod";
import { API_BASE_URL } from "../config";
import { getCookie } from "../auth/session";
import { OpenAPI, PhotoService } from "./generated";

OpenAPI.BASE = API_BASE_URL;
OpenAPI.TOKEN = async () => getCookie("accessToken") || "";

const PhotoMetadataSchema = z.object({
  cameraModel: z.string(),
  aperture: z.string(),
  shutterTime: z.string(),
  focusRange: z.number(),
  isoCount: z.number(),
});

export const PhotoSchema = z.object({
  id: z.number(),
  displayFileName: z.string(),
  photoUrl: z.string().url(),
  blobId: z.string(),
  userId: z.string(),
  createdAt: z.string(),
  photoMetadata: PhotoMetadataSchema,
});

const PhotosSchema = z.array(PhotoSchema);
export type Photo = z.infer<typeof PhotoSchema>;

export async function getPhotos(): Promise<Photo[]> {
  try {
    const res = await PhotoService.latestPhotos();
    return PhotosSchema.parse(res);
  } catch (err) {
    const body = (err as any)?.body as { message?: string } | undefined;
    const message =
      body?.message ??
      (err instanceof Error ? err.message : "Failed to load photos");
    throw new Error(message);
  }
}
