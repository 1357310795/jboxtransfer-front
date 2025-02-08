import { ListOutputDto, OutputDto } from "@/models/common";
import { SyncTask } from "@/models/sync-task/sync-task";
import { SyncTaskListDto } from "@/models/sync-task/sync-task-list";
import { objectToFormData } from "@/utils/formhelper";
import axios from "axios";

const baseurl = import.meta.env.VITE_API_URI;

//获取任务列表信息
export async function taskListInfo(type: string) {
  try {
    const resp = await axios.get<OutputDto<SyncTaskListDto>>(
      baseurl + '/tasklist/list?type=' + type,
      {withCredentials : true}
    )
    
    if (resp.status != 200) throw `请求失败`;
    if (resp.data.errorCode == "NotLoginedError") throw `NotLoginedError`;
    if (resp.data.isError) throw `${resp.data.message}`;
    if (!resp.data.result) throw `数据为空`;

    return resp.data.result;
  } catch (error) {
    if (error == "NotLoginedError") throw error;
    var errmessage = `获取任务列表失败：${error}`
    throw errmessage;
  }
};

//启动队列
export async function taskListStartAll() {
  try {
    const resp = await axios.post<OutputDto<boolean>>(
      baseurl + '/tasklist/startall',
      {withCredentials : true}
    )
    
    if (resp.status != 200) throw `请求失败`;
    if (resp.data.isError) throw `${resp.data.message}`;
    if (!resp.data.result) throw `数据为空`;

    return resp.data.result;
  } catch (error) {
    var errmessage = `启动队列失败：${error}`
    throw errmessage;
  }
};

//暂停队列
export async function taskListPauseAll() {
  try {
    const resp = await axios.post<OutputDto<boolean>>(
      baseurl + '/tasklist/pauseall',
      {withCredentials : true}
    )
    
    if (resp.status != 200) throw `请求失败`;
    if (resp.data.isError) throw `${resp.data.message}`;
    if (!resp.data.result) throw `数据为空`;

    return resp.data.result;
  } catch (error) {
    var errmessage = `暂停队列失败：${error}`
    throw errmessage;
  }
};

//删除所有任务
export async function taskListCancelAll() {
  try {
    const resp = await axios.post<OutputDto<boolean>>(
      baseurl + '/tasklist/cancelall',
      {withCredentials : true}
    )
    
    if (resp.status != 200) throw `请求失败`;
    if (resp.data.isError) throw `${resp.data.message}`;
    if (!resp.data.result) throw `数据为空`;

    return resp.data.result;
  } catch (error) {
    var errmessage = `删除所有任务失败：${error}`
    throw errmessage;
  }
};

//重试所有失败任务
export async function taskListRestartAllErr(keepProgress: boolean) {
  try {
    const resp = await axios.post<OutputDto<boolean>>(
      baseurl + '/tasklist/restartallerr' + `?keepProgress=${keepProgress}`,
      {withCredentials : true}
    )
    
    if (resp.status != 200) throw `请求失败`;
    if (resp.data.isError) throw `${resp.data.message}`;
    if (!resp.data.result) throw `数据为空`;

    return resp.data.result;
  } catch (error) {
    var errmessage = `重试所有失败任务失败：${error}`
    throw errmessage;
  }
};

//取消所有失败任务
export async function taskListCancelAllErr() {
  try {
    const resp = await axios.post<OutputDto<boolean>>(
      baseurl + '/tasklist/cancelallerr',
      {withCredentials : true}
    )
    
    if (resp.status != 200) throw `请求失败`;
    if (resp.data.isError) throw `${resp.data.message}`;
    if (!resp.data.result) throw `数据为空`;

    return resp.data.result;
  } catch (error) {
    var errmessage = `取消所有失败任务失败：${error}`
    throw errmessage;
  }
};

//删除已完成任务
export async function taskListDeleteAllDone() {
  try {
    const resp = await axios.post<OutputDto<boolean>>(
      baseurl + '/tasklist/deletealldone',
      {withCredentials : true}
    )
    
    if (resp.status != 200) throw `请求失败`;
    if (resp.data.isError) throw `${resp.data.message}`;
    if (!resp.data.result) throw `数据为空`;

    return resp.data.result;
  } catch (error) {
    var errmessage = `删除已完成任务失败：${error}`
    throw errmessage;
  }
};

