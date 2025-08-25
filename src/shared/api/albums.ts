import { z } from "zod";
import { API_BASE_URL } from "../config";
import { getCookie } from "../auth/session";
import { OpenAPI, AlbumService } from "./generated";

OpenAPI.BASE = API_BASE_URL;
OpenAPI.TOKEN = async () => getCookie("accessToken") || "";

const AlbumSchema = z.object({
  id: z.number(),
  name: z.string(),
  count: z.number(),
  thumb: z.string().url().optional(),
});

const AlbumsSchema = z.array(AlbumSchema);
export type Album = z.infer<typeof AlbumSchema>;

export async function getAlbums(): Promise<Album[]> {
  try {
    const res = await AlbumService.getAlbums();
    return AlbumsSchema.parse(res);
  } catch (err) {
    const body = (err as any)?.body as { message?: string } | undefined;
    const message =
      body?.message ??
      (err instanceof Error ? err.message : "Failed to load albums");
    throw new Error(message);
  }
}

export async function createAlbum(name: string): Promise<void> {
  try {
    await AlbumService.postAlbumCreateAlbum(name);
  } catch (err) {
    const body = (err as any)?.body as { message?: string } | undefined;
    const message =
      body?.message ??
      (err instanceof Error ? err.message : "Failed to create album");
    throw new Error(message);
  }
}

