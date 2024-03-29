export interface OauthBody {
  grant_type: string;
  client_id: string;
  client_secret: string;
  redirect_uri: string;
  code: string;
}

export interface NewOauthClient {
  name: string;
  redirect: string;
}

export interface AdminEditOauthClient extends EditOauthClient {
  secret: string;
  userId: number;
}

export interface EditOauthClient extends NewOauthClient {
  id: number;
}

export interface OauthClientInfo extends NewOauthClient {
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
