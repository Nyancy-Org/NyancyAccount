import { LoginForm, NyaResponse, RegForm, UserInfoRes } from '@/types'
import { axios, baseURL } from '@/utils/request'
import { AxiosError } from 'axios'

// 请求地址前缀
axios.defaults.baseURL = baseURL + '/auth'

export type MailCodeType = 'reg' | 'changeEmail' | 'changePwd' | 'universal'
export type MailLinkType = 'resetPwd'

// 登录
export const loginApi = async (formData: LoginForm) => {
  const { data }: { data: UserInfoRes } = await axios.post('/login?t_=' + Date.now(), formData)
  return data
}

// 检查用户名
export const checkUNameApi = async (formData: Pick<RegForm, 'username'>) => {
  const { data }: { data: NyaResponse } = await axios.post(
    '/checkUserName?t_=' + Date.now(),
    formData
  )
  return data
}

// 检查邮箱
export const checkEmailApi = async (formData: Pick<RegForm, 'email'>) => {
  const { data }: { data: NyaResponse } = await axios.post('/checkEmail?t_=' + Date.now(), formData)
  return data
}

// 发送邮箱验证码
export const sendEmailCodeApi = async (
  formData: Pick<RegForm, 'email'> & { type: MailCodeType }
) => {
  try {
    const res = await axios.post('/sendEmailCode?t_=' + Date.now(), formData)

    const data: NyaResponse = res.data
    const retryAfter = res.headers['retry-after']

    return {
      data,
      retryAfter
    }
  } catch (err: any) {
    const error: AxiosError = err
    return {
      data: error.response?.data as NyaResponse,
      retryAfter: error.response?.headers['retry-after']
    }
  }
}

// 注册
export const regApi = async (formData: RegForm) => {
  const { data }: { data: NyaResponse } = await axios.post('/register?t_=' + Date.now(), formData)
  return data
}

// 登出
export const logoutApi = async () => {
  const { data }: { data: NyaResponse } = await axios.post('/logout?t_=' + Date.now())
  return data
}
