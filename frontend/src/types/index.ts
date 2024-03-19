import Normal from '@/views/auth/Normal.vue'

export interface LoginForm {
  username: string
  password: string
}

export interface RegForm extends LoginForm {
  code: string
  email: string
}

export interface NyaResponse {
  code: number
  msg: string
  time: string
  data: any
}

export enum UserStatus {
  BANNED = -1,
  NORMAL
}

export interface UserInfo {
  id: number
  username: string
  password?: string
  status: UserStatus
  role: string
  email: string
  regTime: string
  apikey: string
  verifyToken?: string
}

export interface UserInfoRes extends NyaResponse {
  data: UserInfo
}
