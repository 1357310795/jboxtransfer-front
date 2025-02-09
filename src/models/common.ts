export interface OutputDto<T> {
    statusCode: number;
    isError: boolean;
    errorCode: string | undefined;
    message: string | undefined;
    result: T | undefined
}

export interface ListOutputDto<T> {
    statusCode: number;
    isError: boolean;
    errorCode: string | undefined;
    message: string | undefined;
    result: {
        total: number;
        entities: T[];
    };
}

export interface PartialListOutputDto<T> {
    statusCode: number;
    isError: boolean;
    errorCode: string | undefined;
    message: string | undefined;
    result: {
        total: number;
        current: number;
        entities: T[];
    };
}