import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { db } from 'src/Service/mysql';
import bcrypt from 'bcryptjs';
import { timeUuid } from 'src/Utils/uuid';
import { logger } from 'src/Utils/log';
import type { LoginForm, RegForm } from './auth.interface';
import { MailCodeType, MailLinkType } from './auth.interface';
import type { UserInfo } from 'src/user/user.interface';
import { emailTemplate, isEmail } from 'src/Utils';
import type { Request } from 'express';

@Injectable()
export class AuthService {
  // 登录
  async login(session: Record<string, any>, req: Request, body: LoginForm) {
    const a = await this.loginValidateData(body);
    if (!a.status) {
      throw new HttpException(
        {
          msg: '用户名或密码不符合规范',
        },
        HttpStatus.EXPECTATION_FAILED,
      );
    }
    let r: UserInfo[];
    if (a.type === 'default') {
      r = await db.query('select * from user where binary username=?', [
        body.username,
      ]);
    } else {
      r = await db.query('select * from user where binary email=?', [
        body.username,
      ]);
    }

    // 如果没有找到这个用户或者用户名密码错误
    if (r[0] === undefined || !bcrypt.compareSync(body.password, r[0].password))
      throw new HttpException(
        {
          msg: '用户名或密码错误',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

    // 如果被封了
    if (r[0].status == -1)
      throw new Error('你已被封禁，禁止登录。详情请联系管理员');

    // 登陆成功
    // 记录登录IP
    const ip = req.headers['x-real-ip'] || req.socket.remoteAddress;
    const loginTime = Date.now().toString();
    await db.query(
      'update user set lastLoginTime=?, lastLoginIp=? where id=?',
      [loginTime, ip, r[0].id],
    );

    r[0].lastLoginIp = ip as string;
    r[0].lastLoginTime = loginTime;
    // 删除密码再发送给客户端
    delete r[0].password;
    delete r[0].verifyToken;

    session['login'] = true;
    session['uid'] = r[0].id;
    session['email'] = r[0].email;

    return {
      code: HttpStatus.OK,
      msg: '登陆成功',
      time: Date.now(),
      data: r[0],
    };
  }

  // 检查邮箱可用性
  async checkEmail(body: { email: string }) {
    // 邮箱格式不正确
    isEmail(body.email);

    // 查询邮箱是否被占用
    const e: UserInfo[] = await db.query(
      'select * from user where binary email=?',
      [body.email],
    );

    // 邮箱已存在在
    if (e[0] != undefined) throw new Error('该邮箱已被注册！');

    // 邮箱可用
    return {
      code: HttpStatus.OK,
      msg: '恭喜，该邮箱可用~',
      time: Date.now(),
    };
  }

  // 检查用户名可用性
  async checkUserName(body: { username: string }) {
    const r: UserInfo[] = await db.query(
      'select * from user where binary username=?',
      [body.username],
    );
    if (r[0] != undefined) throw new Error('该用户名已被占用！');

    return {
      code: HttpStatus.OK,
      msg: '恭喜，该用户名可用~',
      time: Date.now(),
    };
  }

  // 注册
  async register(session: Record<string, any>, body: RegForm) {
    // 检查是否允许注册
    await this.allowReg();

    // 检查传进来的数据是否合法
    const a = await this.regValidateData(body);
    if (!a) {
      throw new HttpException(
        {
          msg: '用户名或密码不符合规范',
        },
        HttpStatus.EXPECTATION_FAILED,
      );
    }

    // 验证邮箱是否被占用
    await this.checkEmail({ email: body.email });

    // 验证用户名否被占用
    await this.checkUserName({ username: body.username });

    // 验证验证码
    await this.verifyEmailCode(session, body.email, body.code, 'reg');

    // 开始注册
    // 插入新用户
    let i;
    try {
      i = await db.query(
        'insert into user (username,password,email,status,role,regTime) values (?,?,?,?,?,?)',
        [
          body.username,
          bcrypt.hashSync(body.password, 10),
          body.email,
          0,
          'default',
          Date.now(),
        ],
      );
    } catch (err) {
      logger.error(err.message);
      throw new Error('注册失败，请联系网站管理员');
    }

    if (i.affectedRows === 1) {
      // 写入统计数据
      const formattedDate = new Date().toISOString().split('T')[0];
      await db.query(
        'INSERT INTO daily_statistics (date, count) VALUES (?, 1) ON DUPLICATE KEY UPDATE count = count + 1',
        [formattedDate],
      );

      return {
        code: HttpStatus.OK,
        msg: '好耶，你注册成功了~',
        time: Date.now(),
      };
    } else {
      throw new Error('注册失败，请联系网站管理员');
    }
  }

  // 登出
  async logout(session: Record<string, any>) {
    if (!session.login) throw new Error('登出失败，你tm是不是没登陆？');
    session.destroy();
    return {
      code: HttpStatus.OK,
      msg: '登出成功',
      time: Date.now(),
    };
  }

  // 创建验证邮箱验证码
  async createVerifyEmailCode(
    session: Record<string, any>,
    receiver: string,
    type: string,
  ) {
    // 验证验证码类型
    if (!type || MailCodeType.findIndex((i) => i === type) === -1)
      throw new Error('未知的验证码类型');

    // 验证邮箱格式
    isEmail(receiver);

    // 生成6位数验证码
    const verifyCode = Math.random().toString().slice(3, 9).toUpperCase();
    session[type] = {
      email: receiver,
      code: verifyCode,
      expire: Date.now() + 60 * 5000, // 5min之后过期
    };

    const email = {
      to: receiver, // 发给谁？
      subject: 'Nyancy | 邮箱验证', // 邮件标题
      html: await emailTemplate(type, verifyCode),
    };

    return email;
  }

  // 验证邮箱验证码（新用户注册，更改密码）
  async verifyEmailCode(
    session: Record<string, any>,
    email: string,
    code: string,
    type: string,
  ) {
    // 验证验证码类型
    if (!type || MailCodeType.findIndex((i) => i === type) === -1)
      throw new Error('未知的验证码类型');

    if (!session[type]) throw new Error('验证码不正确');
    if (email !== session[type].email) throw new Error('邮箱不对应！');
    if (code != session[type].code) throw new Error('验证码不正确');
    if (Date.now() > session[type].expire) {
      session[type] = null;
      throw new Error('该验证码已过期，请重新获取');
    }
    session[type] = null;
    return {
      code: HttpStatus.OK,
      msg: '验证码验证成功！',
      time: Date.now(),
    };
  }

  // 创建验证邮箱验证地址
  async createVerifyEmail(receiver: string, type: string) {
    // 验证验证码类型
    if (!type || MailLinkType.findIndex((i) => i === type) === -1)
      throw new Error('未知的验证码类型');

    // 验证邮箱格式
    isEmail(receiver);

    // 判断这个邮箱是否被注册
    const [u]: UserInfo[] = await db.query(
      'select * from user where binary email=?',
      [receiver],
    );
    if (!u) throw new Error('该邮箱未注册');

    // 如果有，那就生成验证链接，以及把uuid存入数据库后面进行比对
    const t_uuid = timeUuid();

    const r = await db.query('update user set verifyToken=? where id=?', [
      t_uuid,
      u.id,
    ]);
    if (r.affectedRows !== 1) throw new Error('恭喜，数据库没了');

    const email = {
      to: receiver,
      subject: 'Nyancy | 邮箱验证',
      html: await emailTemplate(type, t_uuid),
    };
    return email;
  }

  // 验证邮箱地址（适用于忘记密码）
  async verifyEmailLink(body: RegForm) {
    // 首先判断和数据库里面的是否相符
    const [dc] = await db.query(
      'select id from user where binary verifyToken=?',
      body.code,
    );
    if (!dc) throw new Error('验证链接已过期或不存在！');

    // 取出code里面的时间
    const date2 = Number(
      body.code.substring(body.code.length - 13, body.code.length),
    );
    const date1 = new Date().getTime();

    // 算出已经过去了10分钟没有
    const d = Math.floor(Math.abs(date2 - date1) / 60000);
    if (d > 10) {
      await db.query('update user set verifyToken=? where id=?', [null, dc.id]);
      throw new Error('验证链接已过期！');
    }

    // 没有？那就是验证成功了
    await db.query('update user set verifyToken=? where id=?', [null, dc.id]);

    return {
      code: HttpStatus.OK,
      msg: '邮箱验证成功！',
      time: Date.now(),
    };
  }

  // 重置密码
  async resetPasswd(body: RegForm) {
    // 先验证密码是否合法
    const a = await this.regValidateData(body);
    if (!a) {
      throw new HttpException(
        {
          msg: '新密码不符合规范！',
        },
        HttpStatus.EXPECTATION_FAILED,
      );
    }

    // 获取被重置密码的邮箱
    const [dc]: { email: string }[] = await db.query(
      'select email from user where binary verifyToken=?',
      body.code,
    );
    if (!dc) throw new Error('验证链接已过期或不存在！');
    const thisEmail = dc.email;

    // 验证重置地址是否过期
    await this.verifyEmailLink(body);

    // OK，开始更新密码
    const r = await db.query('update user set password=? where email=?', [
      bcrypt.hashSync(body.password, 10),
      thisEmail,
    ]);

    if (r.affectedRows !== 1)
      throw new Error('发生了未知错误，请联系网站管理员');

    return {
      code: HttpStatus.OK,
      msg: '密码重置成功',
      time: Date.now(),
    };
  }

  // 登录表单验证，顺便判断是用户名还是邮箱登录
  async loginValidateData(body: LoginForm) {
    const uname = body.username;
    const passwd = body.password;

    if (!uname || !passwd)
      throw new HttpException(
        {
          msg: '请填写表单完整',
        },
        HttpStatus.EXPECTATION_FAILED,
      );

    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(uname)) {
      return {
        status:
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(uname) &&
          /^[a-zA-Z0-9!@#$%^&*()_+\-=[\]{}|\\:;"'<>,.?/~`]{6,20}$/.test(passwd),
        type: 'email',
      };
    } else {
      return {
        status:
          /^[a-zA-Z0-9_-]{4,16}$/.test(uname) &&
          /^[a-zA-Z0-9!@#$%^&*()_+\-=[\]{}|\\:;"'<>,.?/~`]{6,20}$/.test(passwd),
        type: 'default',
      };
    }
  }

  // 注册表单验证
  async regValidateData(body: RegForm) {
    const uname = body.username;
    const passwd = body.password;
    const email = body.email;
    const code = body.code;

    if (!uname || !passwd || !email || !code)
      throw new HttpException(
        {
          msg: '请填写表单完整',
        },
        HttpStatus.EXPECTATION_FAILED,
      );

    // 判断禁止的用户名
    if (uname === 'admin')
      throw new HttpException(
        {
          msg: '禁止该用户名',
        },
        HttpStatus.EXPECTATION_FAILED,
      );

    // 邮箱格式不正确
    isEmail(email);

    return (
      /^[a-zA-Z0-9_-]{4,16}$/.test(uname) &&
      /^[a-zA-Z0-9!@#$%^&*()_+\-=[\]{}|\\:;"'<>,.?/~`]{6,20}$/.test(passwd)
    );
  }

  // 是否允许注册
  async allowReg() {
    const a = await db.query(
      'select * from site where binary optionName = "allowReg"',
    );
    if (a[0].value === 'false') {
      throw new HttpException(
        {
          msg: '本站已关闭用户注册功能！',
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    } else {
      return true;
    }
  }
}
