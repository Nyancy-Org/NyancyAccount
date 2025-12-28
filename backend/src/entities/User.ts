import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'user' })
export class User {
  @PrimaryKey()
  id!: number;

  @Property({ nullable: true })
  username?: string;

  @Property({ nullable: true })
  password?: string;

  @Property({ nullable: true })
  status?: number;

  @Property({ nullable: true })
  role?: string;

  @Property({ nullable: true })
  email?: string;

  @Property({ length: 60, nullable: true })
  regTime?: string;

  @Property({ nullable: true })
  apikey?: string;

  @Property({ nullable: true })
  verifyToken?: string;

  @Property({ type: 'text', nullable: true })
  authDevice?: string;
}
