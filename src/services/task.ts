import { ListOutputDto, OutputDto } from "@/models/common";
import { SyncTask, SyncTaskDbModel } from "@/models/sync-task/sync-task";
import { objectToFormData } from "@/utils/formhelper";
import axios from "axios";

const baseurl = import.meta.env.VITE_API_URI;

//获取任务信息
export async function taskInfo(id: number) {
  try {
    const resp = await axios.get<OutputDto<SyncTask>>(
      baseurl + '/task/info?id=' + id.toString(),
      {withCredentials : true}
    )
    
    if (resp.status != 200) throw `请求失败`;
    if (resp.data.errorCode == "NotLoginedError") throw `NotLoginedError`;
    if (resp.data.isError) throw `${resp.data.message}`;
    if (!resp.data.result) throw `数据为空`;

    return resp.data.result;
  } catch (error) {
    if (error == "NotLoginedError") throw error;
    var errmessage = `获取任务信息失败：${error}`
    throw errmessage;
  }
};

//添加任务
export async function taskAdd(path: string) {
  try {
    const resp = await axios.post<OutputDto<SyncTaskDbModel>>(
      baseurl + '/task/add',
      objectToFormData({
        path: path
      }),
      {withCredentials : true}
    )
    
    if (resp.status != 200) throw `请求失败`;
    if (resp.data.isError) throw `${resp.data.message}`;
    if (!resp.data.result) throw `数据为空`;

    return resp.data.result;
  } catch (error) {
    var errmessage = `启动任务失败：${error}`
    throw errmessage;
  }
};

//启动任务
export async function taskStart(id: number) {
  try {
    const resp = await axios.post<OutputDto<boolean>>(
      baseurl + '/task/start',
      objectToFormData({
        id: id
      }),
      {withCredentials : true}
    )
    
    if (resp.status != 200) throw `请求失败`;
    if (resp.data.isError) throw `${resp.data.message}`;
    if (!resp.data.result) throw `数据为空`;

    return resp.data.result;
  } catch (error) {
    var errmessage = `启动任务失败：${error}`
    throw errmessage;
  }
};

//暂停任务
export async function taskPause(id: number) {
  try {
    const resp = await axios.post<OutputDto<boolean>>(
      baseurl + '/task/pause',
      objectToFormData({
        id: id
      }),
      {withCredentials : true}
    )
    
    if (resp.status != 200) throw `请求失败`;
    if (resp.data.isError) throw `${resp.data.message}`;
    if (!resp.data.result) throw `数据为空`;

    return resp.data.result;
  } catch (error) {
    var errmessage = `暂停任务失败：${error}`
    throw errmessage;
  }
};

//删除任务
export async function taskCancel(id: number) {
  try {
    const resp = await axios.post<OutputDto<boolean>>(
      baseurl + '/task/cancel',
      objectToFormData({
        id: id
      }),
      {withCredentials : true}
    )
    
    if (resp.status != 200) throw `请求失败`;
    if (resp.data.isError) throw `${resp.data.message}`;
    if (!resp.data.result) throw `数据为空`;

    return resp.data.result;
  } catch (error) {
    var errmessage = `删除任务失败：${error}`
    throw errmessage;
  }
};

//重试失败任务
export async function taskRestartErr(id: number, keepProgress: boolean) {
  try {
    const resp = await axios.post<OutputDto<boolean>>(
      baseurl + '/task/restarterr',
      objectToFormData({
        id: id,
        keepProgress: keepProgress
      }),
      {withCredentials : true}
    )
    
    if (resp.status != 200) throw `请求失败`;
    if (resp.data.isError) throw `${resp.data.message}`;
    if (!resp.data.result) throw `数据为空`;

    return resp.data.result;
  } catch (error) {
    var errmessage = `重试失败任务失败：${error}`
    throw errmessage;
  }
};

//取消失败任务
export async function taskCancelErr(id: number) {
  try {
    const resp = await axios.post<OutputDto<boolean>>(
      baseurl + '/task/cancelerr',
      objectToFormData({
        id: id,
      }),
      {withCredentials : true}
    )
    
    if (resp.status != 200) throw `请求失败`;
    if (resp.data.isError) throw `${resp.data.message}`;
    if (!resp.data.result) throw `数据为空`;

    return resp.data.result;
  } catch (error) {
    var errmessage = `取消失败任务失败：${error}`
    throw errmessage;
  }
};

//优先传输
export async function taskSetTop(id: number) {
  try {
    const resp = await axios.post<OutputDto<boolean>>(
      baseurl + '/task/settop',
      objectToFormData({
        id: id,
      }),
      {withCredentials : true}
    )
    
    if (resp.status != 200) throw `请求失败`;
    if (resp.data.isError) throw `${resp.data.message}`;
    if (!resp.data.result) throw `数据为空`;

    return resp.data.result;
  } catch (error) {
    var errmessage = `优先传输失败：${error}`
    throw errmessage;
  }
};

//恢复取消的任务
export async function taskRenew(id: number) {
  try {
    const resp = await axios.post<OutputDto<boolean>>(
      baseurl + '/task/renew',
      objectToFormData({
        id: id,
      }),
      {withCredentials : true}
    )
    
    if (resp.status != 200) throw `请求失败`;
    if (resp.data.isError) throw `${resp.data.message}`;
    if (!resp.data.result) throw `数据为空`;

    return resp.data.result;
  } catch (error) {
    var errmessage = `恢复任务失败：${error}`
    throw errmessage;
  }
};
