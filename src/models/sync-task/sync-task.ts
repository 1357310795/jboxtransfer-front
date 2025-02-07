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

export type SyncTaskState = "Wait" | "Running" | "Error" | "Complete" | "Pause"

export interface SyncTaskDbModel {
    //Todo
}