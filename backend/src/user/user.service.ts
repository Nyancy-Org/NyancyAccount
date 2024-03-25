import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { db } from 'src/Service/mysql';
import bcrypt from 'bcryptjs';
import type { UserInfo, UpdateType } from './user.interface';
import { isEmail, validatePassword } from 'src/Utils';
import { AuthService as AuthServices } from 'src/auth/auth.service';
@Injectable()
export class UserService {
  constructor(private readonly AuthService: AuthServices) {}

  // 获取当前用户信息
  async info(session: Record<string, any>) {
    const [r]: UserInfo[] = await db.query('select * from user where id=?', [
      session.uid,
    ]);

    // 暂时不做记录
    // const ip = req.headers['x-real-ip'] || req.socket.remoteAddress;
    // const loginTime = Date.now().toString();
    // await db.query(
    //   'update user set lastLoginTime=?, lastLoginIp=? where id=?',
    //   [loginTime, ip, r.id],
    // );

    // 删除敏感信息
    delete r.password;
    delete r.verifyToken;

    // 然后再返回
    return {
      code: HttpStatus.OK,
      msg: '获取成功',
      time: Date.now(),
      data: r,
    };
  }

  // 根据更新类型来更新用户信息
  async update(
    session: Record<string, any>,
    type: UpdateType,
    body: { [propName: string]: unknown },
  ) {
    switch (type) {
      case 'name': {
        return await this.updateName(
          session,
          body as Pick<UserInfo, 'username'>,
        );
      }
      case 'email': {
        return await this.updateEmail(
          session,
          body as Pick<UserInfo, 'email'> & { code: string },
        );
      }
      case 'password': {
        return await this.updatePassword(
          session,
          body as {
            password: {
              old: string;
              new: string;
            };
          },
        );
      }
      case 'apikey': {
        return await this.updateApikey(
          session,
          body as Pick<UserInfo, 'apikey'>,
        );
      }
      default: {
        throw new Error('未知的类型');
      }
    }
  }

  // 更新用户名
  async updateName(
    session: Record<string, any>,
    body: Pick<UserInfo, 'username'>,
  ) {
    const [s] = await db.query(
      'select * from user where binary email=?',
      session.email,
    );
    if (s.username === body.username)
      throw new Error('与原用户名相符，无需更改');
    await this.validateUName(body.username as string);
    const n = await db.query(
      'select * from user where binary username=?',
      body.username,
    );
    if (n.length >= 1) throw new Error('该用户名已被占用，请换一个新的');
    const r = await db.query('update user set username=? where id=?', [
      body.username,
      session.uid,
    ]);
    if (r.affectedRows !== 1)
      throw new Error('发生了未知错误，请联系网站管理员');
    return {
      code: HttpStatus.OK,
      msg: '更新用户名成功',
      time: Date.now(),
    };
  }

  // 更新邮箱
  async updateEmail(
    session: Record<string, any>,
    body: {
      email: string;
      code: string;
    },
  ) {
    // 验证邮箱格式
    isEmail(body.email);

    if (!body.code) throw new Error('请输入验证码');

    // 验证验证码是否正确
    await this.AuthService.verifyEmailCode(
      session,
      body.email,
      body.code,
      'changeEmail',
    );

    const n = await db.query(
      'select * from user where binary email=?',
      body.email,
    );
    if (n.length >= 1) throw new Error('该邮箱已被其他用户绑定，请换一个新的');
    const r = await db.query('update user set email=? where id=?', [
      body.email,
      session.uid,
    ]);
    if (r.affectedRows !== 1)
      throw new Error('发生了未知错误，请联系网站管理员');

    session['email'] = body.email;

    return {
      code: HttpStatus.OK,
      msg: '更新邮箱成功',
      time: Date.now(),
    };
  }

  // 更新密码
  async updatePassword(
    session: Record<string, any>,
    body: {
      password: {
        old: string;
        new: string;
      };
    },
  ) {
    const [s] = await db.query('select * from user where id=?', session.uid);
    const compareResult = bcrypt.compareSync(body.password.old, s.password);
    if (!compareResult) throw new Error('原密码错误');
    validatePassword(body.password.new);
    body.password.new = bcrypt.hashSync(body.password.new, 10);
    const r = await db.query('update user set password=? where id=?', [
      body.password.new,
      session.uid,
    ]);
    if (r.affectedRows !== 1)
      throw new Error('发生了未知错误，请联系网站管理员');
    return {
      code: HttpStatus.OK,
      msg: '更新密码成功',
      time: Date.now(),
    };
  }

  // 更新 Apikey
  async updateApikey(
    session: Record<string, any>,
    body: Pick<UserInfo, 'apikey'>,
  ) {
    if (body.apikey === 'true') {
      let apikey;
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
      const r = await db.query('update user set apikey=? where id=?', [
        apikey,
        session.uid,
      ]);
      if (r.affectedRows !== 1)
        throw new Error('发生了未知错误，请联系网站管理员');
    } else {
      const r = await db.query(
        'update user set apikey="undefined" where id=?',
        [session.uid],
      );
      if (r.affectedRows !== 1)
        throw new Error('发生了未知错误，请联系网站管理员');
    }
    return {
      code: HttpStatus.OK,
      msg: '更新 Apikey 成功',
      time: Date.now(),
    };
  }

  /**
   * 管理员接口
   */
  // 根据UID获取用户信息
  async info_(uid: string) {
    const [r]: UserInfo[] = await db.query(
      'select * from user where id=?',
      `${uid}`,
    );
    return {
      code: HttpStatus.OK,
      msg: '获取成功',
      time: Date.now(),
      data: r,
    };
  }

  // 用户列表
  async list(
    page: number,
    pageSize: number,
    sortBy: string,
    sortDesc: string,
    search: string,
  ) {
    const totalCount = await db.query('SELECT COUNT(*) as count FROM user');
    if (pageSize == -1) {
      const r: UserInfo[] = await db.query('select * from user');
      return {
        code: HttpStatus.OK,
        msg: '获取成功',
        time: Date.now(),
        data: {
          totalCount: Number(totalCount[0].count),
          totalPages: 1,
          users: r,
        },
      };
    }
    const offset = (page - 1) * pageSize;
    const totalPages = Math.ceil(Number(totalCount[0].count) / pageSize);

    // 排序方式
    const sortOrder = sortDesc === 'true' ? 'DESC' : 'ASC';

    // 根据什么排序
    sortBy = sortBy ? sortBy : 'id';

    // 查询语句
    let query = `SELECT * FROM user`;

    // 构建搜索条件
    if (search) {
      query += ` WHERE id LIKE '%${search}%' OR username LIKE '%${search}%' OR status LIKE '%${search}%' OR role LIKE '%${search}%' OR email LIKE '%${search}%' OR apikey LIKE '%${search}%'`;
    }

    // 构建排序条件
    query += ` ORDER BY ${sortBy} ${sortOrder}`;

    // 添加翻页限制
    query += ` LIMIT ${pageSize} OFFSET ${offset}`;

    // const r = await db.query('select * from user LIMIT ?,?', [offset, Number(pageSize)])
    const r = await db.query(query);
    return {
      code: HttpStatus.OK,
      msg: '获取成功',
      time: Date.now(),
      data: {
        totalCount: Number(totalCount[0].count),
        totalPages: totalPages,
        users: r,
      },
    };
  }

  // 更新指定用户信息
  async update_(body: UserInfo) {
    // 验证用户名合法性
    const [n]: UserInfo[] = await db.query(
      'select * from user where id=?',
      body.id,
    );
    const nn: UserInfo[] = await db.query(
      'select * from user where binary username=?',
      body.username,
    );
    if (n.username !== nn[0].username) {
      await this.validateUName(body.username);
      if (nn.length >= 1) {
        throw new Error('该用户名已被占用，请换一个新的');
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
      code: HttpStatus.OK,
      msg: '更新成功',
      time: Date.now(),
    };
  }

  // 删除用户
  async delete(body: UserInfo) {
    const r = await db.query('delete from user where id=?', body.id);
    if (r.affectedRows !== 1)
      throw new Error('发生了未知错误，请联系网站管理员');
    return {
      code: HttpStatus.OK,
      msg: '删除成功',
      time: Date.now(),
    };
  }

  // 用户名格式验证
  async validateUName(uname: string) {
    // 判断禁止的用户名（待优化）
    if (uname === 'admin')
      throw new HttpException(
        {
          msg: '禁止该用户名',
        },
        HttpStatus.EXPECTATION_FAILED,
      );

    if (!/^[a-zA-Z0-9_-]{4,16}$/.test(uname))
      throw new HttpException(
        {
          msg: '用户名或密码不符合规范',
        },
        HttpStatus.EXPECTATION_FAILED,
      );

    return true;
  }

  // 生成APIKEY方法
  createApiKey(length: number) {
    let r = '';
    const c = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const cL = c.length;
    for (let i = 0; i < length; i++) {
      r += c.charAt(Math.floor(Math.random() * cL));
    }
    return r;
  }
}
