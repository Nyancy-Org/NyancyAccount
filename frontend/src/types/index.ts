import type { PublicKeyCredentialCreationOptionsJSON } from '@simplewebauthn/types'

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
  lastLoginTime: string
  lastLoginIp: string
  apikey: string
  verifyToken?: string
  authDevice?: string
}

export interface UserInfoRes extends NyaResponse {
  data: UserInfo
}

export interface PublicKeyORes extends NyaResponse {
  data: PublicKeyCredentialCreationOptionsJSON
}

export interface OAuth2ClientInfo {
  id: number
  userId: number
  name: string
  secret: string
  redirect: string
  createdAt: Date
  updatedAt: Date
}

export interface OAuth2ClientInfoRes extends NyaResponse {
  data: OAuth2ClientInfo[]
}
