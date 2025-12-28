import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'oauth_access_tokens' })
export class OauthAccessToken {
  @PrimaryKey({ length: 100, default: '' })
  id!: string;

  @Property({ nullable: true })
  userId?: number;

  @Property({ default: 0 })
  clientId!: number;

  @Property({ type: 'text', nullable: true })
  scopes?: string;

  @Property({ nullable: true })
  createdAt?: Date;

  @Property({ nullable: true })
  updatedAt?: Date;

  @Property({ nullable: true })
  expiredAt?: Date;
}
