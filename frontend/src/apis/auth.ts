import { LoginForm, NyaResponse, PublicKeyORes, RegForm, UserInfoRes } from '@/types'
import { axios } from '@/utils/request'
import { AxiosError } from 'axios'
import { AuthenticationResponseJSON } from '@simplewebauthn/types'

// 请求地址前缀
const baseURL = '/auth'

export type MailCodeType = 'reg' | 'changeEmail' | 'changePwd' | 'universal'
export type MailLinkType = 'resetPwd'

// 登录
export const loginApi = async (formData: LoginForm) => {
  const { data }: { data: UserInfoRes } = await axios.post(
    baseURL + '/login?t_=' + Date.now(),
    formData
  )
  return data
}

// 检查用户名
export const checkUNameApi = async (formData: Pick<RegForm, 'username'>) => {
  const { data }: { data: NyaResponse } = await axios.post(
    baseURL + '/checkUserName?t_=' + Date.now(),
    formData
  )
  return data
}

// 检查邮箱
export const checkEmailApi = async (formData: Pick<RegForm, 'email'>) => {
  const { data }: { data: NyaResponse } = await axios.post(
    baseURL + '/checkEmail?t_=' + Date.now(),
    formData
  )
  return data
}

// 发送邮箱验证码
export const sendEmailCodeApi = async (
  formData: Pick<RegForm, 'email'> & { type: MailCodeType }
) => {
  try {
    const res = await axios.post(baseURL + '/sendEmailCode?t_=' + Date.now(), formData)

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

// 发送邮箱验证地址
export const sendEmailLinkApi = async (
  formData: Pick<RegForm, 'email'> & { type: MailLinkType }
) => {
  try {
    const res = await axios.post(baseURL + '/sendEmailLink?t_=' + Date.now(), formData)

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
  const { data }: { data: NyaResponse } = await axios.post(
    baseURL + '/register?t_=' + Date.now(),
    formData
  )
  return data
}

// 登出
export const logoutApi = async () => {
  const { data }: { data: NyaResponse } = await axios.post(baseURL + '/logout?t_=' + Date.now())
  return data
}

// 重置密码
export const resetPwdApi = async (formData: RegForm) => {
  const { data }: { data: NyaResponse } = await axios.post(
    baseURL + '/reset?t_=' + Date.now(),
    formData
  )
  return data
}

// 获取 外部验证器 注册参数
export const getWebAuthnAuthOptionApi = async (formData: LoginForm) => {
  const { data }: { data: PublicKeyORes } = await axios.post(
    baseURL + '/registrationOptions?t_=' + Date.now(),
    {
      username: formData.username
    }
  )
  return data
}

// 验证 外部验证器
export const verifyWebAuthnApi = async (formData: AuthenticationResponseJSON) => {
  const { data }: { data: NyaResponse } = await axios.post(
    baseURL + '/verifyRegistration?t_=' + Date.now(),
    formData
  )
  return data
}
