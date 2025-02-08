export interface JaccountQrCodeDataDto {
    qrcode: string;
    uuid: string;
}

export interface UserInfoDto {
    name: string;
    role: string;
    jaccount: string;
    avatar: string;
}

export interface UserStatDto {
    totalTransferredBytes: number;
    jboxSpaceUsedBytes: number;
    onlyFullTransfer: boolean;
}