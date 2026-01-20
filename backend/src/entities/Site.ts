import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'site' })
export class Site {
  @PrimaryKey()
  id!: number;

  @Property({ nullable: true, fieldName: 'optionName' })
  optionName?: string;

  @Property({ type: 'text', nullable: true })
  note?: string;

  @Property({ default: '', nullable: true })
  value?: string;

  @Property({ onUpdate: () => new Date(), fieldName: 'updatedAt' })
  updatedAt: Date = new Date();
}
