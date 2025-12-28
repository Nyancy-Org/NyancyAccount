import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'site' })
export class Site {
  @PrimaryKey()
  id!: number;

  @Property({ nullable: true })
  optionName?: string;

  @Property({ type: 'text', nullable: true })
  note?: string;

  @Property({ default: '', nullable: true })
  value?: string;

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
