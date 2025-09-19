import { Injectable } from '@nestjs/common';
import { db } from 'src/services/mysql';
import { SiteOptions } from './site.interface';
@Injectable()
export class SiteService {
  // 获取所有站点配置
  async options() {
    const r: SiteOptions[] = await db.query('select * from site');
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
    let r;
    r = await db.query(
      'UPDATE site SET note=?, value=?,updatedAt=?  where id=?',
      [body.note, body.value, new Date(), body.id],
    );
    if (r.affectedRows !== 1)
      throw new Error('发生了未知错误，请联系网站管理员');
    r = null;
    return {
      code: 200,
      msg: '更新成功',
      time: Date.now(),
    };
  }

  // 获取统计数据
  async getStatistic() {
    const r: { source: string; count: number }[] = await db.query(`
      SELECT 'oauth_clients' as source, COUNT(*) as count FROM oauth_clients
      UNION
      SELECT 'user' as source, COUNT(*) as count FROM user
    `);

    const dS: { date: Date; count: number }[] = await db.query(
      'SELECT * FROM daily_statistics ORDER BY date DESC LIMIT 7',
    );

    const transformedResult = dS.reduce((acc, entry) => {
      acc.push({ date: entry.date, count: entry.count });
      return acc;
    }, []);

    // 按照日期升序排序
    transformedResult.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });

    const dailyRegStatistics = transformedResult.reduce(
      (acc, entry) => {
        acc.date.push(entry.date.toLocaleDateString());
        acc.count.push(entry.count);
        return acc;
      },
      { date: [], count: [] },
    );

    const statistics = {
      oauth_clients: '',
      user: '',
      dailyRegStatistics,
    };

    r.forEach((row) => {
      if (row.source === 'oauth_clients') {
        statistics.oauth_clients = row.count.toString();
      } else if (row.source === 'user') {
        statistics.user = row.count.toString();
      }
    });

    return {
      status: true,
      code: 200,
      msg: '获取成功',
      time: Date.now(),
      data: statistics,
    };
  }
}
