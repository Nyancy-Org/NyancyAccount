import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, QueryOrder, EntityManager } from '@mikro-orm/core';
import { User } from 'src/entities/User';
import { UserIp } from 'src/entities/UserIp';
import bcrypt from 'bcryptjs';
import type { UpdateType } from './user.interface';
import {
  base64ToUint8Array,
  escapeWildcards,
  isEmail,
  uint8ArrayToBase64,
  validatePassword,
} from 'src/utils';
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
import type { AuthenticatorDevice } from '@simplewebauthn/types';
import config from 'src/services/config';
import {
  DeleteWanDto,
  LoginLogDto,
  UpdateApikeyDto,
  UpdateEmailDto,
  UpdateNameDto,
  UpdatePasswordDto,
  VerifyRegistrationDto,
} from './user.dto';

@Injectable()
export class UserService {
  constructor(
    readonly AuthService: AuthServices,
    @InjectRepository(User)
    readonly userRepository: EntityRepository<User>,
    @InjectRepository(UserIp)
    readonly userIpRepository: EntityRepository<UserIp>,
    protected readonly em: EntityManager,
  ) {}

  // 获取当前用户信息
  async info(session: Record<string, any>) {
    const user = await this.userRepository.findOne({ id: session.uid });
    if (!user) {
      throw new Error('User not found');
    }

    const lastLoginIp = await this.userIpRepository.findOne(
      { uid: session.uid },
      { orderBy: { time: QueryOrder.DESC } },
    );

    const r: User & {
      lastLoginTime: Date;
      lastLoginIp: string;
    } = {
      ...user,
      lastLoginIp: lastLoginIp?.ip,
      lastLoginTime: lastLoginIp?.time,
    };

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
      msg: '获取成功',
      data: r,
    };
  }

  // 根据更新类型来更新用户信息
  async update(session: Record<string, any>, type: UpdateType, body: any) {
    switch (type) {
      case 'name': {
        return await this.updateName(session, body as UpdateNameDto);
      }
      case 'email': {
        return await this.updateEmail(session, body as UpdateEmailDto);
      }
      case 'password': {
        return await this.updatePassword(session, body as UpdatePasswordDto);
      }
      case 'apikey': {
        return await this.updateApikey(session, body as UpdateApikeyDto);
      }
      default: {
        throw new Error('未知的类型');
      }
    }
  }

  // 更新用户名
  async updateName(session: Record<string, any>, body: UpdateNameDto) {
    const s = await this.userRepository.findOne({ email: session.email });
    if (!s) throw new Error('User not found');

    if (s.username === body.username)
      throw new Error('与原用户名相符，无需更改');
    await this.validateUName(body.username as string);
    const n = await this.userRepository.findOne({ username: body.username });

    if (n) throw new Error('该用户名已被占用，请换一个新的');
    s.username = body.username;

    await this.delete_wan(session, true);

    await this.em.flush();
    return {
      msg: '更新用户名成功',
    };
  }

  // 更新邮箱
  async updateEmail(session: Record<string, any>, body: UpdateEmailDto) {
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

    const n = await this.userRepository.findOne({ email: body.email });
    if (n) throw new Error('该邮箱已被其他用户绑定，请换一个新的');

    const user = await this.userRepository.findOne({ id: session.uid });
    if (!user) throw new Error('User not found');

    user.email = body.email;
    await this.em.flush();

    session['email'] = body.email;
    await this.delete_wan(session, true);
    return {
      msg: '更新邮箱成功',
    };
  }

  // 更新密码
  async updatePassword(session: Record<string, any>, body: UpdatePasswordDto) {
    const s = await this.userRepository.findOne({ id: session.uid });
    if (!s) throw new Error('User not found');

    if (!s.password) throw new Error('未设置密码');
    const compareResult = bcrypt.compareSync(body.password.old, s.password);
    if (!compareResult) throw new Error('原密码错误');
    validatePassword(body.password.new);
    body.password.new = bcrypt.hashSync(body.password.new, 10);

    s.password = body.password.new;
    await this.em.flush();

    return {
      msg: '更新密码成功',
    };
  }

  // 更新 Apikey
  async updateApikey(session: Record<string, any>, body: UpdateApikeyDto) {
    const user = await this.userRepository.findOne({ id: session.uid });
    if (!user) throw new Error('User not found');

    if (body.apikey === 'true') {
      let apikey;
      let isUnique = false;
      while (!isUnique) {
        apikey = this.createApiKey(32);
        const existingUser = await this.userRepository.findOne({ apikey });
        if (!existingUser) {
          isUnique = true;
        }
      }
      user.apikey = apikey;
    } else {
      user.apikey = 'undefined';
    }
    await this.em.flush();

    return {
      msg: '更新 Apikey 成功',
    };
  }

  // 生成 PassKey 配置项
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
      msg: '获取成功',
      data: options,
    };
  }

  // 验证PassKey
  async vRegOpt(session: Record<string, any>, body: VerifyRegistrationDto) {
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

      const user = await this.userRepository.findOne({ id: session.uid });
      if (!user) throw new Error('User not found');
      user.authDevice = JSON.stringify(devices);
      await this.em.flush();
    }

    session['NyaChallenge'] = undefined;

    return {
      msg: '验证成功',
      data: { verified },
    };
  }

  // 删除单个PassKey
  async delete_wan(
    session: Record<string, any>,
    deleteAll = false,
    body?: DeleteWanDto,
  ) {
    const { data: u } = await this.info_(session.uid);
    const devices: AuthenticatorDevice[] = u.authDevice
      ? JSON.parse(u.authDevice)
      : [];

    if (!deleteAll && devices.length === 0)
      throw new Error('未绑定任何PassKey');

    let filterDevices;
    if (body) {
      filterDevices = devices.filter(
        (a: any) => a.credentialID !== body.credentialID,
      );
    }

    const user = await this.userRepository.findOne({ id: session.uid });
    if (!user) throw new Error('User not found');

    user.authDevice = deleteAll
      ? undefined
      : filterDevices.length === 0
        ? undefined
        : JSON.stringify(filterDevices);
    await this.em.flush();

    return {
      msg: '删除成功',
    };
  }

  // 登录日志
  async loginLog(session: Record<string, any>, queryDto: LoginLogDto) {
    const { page, pageSize, sortBy, sortDesc, search } = queryDto;

    if (page <= 0 || pageSize < -1 || pageSize === 0) {
      throw new HttpException('参数有误', HttpStatus.EXPECTATION_FAILED);
    }

    const where: any = { uid: session['uid'] };
    if (search) {
      const escapedSearch = escapeWildcards(search);
      where['$or'] = [
        { ip: { $like: `%${escapedSearch}%` } },
        { location: { $like: `%${escapedSearch}%` } },
        { device: { $like: `%${escapedSearch}%` } },
      ];
    }

    const orderBy = {
      [sortBy || 'id']: sortDesc ? QueryOrder.DESC : QueryOrder.ASC,
    };

    if (pageSize == -1) {
      const [records, count] = await this.userIpRepository.findAndCount(where, {
        orderBy,
      });
      return {
        msg: '获取成功',
        data: {
          totalCount: count,
          totalPages: 1,
          records,
        },
      };
    }

    const [records, count] = await this.userIpRepository.findAndCount(where, {
      orderBy,
      limit: pageSize,
      offset: (page - 1) * pageSize,
    });

    return {
      msg: '获取成功',
      data: {
        totalCount: count,
        totalPages: Math.ceil(count / pageSize),
        records,
      },
    };
  }

  // （管理员接口）根据UID获取用户信息
  async info_(uid: string) {
    const r = await this.userRepository.findOne({ id: Number(uid) });
    return {
      msg: '获取成功',
      data: r,
    };
  }

  // 用户名格式验证
  async validateUName(uname: string) {
    // TODO: 判断禁止的用户名（待优化）
    if (uname === 'admin')
      throw new HttpException('禁止该用户名', HttpStatus.EXPECTATION_FAILED);

    if (!/^[a-zA-Z0-9_-]{4,16}$/.test(uname))
      throw new HttpException(
        '用户名或密码不符合规范',
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
