import { Injectable } from '@nestjs/common';
import { db } from 'src/services/mysql';
import bcrypt from 'bcryptjs';
import type { LoginIP, UserInfo } from './user.interface';
import { UserService } from './user.service';
import {
  DeleteUserAdminDto,
  LoginLogDto,
  UpdateUserAdminDto,
} from './user.dto';

@Injectable()
export class UserAdminService extends UserService {
  // 用户列表
  async list(
    page: number,
    pageSize: number,
    sortBy: string,
    sortDesc: boolean,
    search: string,
  ) {
    // const { page, pageSize } = validateSearchQuery(page_, pageSize_);

    let totalCount = await db.query('SELECT COUNT(*) as count FROM user');
    if (pageSize == -1) {
      const r: UserInfo[] = await db.query('select * from user');
      return {
        msg: '获取成功',
        data: {
          totalCount: Number(totalCount[0].count),
          totalPages: 1,
          users: r,
        },
      };
    }

    let totalPages = Math.ceil(Number(totalCount[0].count) / pageSize);

    // 排序方式
    const sortOrder = sortDesc ? 'DESC' : 'ASC';

    // 根据什么排序
    sortBy = sortBy ? sortBy : 'id';

    // 查询语句
    let query = `SELECT * FROM user`;

    // 构建搜索条件
    if (search) {
      const s = ` WHERE id LIKE '%${search}%' OR username LIKE '%${search}%' OR status LIKE '%${search}%' OR role LIKE '%${search}%' OR email LIKE '%${search}%' OR apikey LIKE '%${search}%'`;
      query += s;
      totalCount = await db.query(`SELECT COUNT(*) as count FROM user${s}`);
      totalPages = Math.ceil(Number(totalCount[0].count) / pageSize);
    }

    if (totalPages !== 0 && page > totalPages) throw new Error('超出页数');
    const offset = (page - 1) * pageSize;

    // 构建排序条件
    query += ` ORDER BY ${sortBy} ${sortOrder}`;

    // 添加翻页限制
    query += ` LIMIT ${pageSize} OFFSET ${offset}`;

    const r = await db.query(query);
    return {
      msg: '获取成功',
      data: {
        totalCount: Number(totalCount[0].count),
        totalPages: totalPages,
        users: r,
      },
    };
  }

  // 更新指定用户信息
  async update_(body: UpdateUserAdminDto) {
    // 验证用户名合法性
    const [n]: UserInfo[] = await db.query(
      'select * from user where id=?',
      body.id,
    );
    const nn: UserInfo[] = await db.query(
      'select * from user where binary username=?',
      body.username,
    );
    if (nn.length !== 0) {
      if (n.username !== nn[0].username) {
        await this.validateUName(body.username);
        if (nn.length >= 1) {
          throw new Error('该用户名已被占用，请换一个新的');
        }
      }
    }

    // 用户名合法性验证通过

    // 验证密码合法性
    /*
    没有传passwd？ {
      Yes, Sir! 没穿 {
        那就 传进来的passwd = 数据库中的password
      } 传了{
        传进来的passwd = 数据库中的password 吗？ {
          是(没有更改密码) {
            传进来的passwd = 数据库中的password
          } 不然(那就是新密码咯) {
            body.password = bcrypt.hashSync(body.password, 10)
          }
        }
      }
    }
    */
    !body.password
      ? (body.password = n.password)
      : body.password !== n.password
        ? (body.password = bcrypt.hashSync(body.password, 10))
        : (body.password = n.password);

    // 判断APIKEY状态
    let apikey: string;
    if (body.apikey === 'true') {
      let isUnique = false;
      while (!isUnique) {
        apikey = this.createApiKey(32);
        const existingUser = await db.query(
          'select * from user where binary apikey=?',
          [apikey],
        );
        if (existingUser.length === 0) {
          isUnique = true;
        }
      }
    } else if (body.apikey === 'false') {
      apikey = 'undefined';
    } else {
      apikey = n.apikey;
    }
    // APIKEY生成完毕

    // MariaDB中不支持将整个对象作为参数传递给 SET 子句。（划掉，懒得改了）
    const sql = `UPDATE user SET username = "${body.username}", password = "${body.password}", email = "${body.email}", status = "${body.status}", role = "${body.role}", apikey="${apikey}" where id=${body.id}`;

    // 更新用户数据
    const r = await db.query(sql);
    if (r.affectedRows !== 1)
      throw new Error('发生了未知错误，请联系网站管理员');
    return {
      msg: '更新成功',
    };
  }

  // 删除用户
  async delete(body: DeleteUserAdminDto) {
    const r = await db.query('delete from user where id=?', body.id);
    if (r.affectedRows !== 1)
      throw new Error('发生了未知错误，请联系网站管理员');
    return {
      msg: '删除成功',
    };
  }

  // 登录日志
  async adminLoginLog(q: LoginLogDto) {
    const { page, pageSize, sortBy, sortDesc, search } = q;

    let totalCount = await db.query('SELECT COUNT(*) as count FROM user_ip ');

    if (pageSize == -1) {
      const r: LoginIP[] = await db.query('select * FROM user_ip ');
      return {
        msg: '获取成功',
        data: {
          totalCount: Number(totalCount[0].count),
          totalPages: 1,
          records: r,
        },
      };
    }

    let totalPages = Math.ceil(Number(totalCount[0].count) / pageSize);

    // 排序方式
    const sortOrder = sortDesc ? 'DESC' : 'ASC';

    // 根据什么排序
    const sortByKey = sortBy ? sortBy : 'id';

    // 查询语句
    let query = `SELECT * FROM user_ip`;

    // 构建搜索条件
    if (search) {
      const s = ` WHERE id LIKE '%${search}%' OR ip LIKE '%${search}%' OR location LIKE '%${search}%' OR device LIKE '%${search}%' OR time LIKE '%${search}%'`;
      query += s;
      totalCount = await db.query(`SELECT COUNT(*) as count FROM user_ip${s}`);
      totalPages = Math.ceil(Number(totalCount[0].count) / pageSize);
    }

    if (totalPages !== 0 && page > totalPages) throw new Error('超出页数');
    const offset = (page - 1) * pageSize;

    // 构建排序条件
    query += ` ORDER BY ${sortByKey} ${sortOrder}`;

    // 添加翻页限制
    query += ` LIMIT ${pageSize} OFFSET ${offset}`;

    const r = await db.query(query);

    return {
      msg: '获取成功',
      data: {
        totalCount: Number(totalCount[0].count),
        totalPages,
        records: r,
      },
    };
  }
}
