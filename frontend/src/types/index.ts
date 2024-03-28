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

export interface NewOauthClient {
  name: string
  redirect: string
}

export interface EditOauthClient extends NewOauthClient {
  id: number
}

export interface AdminEditOauthClient extends EditOauthClient {
  secret: string
}

export interface OAuth2ClientInfo extends NewOauthClient {
  id: number
  userId: number
  secret: string
  createdAt: Date
  updatedAt: Date
}

export interface OAuth2ClientInfoRes extends NyaResponse {
  data: OAuth2ClientInfo[]
}

export interface OAuth2ClientLowInfoRes extends NyaResponse {
  data: {
    id: number
    createdAt: string
    name: string
  }
}

export interface OAuth2StateRes extends NyaResponse {
  data: {
    state: string
    code: string
  }
}

export interface StatisticRes extends NyaResponse {
  data: {
    oauth_clients: string
    user: string
    dailyRegStatistics: {
      date: string[]
      count: number[]
    }
  }
}
