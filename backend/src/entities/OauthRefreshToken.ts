import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'oauth_refresh_tokens' })
export class OauthRefreshToken {
  @PrimaryKey({ length: 100 })
  id!: string;

  @Property({ length: 100 })
  access_token_id!: string;

  @Property({ nullable: true, fieldName: 'expiredAt' })
  expiredAt?: Date;
}
