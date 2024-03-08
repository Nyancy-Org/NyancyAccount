export interface LoginForm {
  username: string
  password: string
}

export interface NyaResponse {
  code: number
  msg: string
  time: string
  data: any
}

export interface UserInfo {
  id: number
  username: string
  password?: string
  status: number
  role: string
  email: string
  regTime: string
  apikey: string
  verifyToken?: string
}

export interface UserInfoRes extends NyaResponse {
  data: UserInfo
}
