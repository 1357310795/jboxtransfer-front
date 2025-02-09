import { ListOutputDto } from "../common";
import { SyncTask } from "./sync-task";

export interface SyncTaskListDto
{
  hasMore: boolean;
  isTooManyError: boolean;
  message: string;
  runningCount: number;
  completedCount: number;
  errorCount: number;
  total: number;
  entities: SyncTask[];
}