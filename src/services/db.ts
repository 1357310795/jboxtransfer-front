import { PartialListOutputDto } from "@/models/common";
import { SyncTaskDbModel } from "@/models/sync-task/sync-task";
import { objectToFormData } from "@/utils/formhelper";
import axios from "axios";

const baseurl = import.meta.env.VITE_API_URI;

//查询任务
export async function taskListSearch(data: any) {
  try {
    const resp = await axios.post<PartialListOutputDto<SyncTaskDbModel>>(
      baseurl + '/tasklist/querydb',
      objectToFormData(data),
      {withCredentials : true},
    )
    
    if (resp.status != 200) throw `请求失败`;
    if (resp.data.isError) throw `${resp.data.message}`;
    if (!resp.data.result) throw `数据为空`;

    return resp.data.result;
  } catch (error) {
    var errmessage = `查询任务失败：${error}`
    throw errmessage;
  }
};
