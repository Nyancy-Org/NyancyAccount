export interface OauthClientInfo {
  name: string;
  redirect: string;
  id: number;
  userId: number;
  secret: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CodeInfo {
  id: number;
  userId: number;
  clientId: string;
  scopes: any;
  expiredAt: Date;
}

export interface AccessTokenInfo {
  id: string;
  userId: number;
  clientId: number;
  scopes: null;
  createdAt: Date;
  updatedAt: Date;
  expiredAt: Date;
}

export interface RefreshTokenInfo {
  id: string;
  access_token_id: string;
  expiredAt: Date;
}
