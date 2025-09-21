import { LoginIPRes, NyaResponse, PublicKeyORes, UserInfo, UserInfoRes, UserListRes } from '@/types'
import { axios } from '@/utils/request'
import { RegistrationResponseJSON } from '@simplewebauthn/types'

// 请求地址前缀
const baseURL = '/user'

// 个人信息
export const getUserInfoApi = async () => {
  const {
    data
  }: {
    data: UserInfoRes & {
      data: {
        lastLoginIp: string
        lastLoginTime: Date
      }
    }
  } = await axios.get(baseURL + '/info?t_=' + Date.now())
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

// 获取 PassKey 注册参数
export const getWebAuthnRegOptionApi = async () => {
  const { data }: { data: PublicKeyORes } = await axios.get(
    baseURL + '/registrationOptions?t_=' + Date.now()
  )
  return data
}

// 验证 PassKey
export const verifyWebAuthnApi = async (formData: RegistrationResponseJSON) => {
  const { data }: { data: NyaResponse } = await axios.post(
    baseURL + '/verifyRegistration?t_=' + Date.now(),
    formData
  )
  return data
}

// 删除 PassKey
export const deleteWebAuthnApi = async (credentialID: string) => {
  const { data }: { data: NyaResponse } = await axios.delete(
    baseURL + '/deleteRegistration?t_=' + Date.now(),
    {
      data: {
        credentialID
      }
    }
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

// 更新用户信息
export const updateUserInfoApi = async (formData: UserInfo) => {
  const { data }: { data: NyaResponse } = await axios.put(baseURL + '/?t_=' + Date.now(), formData)
  return data
}

// 删除用户
export const delUserApi = async (formData: UserInfo) => {
  const { data }: { data: NyaResponse } = await axios.delete(baseURL + '/?t_=' + Date.now(), {
    data: {
      id: formData.id
    }
  })
  return data
}

// 登录日志（普通用户）
export const getUserLoginLogsApi = async (
  isAdmin = false,
  page: number,
  pageSize: number,
  sortBy: string,
  sortDesc: boolean,
  search?: string
) => {
  const url = isAdmin ? '/admin/loginLogs' : '/loginLogs'
  const { data }: { data: LoginIPRes } = await axios.get(baseURL + url + '?t_=' + Date.now(), {
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
