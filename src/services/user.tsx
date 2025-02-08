import { OutputDto } from "@/models/common";
import { JaccountQrCodeDataDto, UserInfoDto, UserStatDto } from "@/models/user/user";
import { objectToFormData } from "@/utils/formhelper";
import axios from "axios";

const baseurl = import.meta.env.VITE_API_URI;

//获取用户信息
export async function userGetInfo() {
  try {
    const resp = await axios.get<OutputDto<UserInfoDto>>(
      baseurl + '/user/info',
      {withCredentials : true}
    )
    
    if (resp.status != 200) throw `请求失败`;
    if (resp.data.errorCode == "NotLoginedError") throw `NotLoginedError`;
    if (resp.data.isError) throw `${resp.data.message}`;
    if (!resp.data.result) throw `数据为空`;

    return resp.data.result;
  } catch (error) {
    if (error == "NotLoginedError") throw error;
    var errmessage = `获取用户信息失败：${error}`
    throw errmessage;
  }
};

//登出
export async function userLogout() {
  try {
    const resp = await axios.post<OutputDto<boolean>>(
      baseurl + '/user/logout',
      {withCredentials : true}
    )
    
    if (resp.status != 200) throw `请求失败`;
    if (resp.data.isError) throw `${resp.data.message}`;
    if (!resp.data.result) throw `数据为空`;

    return resp.data.result;
  } catch (error) {
    var errmessage = `登出失败：${error}`
    throw errmessage;
  }
};

//JAccount二维码登录
export async function userLoginByJac() {
  try {
    const resp = await axios.get<OutputDto<JaccountQrCodeDataDto>>(
      baseurl + '/user/jaccount/getqrcode',
      {withCredentials : true}
    )
    
    if (resp.status != 200) throw `请求失败`;
    if (resp.data.isError) throw `${resp.data.message}`;
    if (!resp.data.result) throw `数据为空`;

    return resp.data.result;
  } catch (error) {
    var errmessage = `获取二维码失败：${error}`
    throw errmessage;
  }
};
  
//验证二维码登录
export async function userLoginByJacValidate(uuid: string) {
  try {
    const resp = await axios.get<OutputDto<boolean>>(
      baseurl + '/user/jaccount/validate' + `?uuid=${uuid}`,
      {withCredentials : true}
    )
    
    if (resp.status != 200) throw `请求失败`;
    if (resp.data.isError) throw `${resp.data.message}`;
    if (!resp.data.result) throw `数据为空`;

    return resp.data.result;
  } catch (error) {
    var errmessage = `验证失败：${error}`
    throw errmessage;
  }
};
  
//获取统计数据
export async function userGetStatistics() {
  try {
    const resp = await axios.get<OutputDto<UserStatDto>>(
      baseurl + '/user/stat',
      {withCredentials : true}
    )
    
    if (resp.status != 200) throw `请求失败`;
    if (resp.data.isError) throw `${resp.data.message}`;
    if (!resp.data.result) throw `数据为空`;

    return resp.data.result;
  } catch (error) {
    var errmessage = `获取统计数据失败：${error}`
    throw errmessage;
  }
};