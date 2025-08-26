/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UserService {
    /**
     * Retrieves the currently authenticated user.
     * This method returns the details of the user associated with the current
     * authentication context. If no user is authenticated, the method returns a 404 Not Found response.
     * @returns any OK
     * @throws ApiError
     */
    public static currentUser(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/User/currentUser',
        });
    }
}
