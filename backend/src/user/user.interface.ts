export interface UserInfo {
  id: number;
  username: string;
  password: string;
  status: number;
  role: string;
  email: string;
  regTime: string;
  lastLoginTime: string;
  lastLoginIp: string;
  apikey: string;
  verifyToken?: string;
  authDevice?: string;
}

export type UpdateType = 'name' | 'email' | 'password' | 'apikey';
