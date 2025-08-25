import { z } from "zod";
import { API_BASE_URL } from "../config";
import { getCookie } from "../auth/session";
import { OpenAPI, AlbumService } from "./generated";
import { request as __request } from "./generated/core/request";

OpenAPI.BASE = API_BASE_URL;
OpenAPI.TOKEN = async () => getCookie("accessToken") || "";

const AlbumSchema = z.object({
  id: z.number(),
  name: z.string(),
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

export async function getAlbum(id: number): Promise<Album> {
  try {
    const res = await AlbumService.getAlbumById(id);
    return AlbumSchema.parse(res);
  } catch (err) {
    const body = (err as any)?.body as { message?: string } | undefined;
    const message =
      body?.message ??
      (err instanceof Error ? err.message : "Failed to load album");
    throw new Error(message);
  }
}

export async function createAlbum(albumName: string): Promise<Album> {
  try {
    const res = await AlbumService.postAlbumCreateAlbum(albumName);
    return AlbumSchema.parse(res);
  } catch (err) {
    const body = (err as any)?.body as { message?: string } | undefined;
    const message =
      body?.message ??
      (err instanceof Error ? err.message : "Failed to create album");
    throw new Error(message);
  }
}

export async function deleteAlbum(id: number): Promise<void> {
  try {
    await __request(OpenAPI, {
      method: "DELETE",
      url: "/Album/{id}",
      path: { id },
    });
  } catch (err) {
    const body = (err as any)?.body as { message?: string } | undefined;
    const message =
      body?.message ??
      (err instanceof Error ? err.message : "Failed to delete album");
    throw new Error(message);
  }
}

