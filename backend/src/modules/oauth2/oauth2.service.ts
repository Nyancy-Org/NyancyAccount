import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import {
  EntityRepository,
  EntityManager,
  wrap,
  serialize,
} from '@mikro-orm/core';
import { randomString, escapeLikeWildcards } from '@/Utils';
import {
  OauthBodyDto,
  NewOauthClientDto,
  EditOauthClientDto,
  AdminEditOauthClientDto,
  OauthClientIdDto,
} from './oauth2.dto';
import { OauthClient } from '@/entities/OauthClient';
import { OauthAuthCode } from '@/entities/OauthAuthCode';
import { OauthAccessToken } from '@/entities/OauthAccessToken';
import { OauthRefreshToken } from '@/entities/OauthRefreshToken';
import { User } from '@/entities/User';

@Injectable()
export class Oauth2Service {
  constructor(
    @InjectRepository(OauthClient)
    private readonly oauthClientRepository: EntityRepository<OauthClient>,
    @InjectRepository(OauthAuthCode)
    private readonly oauthAuthCodeRepository: EntityRepository<OauthAuthCode>,
    @InjectRepository(OauthAccessToken)
    private readonly oauthAccessTokenRepository: EntityRepository<OauthAccessToken>,
    @InjectRepository(OauthRefreshToken)
    private readonly oauthRefreshTokenRepository: EntityRepository<OauthRefreshToken>,
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
    private readonly em: EntityManager,
  ) {}

  // 获取应用信息
  async clientInfo(clientId: string, isInternal = false) {
    // 从数据库中查询
    const o = await this.oauthClientRepository.findOne({
      id: Number(clientId),
    });

    if (!o) throw new Error('客户端不存在');

    // 删除敏感信息
    if (!isInternal) {
      return {
        msg: '获取成功',
        data: {
          id: o.id,
          name: o.name,
          createdAt: o.createdAt,
        },
      };
    }

    return {
      msg: '获取成功',
      data: serialize(o),
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
    const { data: o } = await this.clientInfo(client_id, true);

    if (o.redirect !== redirect_uri)
      throw new HttpException('重定向Url不匹配', HttpStatus.EXPECTATION_FAILED);

    // 获取用户ID
    const u = await this.userRepository.findOne({ id: session['uid'] });
    if (!u) throw new Error('用户不存在');

    // 判断该用户是否存在 code
    const ac = await this.oauthAuthCodeRepository.find({ userId: u.id });

    // 如果存在,则删除之前的 code
    if (ac.length > 0) {
      await this.oauthAuthCodeRepository.nativeDelete({ userId: u.id });
    }

    // 生成授权 Code
    const code = '0' + randomString(66).toLowerCase() + Date.now();

    try {
      const newCode = this.oauthAuthCodeRepository.create({
        id: code,
        userId: u.id,
        clientId: o.id,
        scopes: null,
        expiredAt: new Date(Date.now() + 60 * 3000), //三分钟后过期
      });
      await this.em.persist(newCode).flush();
    } catch (e) {
      Logger.error(e);
      throw e;
    }

    // 返回授权code
    return {
      msg: '获取成功',
      data: {
        state,
        code,
      },
    };
  }

  // 验证code,返回token
  async getToken(session: Record<string, any>, body: OauthBodyDto) {
    // 数据库比对client是否存在
    const oc = await this.oauthClientRepository.findOne({
      id: body.client_id,
    });

    if (!oc) throw new Error('客户端不存在');

    if (oc.secret !== body.client_secret) throw new Error('客户端密钥错误');

    if (oc.redirect !== body.redirect_uri)
      throw new Error('重定向 Url 地址错误');

    // 检查code是否存在
    const ac = await this.oauthAuthCodeRepository.findOne({ id: body.code });

    if (!ac) throw new Error('Code 不存在');

    // 检查 code 是否过期
    // 目标时间
    const targetTime = new Date(ac.expiredAt);
    // 当前时间
    const currentTime = new Date();
    if (targetTime < currentTime) {
      // 过期了就删除
      await this.oauthAuthCodeRepository.nativeDelete({ id: body.code });
      throw new HttpException('Code 已过期', HttpStatus.PRECONDITION_FAILED);
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
    try {
      const newAccessToken = this.oauthAccessTokenRepository.create({
        id: accessToken,
        userId: ac.userId,
        clientId: ac.clientId,
        scopes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        expiredAt: AtExpiredAt,
      });

      const newRefreshToken = this.oauthRefreshTokenRepository.create({
        id: refreshToken,
        access_token_id: accessToken,
        expiredAt: new Date(new Date().setDate(new Date().getDate() + 30)), //30天后过期
      });

      await this.em.persist([newAccessToken, newRefreshToken]).flush();
    } catch (e) {
      Logger.error(e);

      throw e;
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
    const act = await this.oauthAccessTokenRepository.findOne({
      id: accessToken,
    });

    if (!act)
      throw new HttpException(
        'access_token 已过期',
        HttpStatus.PRECONDITION_FAILED,
      );

    // 目标时间
    const targetTime = new Date(act.expiredAt);

    // 获取当前时间
    const currentTime = new Date();

    if (targetTime < currentTime) {
      // 过期了就删除
      await this.oauthAccessTokenRepository.nativeDelete({ id: accessToken });
      throw new HttpException(
        'access_token 已过期',
        HttpStatus.PRECONDITION_FAILED,
      );
    }

    // 获取用户信息
    const r = await this.userRepository.findOne({ id: act.userId });
    if (!r) throw new Error('用户不存在');

    const u = serialize(r);
    delete u.password;
    delete u.verifyToken;
    delete u.apikey;
    delete u.authDevice;
    return {
      msg: '获取成功',
      data: u,
    };
  }

  /**
   * 个人用户
   */
  // 获取自己创建的oauth2应用
  async myClients(session: Record<string, any>) {
    // 根据id查找应用
    const c = await this.oauthClientRepository.find({ userId: session['uid'] });

    return {
      msg: '获取成功',
      // data: c.map((client) => wrap(client).toPOJO()),
      data: serialize(c),
    };
  }

  // 新建一个oauth2应用
  async createClient(session: Record<string, any>, body: NewOauthClientDto) {
    // // 检查表单是否为空
    // if (!body.name)
    //   throw new HttpException('请填写应用名', HttpStatus.EXPECTATION_FAILED);
    // if (body.name.length > 32)
    //   throw new HttpException('应用名过长！', HttpStatus.EXPECTATION_FAILED);
    // if (!body.redirect)
    //   throw new HttpException('请填写回调Url', HttpStatus.EXPECTATION_FAILED);
    // if (body.redirect.length > 2333)
    //   throw new HttpException(
    //     '重定向地址过长！',
    //     HttpStatus.EXPECTATION_FAILED,
    //   );

    // 验证数据安全性
    // await isSafeData(body);

    // 获取用户ID
    const uid = session['uid'];

    try {
      const newClient = this.oauthClientRepository.create({
        userId: uid,
        name: body.name,
        secret: randomString(40),
        redirect: body.redirect,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await this.em.persist(newClient).flush();
    } catch (e) {
      throw e;
    }

    return {
      msg: '添加成功',
    };
  }

  // 编辑自己的oauth2应用
  async editMyClient(session: Record<string, any>, body: EditOauthClientDto) {
    // // 检查表单是否为空
    // if (!body.id)
    //   throw new HttpException('ID 不能为空', HttpStatus.EXPECTATION_FAILED);
    // if (String(body.id).length > 10)
    //   throw new HttpException('ID 过长！', HttpStatus.EXPECTATION_FAILED);
    // if (!body.name)
    //   throw new HttpException('请填写应用名', HttpStatus.EXPECTATION_FAILED);
    // if (body.name.length > 32)
    //   throw new HttpException('应用名过长！', HttpStatus.EXPECTATION_FAILED);

    // if (!body.redirect)
    //   throw new HttpException('请填写回调Url', HttpStatus.EXPECTATION_FAILED);
    // if (body.redirect.length > 2333)
    //   throw new HttpException(
    //     '重定向地址过长！',
    //     HttpStatus.EXPECTATION_FAILED,
    //   );

    // // 验证数据安全性
    // await isSafeData(body);

    // 获取用户ID
    const uid = session['uid'];

    // 检查body的id是否为该用户所拥有的
    const client = await this.oauthClientRepository.findOne({ id: body.id });

    if (!client) throw new Error('应用不存在');
    if (client.userId !== uid) throw new Error('你无权修改该应用');

    client.name = body.name;
    client.redirect = body.redirect;
    client.updatedAt = new Date();

    await this.em.flush();

    return {
      msg: '更新成功',
    };
  }

  // 删除自己的oauth2应用
  async delMyClient(session: Record<string, any>, body: OauthClientIdDto) {
    // 检查表单是否为空
    // if (!body.id)
    //   throw new HttpException('ID 不能为空', HttpStatus.EXPECTATION_FAILED);

    // 验证数据安全性
    // await isSafeData(body);

    // 获取用户ID
    const uid = session['uid'];

    // 检查body的id是否为该用户所拥有的
    const client = await this.oauthClientRepository.findOne({ id: body.id });

    if (!client) throw new Error('应用不存在');
    if (client.userId !== uid) throw new Error('你无权删除该应用');

    await this.oauthClientRepository.nativeDelete({ id: body.id });

    return {
      msg: '删除成功',
    };
  }

  /**
   * 管理员接口
   */
  // 获取所有oauth2应用
  async allClients(
    page: number,
    pageSize: number,
    sortBy: keyof OauthClient,
    sortDesc?: boolean,
    search?: string,
  ) {
    // const { page, pageSize } = validateSearchQuery(page_, pageSize_);

    if (pageSize == -1) {
      const [clients, count] = await this.oauthClientRepository.findAndCount(
        {},
      );
      return {
        msg: '获取成功',
        data: {
          totalCount: count,
          totalPages: 1,
          users: clients.map((client) => wrap(client).toPOJO()),
        },
      };
    }

    // 排序方式
    const orderBy = { [sortBy || 'id']: sortDesc ? 'DESC' : 'ASC' };

    // 构建搜索条件
    const where: any = {};
    if (search) {
      const escapedSearch = escapeLikeWildcards(search);
      where.$or = [
        { name: { $like: `%${escapedSearch}%` } },
        { secret: { $like: `%${escapedSearch}%` } },
        { redirect: { $like: `%${escapedSearch}%` } },
      ];

      // 如果搜索内容是数字，添加id和userId搜索
      if (!isNaN(Number(search))) {
        where.$or.push({ id: Number(search) });
        where.$or.push({ userId: Number(search) });
      }
    }

    const [clients, totalCount] = await this.oauthClientRepository.findAndCount(
      where,
      {
        orderBy: orderBy as any,
        limit: pageSize,
        offset: (page - 1) * pageSize,
      },
    );

    const totalPages = Math.ceil(totalCount / pageSize);

    if (totalPages !== 0 && page > totalPages) throw new Error('超出页数');

    return {
      msg: '获取成功',
      data: {
        totalCount: totalCount,
        totalPages: totalPages,
        clients: clients.map((client) => wrap(client).toPOJO()),
      },
    };
  }

  // 编辑指定oauth2应用
  async editClient(body: AdminEditOauthClientDto) {
    // if (objIsEmpty(body))
    //   throw new HttpException('请填写表单完整', HttpStatus.EXPECTATION_FAILED);

    const client = await this.oauthClientRepository.findOne({ id: body.id });
    if (!client) throw new Error('应用不存在');

    client.userId = body.userId;
    client.name = body.name;
    client.secret = body.secret;
    client.redirect = body.redirect;
    client.updatedAt = new Date();

    await this.em.flush();

    return {
      msg: '更新成功',
    };
  }

  // 删除指定的oauth2应用
  async deleteClient(body: OauthClientIdDto) {
    // 检查表单是否为空
    // if (!body.id)
    //   throw new HttpException('ID 不能为空', HttpStatus.EXPECTATION_FAILED);

    await this.oauthClientRepository.nativeDelete({ id: body.id });

    return {
      msg: '删除成功',
    };
  }

  // 重置客户端密钥
  async resetSecret(session: Record<string, any>, id: number) {
    // 获取用户ID
    const uid = session['uid'];

    // 检查id是否为该用户所拥有的
    const client = await this.oauthClientRepository.findOne({ id });

    if (!client) throw new Error('应用不存在');
    if (client.userId !== uid) throw new Error('你无权修改该应用');

    client.secret = randomString(40);
    await this.em.flush();

    return {
      msg: '更新成功',
    };
  }
}
