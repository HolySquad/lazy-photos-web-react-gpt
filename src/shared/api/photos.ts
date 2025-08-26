import { z } from "zod";
import { API_BASE_URL } from "../config";
import { getCookie, setAuthSession } from "../auth/session";
import { refreshAccessToken } from "./auth";
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
  displayFileName: z.string().nullable(),
  photoUrl: z.string().url().nullable(),
  blobId: z.string(),
  userId: z.string().nullable(),
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
    const status = (err as any)?.status as number | undefined;
    const body = (err as any)?.body as { message?: string } | undefined;
    if (status === 401 && body?.message === "expired") {
      const refreshToken = getCookie("refreshToken");
      const username = getCookie("username") || "";
      if (refreshToken) {
        try {
          const tokens = await refreshAccessToken(refreshToken);
          setAuthSession(tokens.accessToken, tokens.refreshToken ?? refreshToken, username);
          const retry = await PhotoService.latestPhotos();
          return PhotosSchema.parse(retry);
        } catch (refreshErr) {
          const rBody = (refreshErr as any)?.body as { message?: string } | undefined;
          const rMessage =
            rBody?.message ??
            (refreshErr instanceof Error
              ? refreshErr.message
              : "Failed to load photos");
          throw new Error(rMessage);
        }
      }
    }
    const message =
      body?.message ??
      (err instanceof Error ? err.message : "Failed to load photos");
    throw new Error(message);
  }
}
