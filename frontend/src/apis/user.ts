import { NyaResponse, UserInfoRes } from '@/types'
import { axios, baseURL } from '@/utils/request'

// 请求地址前缀
axios.defaults.baseURL = baseURL + '/user'

// 个人信息
export const getUserInfoApi = async () => {
  const { data }: { data: UserInfoRes } = await axios.get('/info?t_=' + Date.now())
  return data
}
