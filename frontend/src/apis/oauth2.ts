import {
  NyaResponse,
  EditOauthClient,
  NewOauthClient,
  OAuth2ClientInfo,
  OAuth2ClientInfoRes,
  OAuth2ClientLowInfoRes,
  OAuth2StateRes,
  OAuth2AppsRes,
  AdminEditOauthClient
} from '@/types'
import { axios } from '@/utils/request'

// 请求地址前缀
const baseURL = '/oauth2'
const userURL = baseURL + '/user'
const adminURL = baseURL + '/admin'

// 获取我的 OAuth2 应用列表
export const getMyOAuth2AppsApi = async () => {
  const { data }: { data: OAuth2ClientInfoRes } = await axios.get(
    userURL + '/clients?t_=' + Date.now()
  )
  return data
}

// 更新我的 OAuth2 应用信息
export const updateMyOAuth2AppApi = async (formData: EditOauthClient) => {
  const { data }: { data: NyaResponse } = await axios.put(
    userURL + '/client?t_=' + Date.now(),
    formData
  )
  return data
}

// 新建 OAuth2 应用
export const newOAuth2AppApi = async (formData: NewOauthClient) => {
  const { data }: { data: NyaResponse } = await axios.post(
    userURL + '/client?t_=' + Date.now(),
    formData
  )
  return data
}

// 删除我的 OAuth2 应用
export const delMyOAuth2AppApi = async (formData: OAuth2ClientInfo) => {
  const { data }: { data: NyaResponse } = await axios.delete(userURL + '/client?t_=' + Date.now(), {
    data: { id: formData.id }
  })
  return data
}

// 获取 OAuth2 应用信息
export const getOAuth2AppInfoApi = async (client_id: string) => {
  try {
    const { data }: { data: OAuth2ClientLowInfoRes } = await axios.get(
      `${baseURL}/client/${client_id}?t_=${Date.now()}`
    )
    return data
  } catch (err: any) {
    return err.response.data as NyaResponse
  }
}

// 获取 code
export const getCodeApi = async (client_id: string, state: string, redirect_uri: string) => {
  const { data }: { data: OAuth2StateRes } = await axios.post(
    `${baseURL}/authorize/?client_id=${client_id}&response_type=code&scope=&state=${state ?? ''}&redirect_uri=${redirect_uri}`
  )
  return data
}

// 获取 OAuth2 应用列表
export const getOAuth2AppsApi = async (
  page: number,
  pageSize: number,
  sortBy: string,
  sortDesc: boolean,
  search?: string
) => {
  const { data }: { data: OAuth2AppsRes } = await axios.get(
    adminURL + '/clients?t_=' + Date.now(),
    {
      params: {
        page,
        pageSize,
        sortBy,
        sortDesc,
        search
      }
    }
  )
  return data
}

// 更新 OAuth2 应用信息
export const updateOAuth2AppApi = async (formData: AdminEditOauthClient) => {
  const { data }: { data: NyaResponse } = await axios.put(
    adminURL + '/client?t_=' + Date.now(),
    formData
  )
  return data
}

// 删除 OAuth2 应用
export const delOAuth2AppApi = async (formData: OAuth2ClientInfo) => {
  const { data }: { data: NyaResponse } = await axios.delete(
    adminURL + '/client?t_=' + Date.now(),
    {
      data: { id: formData.id }
    }
  )
  return data
}

// 重置 OAuth2 应用密钥
export const resetOAuth2SecretApi = async (formData: AdminEditOauthClient) => {
  const { data }: { data: NyaResponse } = await axios.put(`${userURL}/client/reset/${formData.id}`)
  return data
}
