import { z } from "zod";
import { API_BASE_URL } from "../config";
import { getCookie } from "../auth/session";
import { OpenAPI, AlbumService, AlbumPhotosService } from "./generated";
import { Photo, PhotoSchema } from "./photos";

OpenAPI.BASE = API_BASE_URL;
OpenAPI.TOKEN = async () => getCookie("accessToken") || "";

const AlbumSchema = z.object({
  id: z.number(),
  title: z.string(),
  photoCount: z.number(),
  thumbnailPath: z.string().nullable(),
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

export async function createAlbum(
  title: string,
  photoIds: number[] = [],
): Promise<void> {
  try {
    await AlbumService.postAlbum(title, photoIds);
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
    await AlbumService.deleteAlbum(id);
  } catch (err) {
    const body = (err as any)?.body as { message?: string } | undefined;
    const message =
      body?.message ??
      (err instanceof Error ? err.message : "Failed to delete album");
    throw new Error(message);
  }
}

export async function addPhotoToAlbum(
  albumId: number,
  photoId: number,
): Promise<void> {
  try {
    await AlbumPhotosService.postAlbumPhotosPhotos1(albumId, photoId);
  } catch (err) {
    const body = (err as any)?.body as { message?: string } | undefined;
    const message =
      body?.message ??
      (err instanceof Error ? err.message : "Failed to add photo to album");
    throw new Error(message);
  }
}

export async function getAlbumPhotos(albumId: number): Promise<Photo[]> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/AlbumPhotos/${albumId}/photos`,
      {
        method: "GET",
        headers: new Headers({
          Authorization: `Bearer ${getCookie("accessToken") || ""}`,
        }),
      },
    );
    const data = await res.json().catch(() => undefined);
    if (!res.ok) {
      const message = (data as any)?.message ?? res.statusText;
      throw new Error(message);
    }
    return z.array(PhotoSchema).parse(data);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to load album photos";
    throw new Error(message);
  }
}

