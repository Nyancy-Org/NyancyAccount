import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Site } from 'src/entities/Site';
import { User } from 'src/entities/User';
import { OauthClient } from 'src/entities/OauthClient';
import { DailyStatistic } from 'src/entities/DailyStatistic';
import { SiteOptions } from './site.interface';

@Injectable()
export class SiteService {
  constructor(private readonly em: EntityManager) {}

  // 获取所有站点配置
  async options() {
    const r = await this.em.find(Site, {});
    return {
      code: 200,
      msg: '获取成功',
      time: Date.now(),
      data: r,
    };
  }

  // 更新配置信息
  async update_(body: SiteOptions) {
    // 更新数据
    const site = await this.em.findOne(Site, { id: body.id });
    if (!site) {
      throw new Error('发生了未知错误，请联系网站管理员');
    }

    site.note = body.note;
    site.value = body.value;
    // updatedAt will be updated automatically by onUpdate hook in entity

    await this.em.flush();

    return {
      code: 200,
      msg: '更新成功',
      time: Date.now(),
    };
  }

  // 获取统计数据
  async getStatistic() {
    const oauthClientsCount = await this.em.count(OauthClient);
    const userCount = await this.em.count(User);

    const dS = await this.em.find(
      DailyStatistic,
      {},
      { orderBy: { date: 'DESC' }, limit: 7 },
    );

    const transformedResult = dS.map((entry) => ({
      date: entry.date,
      count: entry.count,
    }));

    // 按照日期升序排序
    transformedResult.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });

    const dailyRegStatistics = transformedResult.reduce(
      (acc, entry) => {
        acc.date.push(new Date(entry.date).toLocaleDateString());
        acc.count.push(entry.count);
        return acc;
      },
      { date: [], count: [] },
    );

    const statistics = {
      oauth_clients: oauthClientsCount.toString(),
      user: userCount.toString(),
      dailyRegStatistics,
    };

    return {
      status: true,
      code: 200,
      msg: '获取成功',
      time: Date.now(),
      data: statistics,
    };
  }
}
