import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'daily_statistics' })
export class DailyStatistic {
  @PrimaryKey({ type: 'date' })
  date!: string;

  @Property({ nullable: true })
  count?: number;
}
