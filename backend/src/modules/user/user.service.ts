import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { db } from 'src/Service/mysql';
import bcrypt from 'bcryptjs';
import type { UserInfo, UpdateType, LoginIP } from './user.interface';
import {
  base64ToUint8Array,
  isEmail,
  uint8ArrayToBase64,
  validatePassword,
  validateSearchQuery,
} from 'src/Utils';
import { AuthService as AuthServices } from 'src/modules/auth/auth.service';
import {
  // Registration
  generateRegistrationOptions,
  verifyRegistrationResponse,
} from '@simplewebauthn/server';
import type {
  GenerateRegistrationOptionsOpts,
  VerifiedRegistrationResponse,
  VerifyRegistrationResponseOpts,
} from '@simplewebauthn/server';
import type {
  AuthenticatorDevice,
  RegistrationResponseJSON,
} from '@simplewebauthn/types';
import config from 'src/Service/config';

@Injectable()
export class UserService {
  constructor(readonly AuthService: AuthServices) {}

  // 获取当前用户信息
  async info(session: Record<string, any>) {
    const [r]: (UserInfo & {
      lastLoginTime: Date;
      lastLoginIp: string;
    })[] = await db.query(
      `SELECT user.*, user_ip.ip as lastLoginIp, user_ip.time as lastLoginTime
        FROM user 
        INNER JOIN user_ip ON user.id = user_ip.uid
        WHERE user.id = ?
  	    ORDER BY user_ip.time DESC`,
      [session.uid],
    );

    // 删除敏感信息
    delete r.password;
    delete r.verifyToken;
    r.authDevice
      ? (r.authDevice = JSON.parse(r.authDevice).map((obj: any) => ({
          credentialID: obj.credentialID,
        })))
      : (r.authDevice = null);

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

    await this.delete_wan(session, true);
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
    await this.delete_wan(session, true);
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

  // 生成 外部验证器 配置项
  async genRegOpt(session: Record<string, any>) {
    const { data: u } = await this.info_(session.uid);

    let devices: AuthenticatorDevice[] = [];
    if (u.authDevice) devices = JSON.parse(u.authDevice);

    const opts: GenerateRegistrationOptionsOpts = {
      rpName: config.webAuthn.rpName,
      rpID: config.webAuthn.rpID,
      userID: String(u.id),
      userName: u.username,
      timeout: 100000,
      attestationType: 'none',
      /**
       * Passing in a user's list of already-registered authenticator IDs here prevents users from
       * registering the same device multiple times. The authenticator will simply throw an error in
       * the browser if it's asked to perform registration when one of these ID's already resides
       * on it.
       * 在这里传入用户的已注册验证器ID列表可以防止用户多次注册同一设备。
       * 如果在其中一个ID已经存在的情况下，验证器被要求执行注册，那么它只会在浏览器中抛出一个错误。
       */
      excludeCredentials: devices.map((dev: any) => ({
        id: base64ToUint8Array(dev.credentialID),
        type: 'public-key',
        transports: dev.transports,
      })),
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred',
      },
      /**
       * Support the two most common algorithms: ES256, and RS256
       */
      supportedAlgorithmIDs: [-7, -257],
    };

    const options = await generateRegistrationOptions(opts);

    session['NyaChallenge'] = options.challenge;

    return {
      code: HttpStatus.OK,
      msg: '获取成功',
      time: Date.now(),
      data: options,
    };
  }

  // 验证外部验证器
  async vRegOpt(session: Record<string, any>, body: RegistrationResponseJSON) {
    const { data: u } = await this.info_(session.uid);

    let devices: AuthenticatorDevice[] = [];
    if (u.authDevice) devices = JSON.parse(u.authDevice);

    let verification: VerifiedRegistrationResponse;
    try {
      const opts: VerifyRegistrationResponseOpts = {
        response: body,
        expectedChallenge: session['NyaChallenge'],
        expectedOrigin: config.webAuthn.expectedOrigin,
        expectedRPID: config.webAuthn.rpID,
        requireUserVerification: false,
      };
      verification = await verifyRegistrationResponse(opts);
    } catch (err: any) {
      console.error(err);
      throw new Error(err.message);
    }

    const { verified, registrationInfo } = verification;

    if (verified && registrationInfo) {
      const { credentialPublicKey, credentialID, counter } = registrationInfo;

      // 诶嘿，魔法~
      const newDevice: any = {
        credentialPublicKey: uint8ArrayToBase64(credentialPublicKey),
        credentialID: uint8ArrayToBase64(credentialID),
        counter,
        transports: body.response.transports,
      };
      devices.push(newDevice);
      const r = await db.query('update user set authDevice=? where id=?', [
        JSON.stringify(devices),
        session.uid,
      ]);
      if (r.affectedRows !== 1) throw new Error('恭喜，你数据库没了');
    }

    session['NyaChallenge'] = undefined;

    return {
      code: HttpStatus.OK,
      msg: '验证成功',
      time: Date.now(),
      data: { verified },
    };
  }

  // 删除单个外部验证器
  async delete_wan(
    session: Record<string, any>,
    deleteAll = false,
    body?: { credentialID: string },
  ) {
    const { data: u } = await this.info_(session.uid);
    const devices: AuthenticatorDevice[] = u.authDevice
      ? JSON.parse(u.authDevice)
      : [];

    if (devices.length === 0) throw new Error('未绑定任何外部验证器');

    const filterDevices = devices.filter(
      (a: any) => a.credentialID !== body.credentialID,
    );

    const r = await db.query('update user set authDevice=? where id=?', [
      deleteAll
        ? null
        : filterDevices.length === 0
          ? null
          : JSON.stringify(filterDevices),
      session.uid,
    ]);
    if (r.affectedRows !== 1) throw new Error('恭喜，你数据库没了');

    return {
      code: HttpStatus.OK,
      msg: '删除成功',
      time: Date.now(),
    };
  }

  // 登录日志
  async loginLog(
    session: Record<string, any>,
    page_: string,
    pageSize_: string,
    sortBy: string,
    sortDesc: string,
    search: string,
  ) {
    const { page, pageSize } = validateSearchQuery(page_, pageSize_);

    let totalCount = await db.query(
      'SELECT COUNT(*) as count FROM user_ip where uid=?',
      [session['uid']],
    );

    if (pageSize == -1) {
      const r: Omit<LoginIP, 'uid'>[] = await db.query(
        'select id, ip, location, device, time FROM user_ip where uid=?',
        [session['uid']],
      );
      return {
        code: HttpStatus.OK,
        msg: '获取成功',
        time: Date.now(),
        data: {
          totalCount: Number(totalCount[0].count),
          totalPages: 1,
          records: r,
        },
      };
    }

    let totalPages = Math.ceil(Number(totalCount[0].count) / pageSize);

    // 排序方式
    const sortOrder = sortDesc === 'true' ? 'DESC' : 'ASC';

    // 根据什么排序
    sortBy = sortBy ? sortBy : 'id';

    // 查询语句
    let query = `SELECT id, ip, location, device, time FROM user_ip`;

    // 构建搜索条件
    if (search) {
      const s = ` WHERE id LIKE '%${search}%' OR ip LIKE '%${search}%' OR location LIKE '%${search}%' OR device LIKE '%${search}%' OR time LIKE '%${search}%'`;
      query += s;
      totalCount = await db.query(`SELECT COUNT(*) as count FROM user_ip${s}`);
      totalPages = Math.ceil(Number(totalCount[0].count) / pageSize);
    } else {
      query += ` WHERE uid = '${session['uid']}'`;
    }

    if (totalPages !== 0 && page > totalPages) throw new Error('超出页数');
    const offset = (page - 1) * pageSize;

    // 构建排序条件
    query += ` ORDER BY ${sortBy} ${sortOrder}`;

    // 添加翻页限制
    query += ` LIMIT ${pageSize} OFFSET ${offset}`;

    const r: Omit<LoginIP, 'uid'> = await db.query(query);

    return {
      code: HttpStatus.OK,
      msg: '获取成功',
      time: Date.now(),
      data: {
        totalCount: Number(totalCount[0].count),
        totalPages,
        records: r,
      },
    };
  }

  // （管理员接口）根据UID获取用户信息
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
