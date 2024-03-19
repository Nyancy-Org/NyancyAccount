import { NyaResponse, UserInfoRes } from '@/types'
import { axios } from '@/utils/request'

// 请求地址前缀
const baseURL = '/user'

// 个人信息
export const getUserInfoApi = async () => {
  const { data }: { data: UserInfoRes } = await axios.get(baseURL + '/info?t_=' + Date.now())
  return data
}

// 修改用户信息（普通用户）
export const updateUInfoApi = async (
  type: 'name' | 'email' | 'password' | 'apikey',
  formData: { [propName: string]: string }
) => {
  const { data }: { data: NyaResponse } = await axios.put(
    `${baseURL}/update/${type}?t_=${Date.now()}`,
    formData
  )
  return data
}
