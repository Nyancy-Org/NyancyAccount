import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { db } from 'src/Service/mysql';
import {
  isSafeData,
  objIsEmpty,
  randomString,
  validateSearchQuery,
} from 'src/Utils';
import type {
  CodeInfo,
  OauthBody,
  OauthClientInfo,
  AccessTokenInfo,
  // RefreshTokenInfo,
  NewOauthClient,
  EditOauthClient,
  AdminEditOauthClient,
} from './oauth2.interface';
import type { UserInfo } from 'src/modules/user/user.interface';
import { logger } from 'src/Utils/log';

@Injectable()
export class Oauth2Service {
  // 获取应用信息
  async clientInfo(clientId: string, isInternal = false) {
    // 从数据库中查询
    const o: OauthClientInfo[] = await db.query(
      `select * from oauth_clients where id=?`,
      [clientId],
    );

    if (o.length === 0)
      throw new HttpException({ msg: '客户端不存在' }, HttpStatus.NOT_FOUND);

    // 删除敏感信息
    if (!isInternal) {
      delete o[0].secret;
      delete o[0].updatedAt;
      delete o[0].userId;
      delete o[0].redirect;
    }

    return {
      code: 200,
      msg: '获取成功',
      data: o[0],
    };
  }

  // 生成授权 Code
  async authorize(
    session: Record<string, any>,
    client_id: string,
    redirect_uri: string,
    response_type: string,
    scope: string, // 权限细分，懒得做
    state: string,
  ) {
    if (!client_id)
      throw new HttpException(
        { msg: '请填写客户端ID' },
        HttpStatus.EXPECTATION_FAILED,
      );
    if (!redirect_uri)
      throw new HttpException(
        {
          msg: '请填写回调地址',
        },
        HttpStatus.EXPECTATION_FAILED,
      );
    if (response_type !== 'code')
      throw new HttpException(
        {
          msg: '不支持的响应类型',
        },
        HttpStatus.EXPECTATION_FAILED,
      );

    const { data: o } = await this.clientInfo(client_id, true);

    if (o.redirect !== redirect_uri)
      throw new HttpException(
        {
          msg: '重定向Url不匹配',
        },
        HttpStatus.EXPECTATION_FAILED,
      );

    // 获取用户ID
    const [u]: UserInfo[] = await db.query('select * from user where id=?', [
      session['uid'],
    ]);

    // 判断该用户是否存在 code
    const ac: CodeInfo[] = await db.query(
      'select * from oauth_auth_codes where userId=?',
      [u.id],
    );

    // 如果存在,则删除之前的 code
    if (ac.length > 0) {
      const d = await db.query('delete from oauth_auth_codes where userId=?', [
        u.id,
      ]);
      if (d.affectedRows !== 1) throw new Error('[OAuth] 恭喜，你数据库没了');
    }

    // 生成授权 Code
    const code = '0' + randomString(66).toLowerCase() + Date.now();

    let i;
    try {
      i = await db.query(
        'insert into oauth_auth_codes (id,userId,clientId,scopes,expiredAt) values (?,?,?,?,?)',
        [code, u.id, o.id, null, new Date(Date.now() + 60 * 3000)], //三分钟后过期
      );
    } catch (e) {
      logger.error(e);

      return {
        code: 500,
        msg: e.message,
        time: Date.now(),
      };
    }

    // 返回授权code
    if (i.affectedRows === 1) {
      return {
        code: 200,
        msg: '获取成功',
        data: {
          state,
          code,
        },
      };
    } else {
      throw new Error('添加失败，可能数据库炸了');
    }
  }

  // 验证code,返回token
  async getToken(session: Record<string, any>, body: OauthBody) {
    if (!body.client_id)
      throw new HttpException(
        {
          msg: '请填写客户端ID',
        },
        HttpStatus.EXPECTATION_FAILED,
      );
    if (!body.client_secret)
      throw new HttpException(
        {
          msg: '请填写客户端密钥',
        },
        HttpStatus.EXPECTATION_FAILED,
      );
    if (!body.redirect_uri)
      throw new HttpException(
        {
          msg: '请填写回调地址',
        },
        HttpStatus.EXPECTATION_FAILED,
      );
    if (body.grant_type !== 'authorization_code')
      throw new HttpException(
        {
          msg: '不支持的数据类型',
        },
        HttpStatus.EXPECTATION_FAILED,
      );
    // TODO: refresh_token
    // if (body.grant_type !== 'refresh_token') {
    // }

    if (!body.code)
      throw new HttpException(
        {
          msg: '无效的 Code',
        },
        HttpStatus.EXPECTATION_FAILED,
      );
    await isSafeData(body);

    // 数据库比对client是否存在
    const [oc]: OauthClientInfo[] = await db.query(
      `select * from oauth_clients where id=?`,
      [body.client_id],
    );

    if (!oc) throw new Error('客户端不存在');

    if (oc.secret !== body.client_secret) throw new Error('客户端密钥错误');

    if (oc.redirect !== body.redirect_uri)
      throw new Error('重定向 Url 地址错误');

    // 检查code是否存在
    const ac: CodeInfo[] = await db.query(
      'select * from oauth_auth_codes where binary id=?',
      [body.code],
    );

    if (ac.length === 0) throw new Error('Code 不存在');
    if (ac.length > 1) throw new Error('[OAuth] 数据库炸了，请联系管理员');

    // 检查 code 是否过期
    // 目标时间
    const targetTime = new Date(ac[0].expiredAt);
    // 当前时间
    const currentTime = new Date();
    if (targetTime < currentTime) {
      // 过期了就删除
      const d = await db.query(
        'delete from oauth_auth_codes where binary id=?',
        [body.code],
      );
      if (d.affectedRows !== 1) throw new Error('[OAuth] 恭喜，你数据库没了');
      throw new HttpException(
        { msg: 'Code 已过期' },
        HttpStatus.PRECONDITION_FAILED,
      );
    }

    // 生成 accessToken
    const accessToken =
      'NYANCY_' + randomString(79).toLowerCase() + '_ACCESS_TOKEN';
    // 生成 refreshToken
    const refreshToken =
      'NYANCY_' + randomString(78).toLowerCase() + '_REFRESH_TOKEN';

    // 到期时间
    const AtExpiredAt = new Date(new Date().setDate(new Date().getDate() + 7)); //7天后过期

    // 判断是否存在assessToken或者refreshToken
    // const act: AccessTokenInfo[] = await db.query(
    //   'select * from oauth_access_tokens where id=?',
    //   [accessToken],
    // );
    // const rct: RefreshTokenInfo[] = await db.query(
    //   'select * from oauth_refresh_tokens where id=?',
    //   [refreshToken],
    // );
    // TODO: 存在，更新

    // 不存在。插入
    let iAT;
    let iRT;
    try {
      iAT = await db.query(
        'insert into oauth_access_tokens (id,userId,clientId,scopes,createdAt,updatedAt,expiredAt) values (?,?,?,?,?,?,?)',
        [
          accessToken,
          ac[0].userId,
          ac[0].clientId,
          null,
          new Date(),
          new Date(),
          AtExpiredAt,
        ],
      );

      iRT = await db.query(
        'insert into oauth_refresh_tokens (id,access_token_id,expiredAt) values (?,?,?)',
        [
          refreshToken,
          accessToken,
          new Date(new Date().setDate(new Date().getDate() + 30)), //30天后过期
        ],
      );
    } catch (e) {
      logger.error(e);

      return {
        code: 500,
        msg: e.message,
        time: Date.now(),
      };
    }

    // 返回授权code
    if (iAT.affectedRows !== 1 || iRT.affectedRows !== 1) {
      throw new Error('Token获取失败，可能数据库炸了');
    }

    return {
      access_token: accessToken,
      refresh_token: refreshToken, // 30天
      expires_in: 604800, // 7天
    };
  }

  // TODO:刷新 token
  async refreshToken(refreshToken: string) {
    console.log(refreshToken);
    return {};
  }

  // 返回用户信息
  async userInfo(session: Record<string, any>, authorization: string) {
    // todo: 检查Content-Type是不是application/x-www-form-urlencoded

    if (!authorization) throw new Error('Authorization Empty');
    // 检查 Authorization 头是否以 Bearer 开头
    const [bearer, accessToken] = authorization.split(' ');
    if (bearer !== 'Bearer' || !accessToken) {
      throw new Error('Authorization 格式错误');
    }

    // 检查 accessToken是否过期
    const [act]: AccessTokenInfo[] = await db.query(
      'select * from oauth_access_tokens where binary id=?',
      [accessToken],
    );

    if (!act)
      throw new HttpException(
        { msg: 'access_token 已过期' },
        HttpStatus.PRECONDITION_FAILED,
      );

    // 目标时间
    const targetTime = new Date(act.expiredAt);

    // 获取当前时间
    const currentTime = new Date();

    if (targetTime < currentTime) {
      // 过期了就删除
      const d = await db.query(
        'delete from oauth_access_tokens where binary id=?',
        [accessToken],
      );
      if (d.affectedRows !== 1)
        throw new Error('[OAuth User] 恭喜，你数据库没了');
      throw new HttpException(
        { msg: 'access_token 已过期' },
        HttpStatus.PRECONDITION_FAILED,
      );
    }

    // 获取用户信息
    const r: UserInfo[] = await db.query('select * from user where id=?', [
      act.userId,
    ]);
    delete r[0].password;
    delete r[0].verifyToken;
    delete r[0].apikey;
    delete r[0].authDevice;
    return {
      code: 200,
      msg: '获取成功',
      time: Date.now(),
      data: r[0],
    };
  }

  /**
   * 个人用户
   */
  // 获取自己创建的oauth2应用
  async myClients(session: Record<string, any>) {
    // 根据id查找应用
    const c: OauthClientInfo[] = await db.query(
      'select * from oauth_clients where userId=?',
      [session['uid']],
    );

    return {
      code: 200,
      msg: '获取成功',
      time: Date.now(),
      data: c,
    };
  }

  // 新建一个oauth2应用
  async createClient(session: Record<string, any>, body: NewOauthClient) {
    // 检查表单是否为空
    if (!body.name)
      throw new HttpException(
        { msg: '请填写应用名' },
        HttpStatus.EXPECTATION_FAILED,
      );
    if (body.name.length > 32)
      throw new HttpException(
        { msg: '应用名过长！' },
        HttpStatus.EXPECTATION_FAILED,
      );
    if (!body.redirect)
      throw new HttpException(
        { msg: '请填写回调Url' },
        HttpStatus.EXPECTATION_FAILED,
      );
    if (body.redirect.length > 2333)
      throw new HttpException(
        { msg: '重定向地址过长！' },
        HttpStatus.EXPECTATION_FAILED,
      );

    // 验证数据安全性
    await isSafeData(body);

    // 获取用户ID
    const uid = session['uid'];

    let i;
    try {
      i = await db.query(
        'insert into oauth_clients (userId,name,secret,redirect,createdAt,updatedAt) values (?,?,?,?,?,?)',
        [
          uid,
          body.name,
          randomString(40),
          body.redirect,
          new Date(),
          new Date(),
        ],
      );
    } catch (e) {
      return {
        status: false,
        code: 500,
        msg: e.message,
        time: Date.now(),
      };
    }

    if (i.affectedRows === 1) {
      return {
        code: 200,
        msg: '添加成功',
        time: Date.now(),
      };
    } else {
      throw new Error('添加失败，可能数据库炸了');
    }
  }

  // 编辑自己的oauth2应用
  async editMyClient(session: Record<string, any>, body: EditOauthClient) {
    // 检查表单是否为空
    if (!body.id)
      throw new HttpException(
        { msg: 'ID 不能为空' },
        HttpStatus.EXPECTATION_FAILED,
      );
    if (String(body.id).length > 10)
      throw new HttpException(
        { msg: 'ID 过长！' },
        HttpStatus.EXPECTATION_FAILED,
      );
    if (!body.name)
      throw new HttpException(
        { msg: '请填写应用名' },
        HttpStatus.EXPECTATION_FAILED,
      );
    if (body.name.length > 32)
      throw new HttpException(
        { msg: '应用名过长！' },
        HttpStatus.EXPECTATION_FAILED,
      );

    if (!body.redirect)
      throw new HttpException(
        { msg: '请填写回调Url' },
        HttpStatus.EXPECTATION_FAILED,
      );
    if (body.redirect.length > 2333)
      throw new HttpException(
        { msg: '重定向地址过长！' },
        HttpStatus.EXPECTATION_FAILED,
      );

    // 验证数据安全性
    await isSafeData(body);

    // 获取用户ID
    const uid = session['uid'];

    // 检查body的id是否为该用户所拥有的
    const bI: { id: number; userId: number }[] = await db.query(
      'select id,userId from oauth_clients where id=?',
      [body.id],
    );

    const areAllUidsEqual = bI.every((item) => item.userId === uid);

    if (!areAllUidsEqual) throw new Error('你无权修改该应用');

    const r = await db.query(
      'update oauth_clients set name=?,redirect=?,updatedAt=? where id=?',
      [body.name, body.redirect, new Date(), body.id],
    );
    if (r.affectedRows !== 1) throw new Error('恭喜，你数据库没了');
    return {
      code: 200,
      msg: '更新成功',
      time: Date.now(),
    };
  }

  // 删除自己的oauth2应用
  async delMyClient(session: Record<string, any>, body: { id: number }) {
    // 检查表单是否为空
    if (!body.id)
      throw new HttpException(
        { msg: 'ID 不能为空' },
        HttpStatus.EXPECTATION_FAILED,
      );

    // 验证数据安全性
    await isSafeData(body);

    // 获取用户ID
    const uid = session['uid'];

    // 检查body的id是否为该用户所拥有的
    const bI: { id: number; userId: number }[] = await db.query(
      'select id,userId from oauth_clients where id=?',
      [body.id],
    );

    const areAllUidsEqual = bI.every((item) => item.userId === uid);

    if (!areAllUidsEqual) throw new Error('你无权删除该应用');

    const d = await db.query('delete from oauth_clients where id=?', body.id);
    if (d.affectedRows !== 1) throw new Error('恭喜，你数据库没了');
    return {
      code: 200,
      msg: '删除成功',
      time: Date.now(),
    };
  }

  /**
   * 管理员接口
   */
  // 获取所有oauth2应用
  async allClients(
    page_: string,
    pageSize_: string,
    sortBy: string,
    sortDesc: string,
    search: string,
  ) {
    const { page, pageSize } = validateSearchQuery(page_, pageSize_);

    let totalCount = await db.query(
      'SELECT COUNT(*) as count FROM oauth_clients',
    );

    if (pageSize == -1) {
      const r = await db.query('select * from oauth_clients');
      return {
        code: 200,
        msg: '获取成功',
        time: Date.now(),
        data: {
          totalCount: Number(totalCount[0].count),
          totalPages: 1,
          users: r,
        },
      };
    }

    let totalPages = Math.ceil(Number(totalCount[0].count) / pageSize);

    // 排序方式
    const sortOrder = sortDesc === 'true' ? 'DESC' : 'ASC';

    // 根据什么排序
    sortBy = sortBy ? sortBy : 'id';

    // 查询语句
    let query = `SELECT * FROM oauth_clients`;

    // 构建搜索条件
    if (search) {
      const s = ` WHERE id LIKE '%${search}%' OR userId LIKE '%${search}%' OR name LIKE '%${search}%' OR secret LIKE '%${search}%' OR redirect LIKE '%${search}%' OR createdAt LIKE '%${search}%' OR updatedAt LIKE '%${search}%'`;
      query += s;
      totalCount = await db.query(
        `SELECT COUNT(*) as count FROM oauth_clients${s}`,
      );
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
      code: 200,
      msg: '获取成功',
      time: Date.now(),
      data: {
        totalCount: Number(totalCount[0].count),
        totalPages: totalPages,
        clients: r,
      },
    };
  }

  // 编辑指定oauth2应用
  async editClient(body: AdminEditOauthClient) {
    if (objIsEmpty(body))
      throw new HttpException(
        { msg: '请填写表单完整' },
        HttpStatus.EXPECTATION_FAILED,
      );
    const r = await db.query(
      'update oauth_clients set userId=?,name=?,secret=?,redirect=?,updatedAt=? where id=?',
      [body.userId, body.name, body.secret, body.redirect, new Date(), body.id],
    );
    if (r.affectedRows !== 1) throw new Error('恭喜，你数据库没了');
    return {
      code: 200,
      msg: '更新成功',
      time: Date.now(),
    };
  }

  // 删除指定的oauth2应用
  async deleteClient(body: { id: number }) {
    // 检查表单是否为空
    if (!body.id)
      throw new HttpException(
        { msg: 'ID 不能为空' },
        HttpStatus.EXPECTATION_FAILED,
      );

    const d = await db.query('delete from oauth_clients where id=?', body.id);
    if (d.affectedRows !== 1) throw new Error('恭喜，你数据库没了');
    return {
      code: 200,
      msg: '删除成功',
      time: Date.now(),
    };
  }

  // 重置客户端密钥
  async resetSecret(session: Record<string, any>, id: string) {
    // 获取用户ID
    const uid = session['uid'];

    // 检查id是否为该用户所拥有的
    const bI: { id: number; userId: number }[] = await db.query(
      'select id,userId from oauth_clients where id=?',
      [id],
    );

    const areAllUidsEqual = bI.every((item) => item.userId === uid);

    if (!areAllUidsEqual) throw new Error('你无权修改该应用');

    const r = await db.query('update oauth_clients set secret=? where id=?', [
      randomString(40),
      id,
    ]);
    if (r.affectedRows !== 1) throw new Error('恭喜，你数据库没了');
    return {
      code: 200,
      msg: '更新成功',
      time: Date.now(),
    };
  }
}
