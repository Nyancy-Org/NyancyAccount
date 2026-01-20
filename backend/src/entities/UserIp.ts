import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'user_ip' })
export class UserIp {
  @PrimaryKey()
  id!: number;

  @Property({ nullable: true })
  uid?: number;

  @Property({ type: 'text', nullable: true })
  ip?: string;

  @Property({ default: '', nullable: true })
  location?: string;

  @Property({ type: 'text', nullable: true })
  device?: string;

  @Property({ nullable: true })
  time?: Date;
}
