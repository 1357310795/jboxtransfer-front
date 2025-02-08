import { ListOutputDto } from "../common";
import { SyncTask } from "./sync-task";

export interface SyncTaskListDto
{
  hasMore: boolean;
  isTooManyError: boolean;
  message: string;
  total: number;
  entities: SyncTask[];
}