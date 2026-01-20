import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'oauth_auth_codes' })
export class OauthAuthCode {
  @PrimaryKey({ length: 100 })
  id!: string;

  @Property({ fieldName: 'userId' })
  userId!: number;

  @Property({ nullable: true, fieldName: 'clientId' })
  clientId?: number;

  @Property({ type: 'text', nullable: true })
  scopes?: string;

  @Property({ nullable: true, fieldName: 'expiredAt' })
  expiredAt?: Date;
}
