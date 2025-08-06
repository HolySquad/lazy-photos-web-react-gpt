/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AccessTokenResponse } from '../models/AccessTokenResponse';
import type { ForgotPasswordRequest } from '../models/ForgotPasswordRequest';
import type { InfoRequest } from '../models/InfoRequest';
import type { InfoResponse } from '../models/InfoResponse';
import type { LoginRequest } from '../models/LoginRequest';
import type { RefreshRequest } from '../models/RefreshRequest';
import type { RegisterRequest } from '../models/RegisterRequest';
import type { ResendConfirmationEmailRequest } from '../models/ResendConfirmationEmailRequest';
import type { ResetPasswordRequest } from '../models/ResetPasswordRequest';
import type { TwoFactorRequest } from '../models/TwoFactorRequest';
import type { TwoFactorResponse } from '../models/TwoFactorResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class LazyMyPhotosApiService {
    /**
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public static postRegister(
        requestBody?: RegisterRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/register',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request`,
            },
        });
    }
    /**
     * @param useCookies
     * @param useSessionCookies
     * @param requestBody
     * @returns AccessTokenResponse OK
     * @throws ApiError
     */
    public static postLogin(
        useCookies?: boolean,
        useSessionCookies?: boolean,
        requestBody?: LoginRequest,
    ): CancelablePromise<AccessTokenResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/login',
            query: {
                'useCookies': useCookies,
                'useSessionCookies': useSessionCookies,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param requestBody
     * @returns AccessTokenResponse OK
     * @throws ApiError
     */
    public static postRefresh(
        requestBody?: RefreshRequest,
    ): CancelablePromise<AccessTokenResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/refresh',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param userId
     * @param code
     * @param changedEmail
     * @returns any OK
     * @throws ApiError
     */
    public static mapIdentityApiConfirmEmail(
        userId?: string,
        code?: string,
        changedEmail?: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/confirmEmail',
            query: {
                'userId': userId,
                'code': code,
                'changedEmail': changedEmail,
            },
        });
    }
    /**
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public static postResendConfirmationEmail(
        requestBody?: ResendConfirmationEmailRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/resendConfirmationEmail',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public static postForgotPassword(
        requestBody?: ForgotPasswordRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/forgotPassword',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request`,
            },
        });
    }
    /**
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public static postResetPassword(
        requestBody?: ResetPasswordRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/resetPassword',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request`,
            },
        });
    }
    /**
     * @param requestBody
     * @returns TwoFactorResponse OK
     * @throws ApiError
     */
    public static postManage2Fa(
        requestBody?: TwoFactorRequest,
    ): CancelablePromise<TwoFactorResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/manage/2fa',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request`,
                404: `Not Found`,
            },
        });
    }
    /**
     * @returns InfoResponse OK
     * @throws ApiError
     */
    public static getManageInfo(): CancelablePromise<InfoResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/manage/info',
            errors: {
                400: `Bad Request`,
                404: `Not Found`,
            },
        });
    }
    /**
     * @param requestBody
     * @returns InfoResponse OK
     * @throws ApiError
     */
    public static postManageInfo(
        requestBody?: InfoRequest,
    ): CancelablePromise<InfoResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/manage/info',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request`,
                404: `Not Found`,
            },
        });
    }
}
