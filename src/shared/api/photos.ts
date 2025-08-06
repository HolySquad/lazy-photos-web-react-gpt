import { z } from "zod";
import { API_BASE_URL } from "../config";
import { getCookie } from "../auth/session";
import { OpenAPI, PhotoService } from "./generated";

OpenAPI.BASE = API_BASE_URL;
OpenAPI.TOKEN = async () => getCookie("accessToken") || "";

const PhotoSchema = z.object({
  id: z.number(),
  url: z.string().url(),
});

const PhotosSchema = z.array(PhotoSchema);
export type Photo = z.infer<typeof PhotoSchema>;

export async function getPhotos(): Promise<Photo[]> {
  try {
    const res = await PhotoService.getApiPhoto();
    return PhotosSchema.parse(res);
  } catch (err) {
    const body = (err as any)?.body as { message?: string } | undefined;
    const message =
      body?.message ??
      (err instanceof Error ? err.message : "Failed to load photos");
    throw new Error(message);
  }
}
