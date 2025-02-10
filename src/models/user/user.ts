export interface JaccountQrCodeDataDto {
    qrcode: string;
    uuid: string;
}

export interface UserInfoDto {
    name: string;
    role: string;
    jaccount: string;
    avatar: string;
    preference: string;
}

export interface UserStatDto {
    totalTransferredBytes: number;
    jboxSpaceUsedBytes: number;
    onlyFullTransfer: boolean;
}

export interface UserPreferenceDto {
    concurrencyCount: number;
    conflictResolutionStrategy: string;
}