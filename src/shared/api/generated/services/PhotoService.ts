/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PhotoModel } from '../models/PhotoModel';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class PhotoService {
    /**
     * Retrieves the latest photos with pagination support.
     * This method supports pagination by using the offset and pageSize parameters. The photos are retrieved in descending order of their creation or upload
     * time.
     * @param offset The zero-based index of the first photo to retrieve. Must be non-negative.
     * @param pageSize The maximum number of photos to retrieve. If less than or equal to 0, a default value of 20 is used.
     * @returns PhotoModel OK
     * @throws ApiError
     */
    public static latestPhotos(
        offset?: number,
        pageSize?: number,
    ): CancelablePromise<Array<PhotoModel>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Photo',
            query: {
                'offset': offset,
                'pageSize': pageSize,
            },
        });
    }
    /**
     * Uploads a photo to the server and processes it asynchronously.
     * The uploaded photo is processed using the provided Microsoft.AspNetCore.Http.IFormFile stream.
     * Ensure that the file is not null and contains valid data before calling this method.
     * @param formData
     * @returns any OK
     * @throws ApiError
     */
    public static uploadPhoto(
        formData?: {
            /**
             * The photo file to be uploaded. Must be a valid Microsoft.AspNetCore.Http.IFormFile instance.
             */
            file?: Blob;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Photo',
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
    /**
     * Retrieves a photo by its unique identifier.
     * This method returns an HTTP 200 OK response with the photo data if the photo is
     * found, or an HTTP 404 Not Found response if the photo does not exist.
     * @param id The unique identifier of the photo to retrieve. Must be a positive long value.
     * @returns PhotoModel OK
     * @throws ApiError
     */
    public static getPhotoById(
        id: number,
    ): CancelablePromise<PhotoModel> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Photo/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Not Found`,
            },
        });
    }
}
