import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'oauth_auth_codes' })
export class OauthAuthCode {
  @PrimaryKey({ length: 100 })
  id!: string;

  @Property()
  userId!: number;

  @Property({ nullable: true })
  clientId?: number;

  @Property({ type: 'text', nullable: true })
  scopes?: string;

  @Property({ nullable: true })
  expiredAt?: Date;
}
