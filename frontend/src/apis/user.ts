import { NyaResponse, PublicKeyORes, UserInfoRes, UserListRes } from '@/types'
import { axios } from '@/utils/request'
import { RegistrationResponseJSON } from '@simplewebauthn/types'

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

// 获取 外部验证器 注册参数
export const getWebAuthnRegOptionApi = async () => {
  const { data }: { data: PublicKeyORes } = await axios.get(
    baseURL + '/registrationOptions?t_=' + Date.now()
  )
  return data
}

// 验证 外部验证器
export const verifyWebAuthnApi = async (formData: RegistrationResponseJSON) => {
  const { data }: { data: NyaResponse } = await axios.post(
    baseURL + '/verifyRegistration?t_=' + Date.now(),
    formData
  )
  return data
}

// 删除 外部验证器
export const deleteWebAuthnApi = async () => {
  const { data }: { data: NyaResponse } = await axios.delete(
    baseURL + '/deleteRegistration?t_=' + Date.now()
  )
  return data
}

// 用户列表
export const getUserListApi = async (
  page: number,
  pageSize: number,
  sortBy: string,
  sortDesc: boolean,
  search?: string
) => {
  const { data }: { data: UserListRes } = await axios.get(baseURL + '/list?t_=' + Date.now(), {
    params: {
      page,
      pageSize,
      sortBy,
      sortDesc,
      search
    }
  })
  return data
}
