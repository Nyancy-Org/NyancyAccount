import { NyaResponse, UserInfoRes } from '@/types'
import { axios, defaultInterceptor, baseURL } from '@/utils/request'

// 请求地址前缀
axios.defaults.baseURL = baseURL + '/user'

// 个人信息
export const getUserInfoApi = async () => {
  // 有时候不需要弹窗
  axios.interceptors.response.eject(defaultInterceptor)
  const { data }: { data: UserInfoRes } = await axios.get('/info?t_=' + Date.now())
  return data
}
