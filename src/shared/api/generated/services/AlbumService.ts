/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AlbumItemModel } from '../models/AlbumItemModel';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AlbumService {
    /**
     * Retrieves a list of available albums.
     * This method returns all albums currently available in the system. If no albums are available,
     * the response will contain an empty list.
     * @returns AlbumItemModel OK
     * @throws ApiError
     */
    public static getAlbums(): CancelablePromise<Array<AlbumItemModel>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Album',
        });
    }
    /**
     * Creates a new album with the specified name and associated photos.
     * This method creates a new album and associates the specified photos with it.  The album is
     * created asynchronously, and the operation can be canceled using the provided ct.
     * @param albumName The name of the album to create. Cannot be null or empty.
     * @param requestBody An array of photo IDs to associate with the album. The array can be empty, but cannot be null.
     * @returns any OK
     * @throws ApiError
     */
    public static postAlbum(
        albumName?: string,
        requestBody?: Array<number>,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Album',
            query: {
                'albumName': albumName,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Deletes the album with the specified identifier.
     * This operation is idempotent. If the specified album does not exist, the method still returns
     * Microsoft.AspNetCore.Mvc.NoContentResult.
     * @param albumId The unique identifier of the album to delete.
     * @returns any OK
     * @throws ApiError
     */
    public static deleteAlbum(
        albumId: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/Album/{albumId}',
            path: {
                'albumId': albumId,
            },
        });
    }
}
