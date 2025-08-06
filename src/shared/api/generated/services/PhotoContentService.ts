/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class PhotoContentService {
    /**
     * @param id
     * @returns any OK
     * @throws ApiError
     */
    public static getApiPhotoContent(
        id: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/PhotoContent/{id}',
            path: {
                'id': id,
            },
        });
    }
}
