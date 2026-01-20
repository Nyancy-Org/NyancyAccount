import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'oauth_access_tokens' })
export class OauthAccessToken {
  @PrimaryKey({ length: 100, default: '' })
  id!: string;

  @Property({ nullable: true, fieldName: 'userId' })
  userId?: number;

  @Property({ default: 0, fieldName: 'clientId' })
  clientId!: number;

  @Property({ type: 'text', nullable: true })
  scopes?: string;

  @Property({ nullable: true, fieldName: 'createdAt' })
  createdAt?: Date;

  @Property({ nullable: true, fieldName: 'updatedAt' })
  updatedAt?: Date;

  @Property({ nullable: true, fieldName: 'expiredAt' })
  expiredAt?: Date;
}
