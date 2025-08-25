/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AlbumService {
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static getAlbums(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Album',
        });
    }
    /**
     * @param id
     * @returns any OK
     * @throws ApiError
     */
    public static getAlbumById(
        id: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Album/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param albumName
     * @returns any OK
     * @throws ApiError
     */
    public static postAlbumCreateAlbum(
        albumName?: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Album/CreateAlbum',
            query: {
                'albumName': albumName,
            },
        });
    }
}
