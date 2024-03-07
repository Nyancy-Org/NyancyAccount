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
}

export type UpdateType = 'name' | 'email' | 'password' | 'apikey';
