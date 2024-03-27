import { NyaResponse, OAuth2ClientInfo, OAuth2ClientInfoRes } from '@/types'
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
export const updateMyOAuth2AppApi = async (formData: OAuth2ClientInfo) => {
  const { data }: { data: NyaResponse } = await axios.put(
    userURL + '/client?t_=' + Date.now(),
    formData
  )
  return data
}
