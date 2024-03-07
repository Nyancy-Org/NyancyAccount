import { Injectable } from '@nestjs/common';
import { db } from 'src/Service/mysql';
import { SiteOptions } from './site.interface';
@Injectable()
export class SiteService {
  // 获取站点配置
  async info() {
    const r: SiteOptions[] = await db.query('select * from site');
    return {
      code: 200,
      msg: '获取成功',
      time: new Date().getTime(),
      data: r,
    };
  }

  // 更新配置信息
  async update_(body: SiteOptions) {
    // 更新数据
    let r;
    r = await db.query('UPDATE site SET note=?, value=? where id=?', [
      body.note,
      body.value,
      body.id,
    ]);
    if (r.affectedRows !== 1)
      throw new Error('发生了未知错误，请联系网站管理员');
    r = null;
    return {
      code: 200,
      msg: '更新成功',
      time: new Date().getTime(),
    };
  }
}
