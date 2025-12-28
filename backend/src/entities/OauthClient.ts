import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'oauth_clients' })
export class OauthClient {
  @PrimaryKey()
  id!: number;

  @Property({ nullable: true, fieldName: 'userId' })
  userId?: number;

  @Property({ default: '' })
  name!: string;

  @Property({ length: 100, default: '' })
  secret!: string;

  @Property({ type: 'text' })
  redirect!: string;

  @Property({ nullable: true, fieldName: 'createdAt' })
  createdAt?: Date;

  @Property({ nullable: true, fieldName: 'updatedAt' })
  updatedAt?: Date;
}
