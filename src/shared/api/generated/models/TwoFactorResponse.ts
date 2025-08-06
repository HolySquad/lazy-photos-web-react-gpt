/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type TwoFactorResponse = {
    sharedKey: string | null;
    recoveryCodesLeft: number;
    recoveryCodes?: Array<string> | null;
    isTwoFactorEnabled: boolean;
    isMachineRemembered: boolean;
};

