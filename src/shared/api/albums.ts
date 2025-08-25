import { z } from "zod";
import { API_BASE_URL } from "../config";
import { getCookie } from "../auth/session";
import { OpenAPI, AlbumService } from "./generated";

OpenAPI.BASE = API_BASE_URL;
OpenAPI.TOKEN = async () => getCookie("accessToken") || "";

const RawAlbumSchema = z.object({
  id: z.number(),
  name: z.string(),
  count: z.number().optional(),
  photosCount: z.number().optional(),
  thumb: z.string().url().optional(),
  thumbnailUrl: z.string().url().optional(),
});

const AlbumsSchema = z.array(RawAlbumSchema);

export type Album = {
  id: number;
  name: string;
  count: number;
  thumb?: string;
};

export async function getAlbums(): Promise<Album[]> {
  try {
    const res = await AlbumService.getAlbums();
    const raw = AlbumsSchema.parse(res);
    return raw.map((a) => ({
      id: a.id,
      name: a.name,
      count: a.count ?? a.photosCount ?? 0,
      thumb: a.thumb ?? a.thumbnailUrl,
    }));
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

