export interface FileSystemItem {
  name: string;
  fullPath: string;
  size: number;
  type: "File" | "Folder";
  creationTime?: string;
  updateTime?: string;
  contents?: FileSystemItem[];
  totalCount: number;
  syncState?: string;
}