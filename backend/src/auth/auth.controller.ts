import {
  Controller,
  HttpCode,
  Session,
  Post,
  Body,
  HttpStatus,
} from '@nestjs/common';
import { AuthService as AuthServices } from './auth.service';
import { MailerService as MailerServices } from 'src/Service/mailer';
import { RateLimit } from 'nestjs-rate-limiter';
import type { LoginForm, RegForm } from './auth.interface';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly AuthService: AuthServices,
    private readonly MailerService: MailerServices,
  ) {}

  @Post('login')
  @HttpCode(200)
  login(@Session() session: Record<string, any>, @Body() body: LoginForm) {
    return this.AuthService.login(session, body);
  }

  @Post('register')
  @HttpCode(200)
  register(@Session() session: Record<string, any>, @Body() body: RegForm) {
    return this.AuthService.register(session, body);
  }

  @Post('logout')
  @HttpCode(200)
  logout(@Session() session: Record<string, any>) {
    return this.AuthService.logout(session);
  }

  // 检查邮箱占用
  @Post('checkEmail')
  @HttpCode(200)
  checkEmail(@Body() body: { email: string }) {
    return this.AuthService.checkEmail(body);
  }

  // 检查用户名占用
  @Post('checkUserName')
  @HttpCode(200)
  checkUserName(@Body() body: { username: string }) {
    return this.AuthService.checkUserName(body);
  }

  // 发送邮箱验证码
  @RateLimit({
    keyPrefix: 'sendEmailCode',
    points: 1,
    duration: 60,
    blockDuration: 60,
  })
  @Post('sendEmailCode')
  @HttpCode(200)
  async sendVerificationEmailCode(
    @Session() session: Record<string, any>,
    @Body() body: { email: string; type: string },
  ) {
    const email = await this.AuthService.createVerifyEmailCode(
      session,
      body.email,
      body.type,
    );

    try {
      await this.MailerService.sendVerificationEmail(email);
    } catch (err) {
      throw new Error(err.message);
    }

    return {
      code: HttpStatus.OK,
      msg: '邮件发送成功',
      time: Date.now(),
    };
  }

  // 发送邮箱验证地址
  @RateLimit({
    keyPrefix: 'sendEmailLink',
    points: 1,
    duration: 60, // 间隔60s
    blockDuration: 60, // 如果60s内再次触发就是60s
  })
  @Post('sendEmailLink')
  @HttpCode(200)
  async sendVerificationEmail(@Body() body: { email: string; type: string }) {
    const email = await this.AuthService.createVerifyEmail(
      body.email,
      body.type,
    );

    try {
      await this.MailerService.sendVerificationEmail(email);
    } catch (err) {
      throw new Error(err.message);
    }

    return {
      code: HttpStatus.OK,
      msg: '邮件发送成功',
      time: Date.now(),
    };
  }

  // 重置密码
  @Post('reset')
  @HttpCode(200)
  verifyEmail(@Body() body: RegForm) {
    if (!body.code || body.code === 'undefined') throw new Error(':(');
    return this.AuthService.resetPasswd(body);
  }
}
