export interface UserInfo {
  id: number;
  username: string;
  password: string;
  status: number;
  role: string;
  email: string;
  regTime: string;
  apikey: string;
  verifyToken?: string;
  authDevice?: string;
}

export type UpdateType = 'name' | 'email' | 'password' | 'apikey';

export interface LoginIP {
  id: number;
  uid: number;
  ip: string;
  location: string;
  time: Date;
}
