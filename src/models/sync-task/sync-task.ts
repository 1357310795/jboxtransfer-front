export type SyncTaskState = "Wait" | "Running" | "Error" | "Complete" | "Pause"
export type SyncTaskDbState = "Idle" | "Pending" | "Busy" | "Error" | "Done" | "Cancel"

export interface SyncTask {
    id: number;
    fileName: string;
    filePath: string;
    parentPath: string;
    progress: number;
    totalBytes: number;
    downloadedBytes: number;
    uploadedBytes: number;
    state: SyncTaskState;
    message: string;
    type: string;
}

export interface SyncTaskDbModel {
    id: number;
    fileName: string;
    filePath: string;
    parentPath: string;
    progress: number;
    state: SyncTaskDbState;
    message: string;
    type: string;
    creationTime: string;
    updateTime: string;
}