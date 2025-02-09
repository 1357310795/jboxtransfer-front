import { FileSystemItem } from "@/models/cloud/fs-item";
import { OutputDto } from "@/models/common";
import axios from "axios";

const baseurl = import.meta.env.VITE_API_URI;

//列出Jbox目录
export async function listJboxItems(path: string, page: number, pageSize: number) {
  try {
    const resp = await axios.get<OutputDto<FileSystemItem>>(
      baseurl + '/cloud/jbox/list' + `?path=${path}&page=${page}&pageSize=${pageSize}`,
      {withCredentials : true},
    )
    
    if (resp.status != 200) throw `请求失败`;
    if (resp.data.isError) throw `${resp.data.message}`;
    if (!resp.data.result) throw `数据为空`;

    return resp.data.result;
  } catch (error) {
    var errmessage = `列出目录失败：${error}`
    throw errmessage;
  }
};

//列出Tbox目录
export async function listTboxItems(path: string, page: number, pageSize: number) {
  try {
    const resp = await axios.get<OutputDto<FileSystemItem>>(
      baseurl + '/cloud/tbox/list' + `?path=${path}&page=${page}&pageSize=${pageSize}`,
      {withCredentials : true},
    )
    
    if (resp.status != 200) throw `请求失败`;
    if (resp.data.isError) throw `${resp.data.message}`;
    if (!resp.data.result) throw `数据为空`;

    return resp.data.result;
  } catch (error) {
    var errmessage = `列出目录失败：${error}`
    throw errmessage;
  }
};

//获取Jbox链接
export async function getJboxItemLink(path: string) {
  try {
    const resp = await axios.get<OutputDto<string>>(
      baseurl + '/cloud/jbox/link' + `?path=${path}`,
      {withCredentials : true},
    )
    
    if (resp.status != 200) throw `请求失败`;
    if (resp.data.isError) throw `${resp.data.message}`;
    if (!resp.data.result) throw `数据为空`;

    return resp.data.result;
  } catch (error) {
    var errmessage = `获取链接失败：${error}`
    throw errmessage;
  }
};

//获取Tbox链接
export async function getTboxItemLink(path: string) {
  try {
    const resp = await axios.get<OutputDto<string>>(
      baseurl + '/cloud/tbox/link' + `?path=${path}`,
      {withCredentials : true},
    )
    
    if (resp.status != 200) throw `请求失败`;
    if (resp.data.isError) throw `${resp.data.message}`;
    if (!resp.data.result) throw `数据为空`;

    return resp.data.result;
  } catch (error) {
    var errmessage = `获取链接失败：${error}`
    throw errmessage;
  }
};
