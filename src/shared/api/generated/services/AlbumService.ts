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
    public static getApiAlbum(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/Album',
        });
    }
    /**
     * @param albumName
     * @returns any OK
     * @throws ApiError
     */
    public static postApiAlbum(
        albumName?: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/Album',
            query: {
                'albumName': albumName,
            },
        });
    }
    /**
     * @param id
     * @returns any OK
     * @throws ApiError
     */
    public static getApiAlbum1(
        id: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/Album/{id}',
            path: {
                'id': id,
            },
        });
    }
}
