/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AlbumModel } from '../models/AlbumModel';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AlbumPhotosService {
    /**
     * Adds one or more photos to the specified album.
     * This method invokes the album service to associate the specified photos with the given album.
     * Ensure that the album and photo identifiers are valid and that the user has the necessary permissions to modify
     * the album.
     * @param albumId The unique identifier of the album to which the photos will be added.
     * @param requestBody An array of unique identifiers representing the photos to add to the album.
     * @returns any OK
     * @throws ApiError
     */
    public static postAlbumPhotosPhotos(
        albumId: number,
        requestBody?: Array<number>,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/AlbumPhotos/{albumId}/photos',
            path: {
                'albumId': albumId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Adds one photo to the specified album.
     * This method invokes the album service to associate the specified photo with the given album.
     * Ensure that the album and photo identifiers are valid and that the user has the necessary permissions to modify
     * the album.
     * @param albumId The unique identifier of the album to which the photos will be added.
     * @param photoId The unique identifier representing the photo to add to the album.
     * @returns any OK
     * @throws ApiError
     */
    public static postAlbumPhotosPhotos1(
        albumId: number,
        photoId: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/AlbumPhotos/{albumId}/photos/{photoId}',
            path: {
                'albumId': albumId,
                'photoId': photoId,
            },
        });
    }
    /**
     * @param albumId
     * @param photoId
     * @returns any OK
     * @throws ApiError
     */
    public static deleteAlbumPhotosPhotos(
        albumId: number,
        photoId: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/AlbumPhotos/{albumId}/photos/{photoId}',
            path: {
                'albumId': albumId,
                'photoId': photoId,
            },
        });
    }
    /**
     * Retrieves an album by its unique identifier.
     * The id must correspond to an existing album in the system. If the album does
     * not exist, the response will indicate an error.
     * @param id The unique identifier of the album to retrieve.
     * @returns AlbumModel OK
     * @throws ApiError
     */
    public static getAlbumById(
        id: number,
    ): CancelablePromise<AlbumModel> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/AlbumPhotos/{id}/photos',
            path: {
                'id': id,
            },
        });
    }
}
